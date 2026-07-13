const prisma = require("../config/db");

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getRoleName(roleId) {
  if (!roleId) return null;

  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  return role ? role.name : null;
}

async function listRewards({ page, limit, includeInactive, roleId }) {
  const skip = (page - 1) * limit;
  const roleName = await getRoleName(roleId);
  const shouldIncludeInactive = includeInactive && roleName === "HR";
  const where = shouldIncludeInactive ? {} : { is_active: true };

  const [total, items] = await Promise.all([
    prisma.rewardCatalog.count({ where }),
    prisma.rewardCatalog.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { title: "asc" },
        { id: "asc" },
      ],
    }),
  ]);

  return {
    page,
    limit,
    total,
    items,
  };
}

async function createReward(data) {
  return prisma.rewardCatalog.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      points_cost: data.pointsCost,
      stock_quantity: data.stockQuantity ?? null,
      image_url: data.imageUrl ?? null,
      is_active: data.isActive ?? true,
    },
  });
}

async function updateReward({ rewardId, data }) {
  const existingReward = await prisma.rewardCatalog.findUnique({
    where: { id: rewardId },
  });

  if (!existingReward) {
    throw createServiceError("REWARD_NOT_FOUND", 404);
  }

  return prisma.rewardCatalog.update({
    where: { id: rewardId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.pointsCost !== undefined ? { points_cost: data.pointsCost } : {}),
      ...(data.stockQuantity !== undefined ? { stock_quantity: data.stockQuantity } : {}),
      ...(data.imageUrl !== undefined ? { image_url: data.imageUrl } : {}),
      ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
    },
  });
}

module.exports = {
  createReward,
  listRewards,
  updateReward,
};
