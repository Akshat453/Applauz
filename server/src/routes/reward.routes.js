const express = require("express");
const { z } = require("zod");

const verifyToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole.middleware");
const {
  createReward,
  listRewards,
  updateReward,
} = require("../services/reward.service");

const router = express.Router();

const listRewardsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const rewardBaseSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).nullable().optional(),
  category: z.string().trim().min(1).max(50),
  pointsCost: z.number().int().min(1),
  stockQuantity: z.number().int().min(0).nullable().optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

const createRewardSchema = rewardBaseSchema.strict();
const updateRewardSchema = rewardBaseSchema.partial().strict();

function buildRewardErrorMessage(error) {
  if (error.message === "REWARD_NOT_FOUND") {
    return "Reward not found";
  }

  return "Invalid reward request";
}

router.get("/", verifyToken, async (request, response) => {
  const parsedQuery = listRewardsSchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return response.status(400).json({
      message: "Invalid query parameters",
      errors: parsedQuery.error.flatten(),
    });
  }

  const result = await listRewards({
    ...parsedQuery.data,
    roleId: request.user.roleId,
  });

  return response.status(200).json(result);
});

router.post("/", verifyToken, requireRole(["HR"]), async (request, response) => {
  const parsedBody = createRewardSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  const reward = await createReward(parsedBody.data);
  return response.status(201).json(reward);
});

router.patch("/:id", verifyToken, requireRole(["HR"]), async (request, response) => {
  const parsedBody = updateRewardSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const reward = await updateReward({
      rewardId: request.params.id,
      data: parsedBody.data,
    });

    return response.status(200).json(reward);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({
        message: buildRewardErrorMessage(error),
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
