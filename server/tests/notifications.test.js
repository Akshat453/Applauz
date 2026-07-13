const request = require("supertest");

const prisma = require("../src/config/db");
const { app } = require("../src/app");
const { seedDatabase } = require("../prisma/seed");

async function loginAs(email, password, forwardedFor) {
  const response = await request(app)
    .post("/api/auth/login")
    .set("X-Forwarded-For", forwardedFor)
    .send({ email, password });

  return response.body.accessToken;
}

describe("Notifications API", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("lists notifications paginated with unread count and newest first", async () => {
    const [token, user] = await Promise.all([
      loginAs("manager@recognitionhub.local", "Manager@123", "10.0.3.1"),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
    ]);

    await prisma.notification.createMany({
      data: [
        {
          user_id: user.id,
          type: "recognition_review",
          title: "Older notification",
          message: "Oldest",
          created_at: new Date("2026-07-13T08:00:00.000Z"),
        },
        {
          user_id: user.id,
          type: "recognition_approved",
          title: "Newest notification",
          message: "Newest",
          created_at: new Date("2026-07-13T09:00:00.000Z"),
        },
        {
          user_id: user.id,
          type: "recognition_rejected",
          title: "Read notification",
          message: "Already read",
          is_read: true,
          created_at: new Date("2026-07-13T08:30:00.000Z"),
        },
      ],
    });

    const response = await request(app)
      .get("/api/notifications?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(2);
    expect(response.body.total).toBe(3);
    expect(response.body.unreadCount).toBe(2);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0].title).toBe("Newest notification");
    expect(response.body.items[1].title).toBe("Read notification");
  });

  test("marks only the current user's notification as read", async () => {
    const [managerToken, otherToken, manager, otherUser] = await Promise.all([
      loginAs("manager@recognitionhub.local", "Manager@123", "10.0.3.2"),
      loginAs("hr@recognitionhub.local", "Hr@12345", "10.0.3.3"),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "hr@recognitionhub.local" } }),
    ]);

    const ownNotification = await prisma.notification.create({
      data: {
        user_id: manager.id,
        type: "recognition_review",
        title: "Own notification",
        message: "Needs review",
      },
    });
    const otherNotification = await prisma.notification.create({
      data: {
        user_id: otherUser.id,
        type: "recognition_review",
        title: "Other notification",
        message: "Not yours",
      },
    });

    const ownResponse = await request(app)
      .patch(`/api/notifications/${ownNotification.id}/read`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(ownResponse.status).toBe(200);
    expect(ownResponse.body.is_read).toBe(true);

    const forbiddenResponse = await request(app)
      .patch(`/api/notifications/${otherNotification.id}/read`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(forbiddenResponse.status).toBe(404);

    const otherResponse = await request(app)
      .patch(`/api/notifications/${otherNotification.id}/read`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(otherResponse.status).toBe(200);
    expect(otherResponse.body.is_read).toBe(true);
  });

  test("marks all of the current user's notifications as read", async () => {
    const [token, user, otherUser] = await Promise.all([
      loginAs("manager@recognitionhub.local", "Manager@123", "10.0.3.4"),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "hr@recognitionhub.local" } }),
    ]);

    await prisma.notification.createMany({
      data: [
        {
          user_id: user.id,
          type: "recognition_review",
          title: "One",
          message: "One",
        },
        {
          user_id: user.id,
          type: "recognition_review",
          title: "Two",
          message: "Two",
        },
        {
          user_id: otherUser.id,
          type: "recognition_review",
          title: "Other",
          message: "Other",
        },
      ],
    });

    const response = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.updatedCount).toBe(2);

    const [ownUnreadCount, otherUnreadCount] = await Promise.all([
      prisma.notification.count({
        where: {
          user_id: user.id,
          is_read: false,
        },
      }),
      prisma.notification.count({
        where: {
          user_id: otherUser.id,
          is_read: false,
        },
      }),
    ]);

    expect(ownUnreadCount).toBe(0);
    expect(otherUnreadCount).toBe(1);
  });
});
