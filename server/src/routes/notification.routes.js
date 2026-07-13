const express = require("express");
const { z } = require("zod");

const verifyToken = require("../middleware/auth.middleware");
const {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} = require("../services/notification.service");

const router = express.Router();

const listNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

function buildNotificationErrorMessage(error) {
  if (error.message === "NOTIFICATION_NOT_FOUND") {
    return "Notification not found";
  }

  return "Invalid notification request";
}

router.get("/", verifyToken, async (request, response) => {
  const parsedQuery = listNotificationsSchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return response.status(400).json({
      message: "Invalid query parameters",
      errors: parsedQuery.error.flatten(),
    });
  }

  const result = await listNotifications({
    userId: request.user.userId,
    page: parsedQuery.data.page,
    limit: parsedQuery.data.limit,
  });

  return response.status(200).json(result);
});

router.patch("/:id/read", verifyToken, async (request, response) => {
  try {
    const notification = await markNotificationRead({
      userId: request.user.userId,
      notificationId: request.params.id,
    });

    return response.status(200).json(notification);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({
        message: buildNotificationErrorMessage(error),
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }
});

router.patch("/read-all", verifyToken, async (request, response) => {
  const result = await markAllNotificationsRead({
    userId: request.user.userId,
  });

  return response.status(200).json(result);
});

module.exports = router;
