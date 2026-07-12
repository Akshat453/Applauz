const express = require("express");
const { z } = require("zod");

const verifyToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole.middleware");
const {
  approveRecognition,
  createRecognition,
  listRecognitionCategories,
  listRecognitions,
  listPendingRecognitionsForReviewer,
  rejectRecognition,
} = require("../services/recognition.service");

const router = express.Router();

const createRecognitionSchema = z.object({
  receiverId: z.uuid(),
  categoryId: z.uuid().nullable().optional(),
  message: z.string().trim().min(1),
}).strict();

const listRecognitionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  departmentId: z.uuid().optional(),
});

const approveRecognitionSchema = z.object({
  pointsAwarded: z.number().int().min(1),
});

const rejectRecognitionSchema = z.object({
  rejectionReason: z.string().trim().min(1),
});

function buildRecognitionErrorMessage(error) {
  if (error.message === "SELF_RECOGNITION_NOT_ALLOWED") {
    return "You cannot send recognition to yourself";
  }

  if (error.message === "EXCEEDS_MONTHLY_BUDGET") {
    return "points awarded exceeds monthly budget";
  }

  if (error.message === "MISSING_ACTIVE_BUDGET") {
    return "No active monthly budget found for this manager";
  }

  if (error.message === "FORBIDDEN_RECOGNITION_REVIEW") {
    return "Forbidden";
  }

  if (error.message === "RECOGNITION_NOT_FOUND") {
    return "Recognition not found";
  }

  if (error.message === "RECOGNITION_NOT_PENDING") {
    return "Recognition is not pending review";
  }

  return "Invalid recognition request";
}

router.post("/", verifyToken, async (request, response) => {
  const parsedBody = createRecognitionSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const recognition = await createRecognition({
      senderId: request.user.userId,
      receiverId: parsedBody.data.receiverId,
      categoryId: parsedBody.data.categoryId,
      message: parsedBody.data.message,
    });

    return response.status(201).json(recognition);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({
        message: buildRecognitionErrorMessage(error),
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/", verifyToken, async (request, response) => {
  const parsedQuery = listRecognitionsSchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return response.status(400).json({
      message: "Invalid query parameters",
      errors: parsedQuery.error.flatten(),
    });
  }

  const result = await listRecognitions(parsedQuery.data);

  return response.status(200).json(result);
});

router.get("/categories", verifyToken, async (_request, response) => {
  const categories = await listRecognitionCategories();

  return response.status(200).json({
    items: categories,
  });
});

router.get(
  "/pending-review",
  verifyToken,
  requireRole(["Manager", "HR"]),
  async (request, response) => {
    const result = await listPendingRecognitionsForReviewer({
      userId: request.user.userId,
      roleName: request.user.roleName,
    });

    return response.status(200).json(result);
  },
);

router.patch(
  "/:id/approve",
  verifyToken,
  requireRole(["Manager", "HR"]),
  async (request, response) => {
    const parsedBody = approveRecognitionSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        message: "Invalid request body",
        errors: parsedBody.error.flatten(),
      });
    }

    try {
      const recognition = await approveRecognition({
        recognitionId: request.params.id,
        approverUserId: request.user.userId,
        approverRoleName: request.user.roleName,
        pointsAwarded: parsedBody.data.pointsAwarded,
      });

      return response.status(200).json(recognition);
    } catch (error) {
      if (error.statusCode) {
        return response.status(error.statusCode).json({
          message: buildRecognitionErrorMessage(error),
        });
      }

      return response.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

router.patch(
  "/:id/reject",
  verifyToken,
  requireRole(["Manager", "HR"]),
  async (request, response) => {
    const parsedBody = rejectRecognitionSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        message: "Invalid request body",
        errors: parsedBody.error.flatten(),
      });
    }

    try {
      const recognition = await rejectRecognition({
        recognitionId: request.params.id,
        approverUserId: request.user.userId,
        approverRoleName: request.user.roleName,
        rejectionReason: parsedBody.data.rejectionReason,
      });

      return response.status(200).json(recognition);
    } catch (error) {
      if (error.statusCode) {
        return response.status(error.statusCode).json({
          message: buildRecognitionErrorMessage(error),
        });
      }

      return response.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

module.exports = router;
