const express = require("express");
const { z } = require("zod");

const verifyToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole.middleware");
const {
  approveRedemption,
  createRedemption,
  listRedemptions,
  rejectRedemption,
} = require("../services/redemption.service");

const router = express.Router();

const createRedemptionSchema = z.object({
  rewardId: z.uuid(),
}).strict();

const listRedemptionsSchema = z.object({
  status: z.string().trim().min(1).optional(),
});

const rejectRedemptionSchema = z.object({
  rejectionReason: z.string().trim().min(1),
}).strict();

function buildRedemptionErrorMessage(error) {
  if (error.message === "REWARD_NOT_FOUND") {
    return "Reward not found";
  }

  if (error.message === "REDEMPTION_NOT_FOUND") {
    return "Redemption not found";
  }

  if (error.message === "REWARD_NOT_ACTIVE") {
    return "Reward is not active";
  }

  if (error.message === "REWARD_OUT_OF_STOCK") {
    return "Reward is out of stock";
  }

  if (error.message === "INSUFFICIENT_POINTS_BALANCE") {
    return "Insufficient points balance";
  }

  if (error.message === "REDEMPTION_NOT_PENDING") {
    return "Redemption is not pending";
  }

  return "Invalid redemption request";
}

router.post("/", verifyToken, async (request, response) => {
  const parsedBody = createRedemptionSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const redemption = await createRedemption({
      userId: request.user.userId,
      rewardId: parsedBody.data.rewardId,
    });

    return response.status(201).json(redemption);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({
        message: buildRedemptionErrorMessage(error),
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/", verifyToken, async (request, response) => {
  const parsedQuery = listRedemptionsSchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return response.status(400).json({
      message: "Invalid query parameters",
      errors: parsedQuery.error.flatten(),
    });
  }

  const items = await listRedemptions({
    userId: request.user.userId,
    roleId: request.user.roleId,
    status: parsedQuery.data.status,
  });

  return response.status(200).json({ items });
});

router.patch("/:id/approve", verifyToken, requireRole(["HR"]), async (request, response) => {
  try {
    const redemption = await approveRedemption({
      redemptionId: request.params.id,
      approverUserId: request.user.userId,
    });

    return response.status(200).json(redemption);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({
        message: buildRedemptionErrorMessage(error),
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }
});

router.patch("/:id/reject", verifyToken, requireRole(["HR"]), async (request, response) => {
  const parsedBody = rejectRedemptionSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const redemption = await rejectRedemption({
      redemptionId: request.params.id,
      approverUserId: request.user.userId,
      rejectionReason: parsedBody.data.rejectionReason,
    });

    return response.status(200).json(redemption);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({
        message: buildRedemptionErrorMessage(error),
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
