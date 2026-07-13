const prisma = require("../config/db");
const { createNotification } = require("./notification.service");

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildRedemptionInclude() {
  return {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        points_balance: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    reward: true,
    approver: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  };
}

async function getRoleName(roleId) {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });

  return role ? role.name : null;
}

async function createRedemption({ userId, rewardId }) {
  return prisma.$transaction(async (tx) => {
    const [user, reward] = await Promise.all([
      tx.user.findUnique({
        where: { id: userId },
      }),
      tx.rewardCatalog.findUnique({
        where: { id: rewardId },
      }),
    ]);

    if (!user) {
      throw createServiceError("USER_NOT_FOUND", 404);
    }

    if (!reward) {
      throw createServiceError("REWARD_NOT_FOUND", 404);
    }

    if (!reward.is_active) {
      throw createServiceError("REWARD_NOT_ACTIVE", 400);
    }

    if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
      throw createServiceError("REWARD_OUT_OF_STOCK", 400);
    }

    if (user.points_balance < reward.points_cost) {
      throw createServiceError("INSUFFICIENT_POINTS_BALANCE", 400);
    }

    const updatedBalance = user.points_balance - reward.points_cost;

    const redemption = await tx.redemption.create({
      data: {
        user_id: userId,
        reward_id: rewardId,
        points_spent: reward.points_cost,
        status: "pending",
      },
    });

    await tx.pointTransaction.create({
      data: {
        user_id: userId,
        type: "debit",
        source_type: "redemption",
        source_id: redemption.id,
        points: reward.points_cost,
        balance_after: updatedBalance,
        created_by: null,
      },
    });

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        points_balance: {
          decrement: reward.points_cost,
        },
      },
    });

    return tx.redemption.findUnique({
      where: { id: redemption.id },
      include: buildRedemptionInclude(),
    });
  });
}

async function listRedemptions({ userId, roleId, status }) {
  const roleName = await getRoleName(roleId);
  const where = {
    ...(status ? { status } : {}),
    ...(roleName === "HR" ? {} : { user_id: userId }),
  };

  return prisma.redemption.findMany({
    where,
    orderBy: [
      { requested_at: "desc" },
      { id: "desc" },
    ],
    include: buildRedemptionInclude(),
  });
}

async function approveRedemption({ redemptionId, approverUserId }) {
  return prisma.$transaction(async (tx) => {
    const redemption = await tx.redemption.findUnique({
      where: { id: redemptionId },
      include: buildRedemptionInclude(),
    });

    if (!redemption) {
      throw createServiceError("REDEMPTION_NOT_FOUND", 404);
    }

    if (redemption.status !== "pending") {
      throw createServiceError("REDEMPTION_NOT_PENDING", 400);
    }

    if (!redemption.reward.is_active) {
      throw createServiceError("REWARD_NOT_ACTIVE", 400);
    }

    if (
      redemption.reward.stock_quantity !== null
      && redemption.reward.stock_quantity <= 0
    ) {
      throw createServiceError("REWARD_OUT_OF_STOCK", 400);
    }

    if (redemption.reward.stock_quantity !== null) {
      await tx.rewardCatalog.update({
        where: { id: redemption.reward_id },
        data: {
          stock_quantity: {
            decrement: 1,
          },
        },
      });
    }

    await tx.redemption.update({
      where: { id: redemptionId },
      data: {
        status: "approved",
        approved_by: approverUserId,
        approved_at: new Date(),
        rejection_reason: null,
      },
    });

    await createNotification(tx, {
      userId: redemption.user_id,
      type: "redemption_approved",
      title: "Redemption approved",
      message: `Your redemption request for ${redemption.reward.title} was approved.`,
      relatedEntityType: "redemption",
      relatedEntityId: redemption.id,
    });

    return tx.redemption.findUnique({
      where: { id: redemptionId },
      include: buildRedemptionInclude(),
    });
  });
}

async function rejectRedemption({
  redemptionId,
  approverUserId,
  rejectionReason,
}) {
  return prisma.$transaction(async (tx) => {
    const redemption = await tx.redemption.findUnique({
      where: { id: redemptionId },
      include: buildRedemptionInclude(),
    });

    if (!redemption) {
      throw createServiceError("REDEMPTION_NOT_FOUND", 404);
    }

    if (redemption.status !== "pending") {
      throw createServiceError("REDEMPTION_NOT_PENDING", 400);
    }

    const restoredBalance = redemption.user.points_balance + redemption.points_spent;

    await tx.redemption.update({
      where: { id: redemptionId },
      data: {
        status: "rejected",
        approved_by: approverUserId,
        approved_at: new Date(),
        rejection_reason: rejectionReason,
      },
    });

    await tx.pointTransaction.create({
      data: {
        user_id: redemption.user_id,
        type: "credit",
        source_type: "redemption_refund",
        source_id: redemption.id,
        points: redemption.points_spent,
        balance_after: restoredBalance,
        created_by: approverUserId,
      },
    });

    await tx.user.update({
      where: { id: redemption.user_id },
      data: {
        points_balance: {
          increment: redemption.points_spent,
        },
      },
    });

    await createNotification(tx, {
      userId: redemption.user_id,
      type: "redemption_rejected",
      title: "Redemption rejected",
      message: `Your redemption request for ${redemption.reward.title} was rejected.`,
      relatedEntityType: "redemption",
      relatedEntityId: redemption.id,
    });

    return tx.redemption.findUnique({
      where: { id: redemptionId },
      include: buildRedemptionInclude(),
    });
  });
}

module.exports = {
  approveRedemption,
  createRedemption,
  listRedemptions,
  rejectRedemption,
};
