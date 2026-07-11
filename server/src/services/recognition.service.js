const prisma = require("../config/db");

async function createRecognition({
  senderId,
  receiverId,
  categoryId,
  message,
  pointsRecommended,
}) {
  if (senderId === receiverId) {
    const error = new Error("SELF_RECOGNITION_NOT_ALLOWED");
    error.statusCode = 400;
    throw error;
  }

  const receiver = await prisma.user.findUnique({
    where: {
      id: receiverId,
    },
  });

  if (!receiver) {
    const error = new Error("RECEIVER_NOT_FOUND");
    error.statusCode = 400;
    throw error;
  }

  if (categoryId) {
    const category = await prisma.recognitionCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      const error = new Error("CATEGORY_NOT_FOUND");
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.recognition.create({
    data: {
      sender_id: senderId,
      receiver_id: receiverId,
      category_id: categoryId ?? null,
      message,
      points_recommended: pointsRecommended ?? null,
      status: "pending",
      visibility: "public",
    },
    include: {
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
        },
      },
      category: true,
    },
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
      include: {
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
          },
        },
        category: true,
      },
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
    ...(roleName === "Admin"
      ? {}
      : {
          receiver: {
            manager_id: userId,
          },
        }),
  };

  return prisma.recognition.findMany({
    where,
    orderBy: [
      {
        created_at: "desc",
      },
      {
        id: "desc",
      },
    ],
    include: {
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
          manager_id: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      category: true,
    },
  });
}

module.exports = {
  createRecognition,
  listRecognitions,
  listPendingRecognitionsForReviewer,
};
