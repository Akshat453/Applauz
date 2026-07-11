const express = require("express");
const { z } = require("zod");

const verifyToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole.middleware");
const {
  createRecognition,
  listRecognitions,
  listPendingRecognitionsForReviewer,
} = require("../services/recognition.service");

const router = express.Router();

const createRecognitionSchema = z.object({
  receiverId: z.uuid(),
  categoryId: z.uuid().nullable().optional(),
  message: z.string().trim().min(1),
  pointsRecommended: z.number().int().min(0).nullable().optional(),
});

const listRecognitionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  departmentId: z.uuid().optional(),
});

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
      pointsRecommended: parsedBody.data.pointsRecommended,
    });

    return response.status(201).json(recognition);
  } catch (error) {
    if (error.statusCode === 400) {
      return response.status(400).json({
        message:
          error.message === "SELF_RECOGNITION_NOT_ALLOWED"
            ? "You cannot send recognition to yourself"
            : "Invalid recognition request",
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

router.get(
  "/pending-review",
  verifyToken,
  requireRole(["Manager", "Admin"]),
  async (request, response) => {
    const items = await listPendingRecognitionsForReviewer({
      userId: request.user.userId,
      roleName: request.user.roleName,
    });

    return response.status(200).json({
      items,
    });
  },
);

module.exports = router;
