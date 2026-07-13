const prisma = require("../config/db");

function buildNotificationData(notification) {
  return {
    user_id: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    related_entity_type: notification.relatedEntityType ?? null,
    related_entity_id: notification.relatedEntityId ?? null,
  };
}

async function createNotification(txOrPrisma, notification) {
  return txOrPrisma.notification.create({
    data: buildNotificationData(notification),
  });
}

async function createManyNotifications(txOrPrisma, notifications) {
  const filteredNotifications = notifications.filter((notification) => notification?.userId);

  return Promise.all(
    filteredNotifications.map((notification) => createNotification(txOrPrisma, notification)),
  );
}

async function listNotifications({ userId, page, limit }) {
  const skip = (page - 1) * limit;
  const where = { user_id: userId };

  const [total, unreadCount, items] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        ...where,
        is_read: false,
      },
    }),
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { created_at: "desc" },
        { id: "desc" },
      ],
    }),
  ]);

  return {
    page,
    limit,
    total,
    unreadCount,
    items,
  };
}

async function markNotificationRead({ userId, notificationId }) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      user_id: userId,
    },
  });

  if (!notification) {
    const error = new Error("NOTIFICATION_NOT_FOUND");
    error.statusCode = 404;
    throw error;
  }

  if (notification.is_read) {
    return notification;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      is_read: true,
    },
  });
}

async function markAllNotificationsRead({ userId }) {
  const result = await prisma.notification.updateMany({
    where: {
      user_id: userId,
      is_read: false,
    },
    data: {
      is_read: true,
    },
  });

  return {
    updatedCount: result.count,
  };
}

module.exports = {
  createManyNotifications,
  createNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
};
