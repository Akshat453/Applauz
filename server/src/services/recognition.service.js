const prisma = require("../config/db");

const recognitionWriteHelpers = {
  async incrementManagerBudgetUsage({ tx, budgetId, pointsAwarded }) {
    return tx.pointBudget.update({
      where: {
        id: budgetId,
      },
      data: {
        used_points: {
          increment: pointsAwarded,
        },
      },
    });
  },
};

function buildRecognitionInclude() {
  return {
    sender: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    receiver: {
      select: {
        id: true,
        name: true,
        email: true,
        department_id: true,
        manager_id: true,
        points_balance: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    category: true,
    approver: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  };
}

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listRecognitionCategories() {
  return prisma.recognitionCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

async function getRecognitionForReview({ tx, recognitionId }) {
  const recognition = await tx.recognition.findUnique({
    where: {
      id: recognitionId,
    },
    include: buildRecognitionInclude(),
  });

  if (!recognition) {
    throw createServiceError("RECOGNITION_NOT_FOUND", 404);
  }

  if (recognition.status !== "pending") {
    throw createServiceError("RECOGNITION_NOT_PENDING", 400);
  }

  return recognition;
}

function assertReviewerCanReviewRecognition({
  recognition,
  approverRoleName,
  approverUserId,
}) {
  if (
    approverRoleName === "Manager"
    && recognition.receiver.manager_id !== approverUserId
  ) {
    throw createServiceError("FORBIDDEN_RECOGNITION_REVIEW", 403);
  }
}

async function createRecognition({
  senderId,
  receiverId,
  categoryId,
  message,
}) {
  if (senderId === receiverId) {
    throw createServiceError("SELF_RECOGNITION_NOT_ALLOWED", 400);
  }

  const receiver = await prisma.user.findUnique({
    where: {
      id: receiverId,
    },
  });

  if (!receiver) {
    throw createServiceError("RECEIVER_NOT_FOUND", 400);
  }

  if (categoryId) {
    const category = await prisma.recognitionCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw createServiceError("CATEGORY_NOT_FOUND", 400);
    }
  }

  return prisma.recognition.create({
    data: {
      sender_id: senderId,
      receiver_id: receiverId,
      category_id: categoryId ?? null,
      message,
      points_recommended: null,
      status: "pending",
      visibility: "public",
    },
    include: buildRecognitionInclude(),
  });
}

async function listRecognitions({ page, limit, departmentId }) {
  const skip = (page - 1) * limit;
  const where = {
    visibility: "public",
    ...(departmentId
      ? {
          receiver: {
            department_id: departmentId,
          },
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.recognition.count({ where }),
    prisma.recognition.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        {
          created_at: "desc",
        },
        {
          id: "desc",
        },
      ],
      include: buildRecognitionInclude(),
    }),
  ]);

  return {
    page,
    limit,
    total,
    items,
  };
}

async function listPendingRecognitionsForReviewer({ userId, roleName }) {
  const where = {
    status: "pending",
    ...(roleName === "HR"
      ? {}
      : {
          receiver: {
            manager_id: userId,
          },
        }),
  };

  const items = await prisma.recognition.findMany({
    where,
    orderBy: [
      {
        created_at: "desc",
      },
      {
        id: "desc",
      },
    ],
    include: buildRecognitionInclude(),
  });

  if (roleName === "HR") {
    return {
      items,
      budget: null,
    };
  }

  const budget = await prisma.pointBudget.findFirst({
    where: {
      manager_id: userId,
      period_start: {
        lte: new Date(),
      },
      period_end: {
        gte: new Date(),
      },
    },
    orderBy: {
      period_start: "desc",
    },
  });

  return {
    items,
    budget: budget
      ? {
          id: budget.id,
          allocatedPoints: budget.allocated_points,
          usedPoints: budget.used_points,
          remainingPoints: budget.allocated_points - budget.used_points,
          periodStart: budget.period_start,
          periodEnd: budget.period_end,
        }
      : null,
  };
}

async function approveRecognition({
  recognitionId,
  approverUserId,
  approverRoleName,
  pointsAwarded,
}) {
  return prisma.$transaction(async (tx) => {
    const recognition = await getRecognitionForReview({
      tx,
      recognitionId,
    });

    assertReviewerCanReviewRecognition({
      recognition,
      approverRoleName,
      approverUserId,
    });

    let budget = null;

    if (approverRoleName === "Manager") {
      budget = await tx.pointBudget.findFirst({
        where: {
          manager_id: approverUserId,
          period_start: {
            lte: new Date(),
          },
          period_end: {
            gte: new Date(),
          },
        },
        orderBy: {
          period_start: "desc",
        },
      });

      if (!budget) {
        throw createServiceError("MISSING_ACTIVE_BUDGET", 400);
      }

      const remainingBudget = budget.allocated_points - budget.used_points;

      if (pointsAwarded > remainingBudget) {
        throw createServiceError("EXCEEDS_MONTHLY_BUDGET", 400);
      }
    }

    const newBalance = recognition.receiver.points_balance + pointsAwarded;

    await tx.recognition.update({
      where: {
        id: recognitionId,
      },
      data: {
        status: "approved",
        points_awarded: pointsAwarded,
        approver_id: approverUserId,
        reviewed_at: new Date(),
        rejection_reason: null,
      },
    });

    await tx.pointTransaction.create({
      data: {
        user_id: recognition.receiver_id,
        type: "credit",
        source_type: "recognition_approved",
        source_id: recognition.id,
        points: pointsAwarded,
        balance_after: newBalance,
        created_by: approverUserId,
      },
    });

    if (approverRoleName === "Manager") {
      await recognitionWriteHelpers.incrementManagerBudgetUsage({
        tx,
        budgetId: budget.id,
        pointsAwarded,
      });
    }

    await tx.user.update({
      where: {
        id: recognition.receiver_id,
      },
      data: {
        points_balance: {
          increment: pointsAwarded,
        },
      },
    });

    return tx.recognition.findUnique({
      where: {
        id: recognitionId,
      },
      include: buildRecognitionInclude(),
    });
  });
}

async function rejectRecognition({
  recognitionId,
  approverUserId,
  approverRoleName,
  rejectionReason,
}) {
  const recognition = await prisma.recognition.findUnique({
    where: {
      id: recognitionId,
    },
    include: buildRecognitionInclude(),
  });

  if (!recognition) {
    throw createServiceError("RECOGNITION_NOT_FOUND", 404);
  }

  if (recognition.status !== "pending") {
    throw createServiceError("RECOGNITION_NOT_PENDING", 400);
  }

  assertReviewerCanReviewRecognition({
    recognition,
    approverRoleName,
    approverUserId,
  });

  return prisma.recognition.update({
    where: {
      id: recognitionId,
    },
    data: {
      status: "rejected",
      rejection_reason: rejectionReason,
      approver_id: approverUserId,
      reviewed_at: new Date(),
    },
    include: buildRecognitionInclude(),
  });
}

module.exports = {
  approveRecognition,
  createRecognition,
  listRecognitionCategories,
  listPendingRecognitionsForReviewer,
  listRecognitions,
  recognitionWriteHelpers,
  rejectRecognition,
};
