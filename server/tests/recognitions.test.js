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

describe("Recognition API", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("creates a recognition for another user", async () => {
    const accessToken = await loginAs(
      "elliot@recognitionhub.local",
      "Employee1@123",
      "10.0.1.1",
    );
    const receiver = await prisma.user.findUnique({
      where: {
        email: "casey@recognitionhub.local",
      },
    });
    const category = await prisma.recognitionCategory.findUnique({
      where: {
        name: "Teamwork",
      },
    });

    const response = await request(app)
      .post("/api/recognitions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        receiverId: receiver.id,
        categoryId: category.id,
        message: "Thanks for pairing on the API work.",
        pointsRecommended: 75,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "pending",
      message: "Thanks for pairing on the API work.",
      points_recommended: 75,
      visibility: "public",
      sender: {
        email: "elliot@recognitionhub.local",
      },
      receiver: {
        email: "casey@recognitionhub.local",
      },
      category: {
        name: "Teamwork",
      },
    });
  });

  test("rejects self-recognition with a 400", async () => {
    const accessToken = await loginAs(
      "elliot@recognitionhub.local",
      "Employee1@123",
      "10.0.1.2",
    );
    const sender = await prisma.user.findUnique({
      where: {
        email: "elliot@recognitionhub.local",
      },
    });

    const response = await request(app)
      .post("/api/recognitions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        receiverId: sender.id,
        message: "Recognizing myself should not work.",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("You cannot send recognition to yourself");
  });

  test("returns paginated public recognitions and supports department filtering", async () => {
    const accessToken = await loginAs(
      "admin@recognitionhub.local",
      "Admin@123",
      "10.0.1.3",
    );
    const [elliot, casey, sam] = await Promise.all([
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "casey@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "sam@recognitionhub.local" } }),
    ]);

    await prisma.recognition.create({
      data: {
        sender_id: elliot.id,
        receiver_id: casey.id,
        message: "Newest engineering recognition",
        status: "pending",
        visibility: "public",
        created_at: new Date("2026-07-11T10:00:00.000Z"),
      },
    });
    await prisma.recognition.create({
      data: {
        sender_id: casey.id,
        receiver_id: sam.id,
        message: "Sales shoutout",
        status: "pending",
        visibility: "public",
        created_at: new Date("2026-07-11T10:05:00.000Z"),
      },
    });

    const feedResponse = await request(app)
      .get("/api/recognitions?page=1&limit=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(feedResponse.status).toBe(200);
    expect(feedResponse.body.page).toBe(1);
    expect(feedResponse.body.limit).toBe(1);
    expect(feedResponse.body.total).toBe(2);
    expect(feedResponse.body.items).toHaveLength(1);
    expect(feedResponse.body.items[0].message).toBe("Sales shoutout");

    const salesResponse = await request(app)
      .get(`/api/recognitions?departmentId=${sam.department_id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(salesResponse.status).toBe(200);
    expect(salesResponse.body.items).toHaveLength(1);
    expect(salesResponse.body.items[0].receiver.email).toBe("sam@recognitionhub.local");
  });

  test("returns only pending recognitions relevant to the requesting manager", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.1.4",
    );
    const adminToken = await loginAs(
      "admin@recognitionhub.local",
      "Admin@123",
      "10.0.1.5",
    );
    const [admin, manager, elliot, casey, sam] = await Promise.all([
      prisma.user.findUnique({ where: { email: "admin@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "casey@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "sam@recognitionhub.local" } }),
    ]);

    await prisma.recognition.createMany({
      data: [
        {
          sender_id: admin.id,
          receiver_id: elliot.id,
          message: "Pending for engineering report",
          status: "pending",
          visibility: "public",
        },
        {
          sender_id: admin.id,
          receiver_id: sam.id,
          message: "Pending for sales employee",
          status: "pending",
          visibility: "public",
        },
        {
          sender_id: admin.id,
          receiver_id: casey.id,
          message: "Already reviewed",
          status: "approved",
          approver_id: manager.id,
          visibility: "public",
        },
      ],
    });

    const managerResponse = await request(app)
      .get("/api/recognitions/pending-review")
      .set("Authorization", `Bearer ${managerToken}`);

    expect(managerResponse.status).toBe(200);
    expect(managerResponse.body.items).toHaveLength(1);
    expect(managerResponse.body.items[0].message).toBe(
      "Pending for engineering report",
    );
    expect(managerResponse.body.items[0].receiver.manager_id).toBe(manager.id);

    const adminResponse = await request(app)
      .get("/api/recognitions/pending-review")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.items).toHaveLength(2);
  });

  test("returns 403 for employees on pending-review", async () => {
    const employeeToken = await loginAs(
      "elliot@recognitionhub.local",
      "Employee1@123",
      "10.0.1.6",
    );

    const response = await request(app)
      .get("/api/recognitions/pending-review")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.status).toBe(403);
  });

  test("returns 401 when recognition endpoints are accessed without auth", async () => {
    const response = await request(app).get("/api/recognitions");

    expect(response.status).toBe(401);
  });
});
