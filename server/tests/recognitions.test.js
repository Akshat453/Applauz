const request = require("supertest");

const prisma = require("../src/config/db");
const { app } = require("../src/app");
const { seedDatabase } = require("../prisma/seed");
const recognitionService = require("../src/services/recognition.service");

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
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "pending",
      message: "Thanks for pairing on the API work.",
      points_recommended: null,
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

  test("rejects employee-suggested points on recognition creation", async () => {
    const accessToken = await loginAs(
      "elliot@recognitionhub.local",
      "Employee1@123",
      "10.0.1.1a",
    );
    const receiver = await prisma.user.findUnique({
      where: {
        email: "casey@recognitionhub.local",
      },
    });

    const response = await request(app)
      .post("/api/recognitions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        receiverId: receiver.id,
        message: "Trying to suggest points should fail now.",
        pointsRecommended: 75,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid request body");
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
      "hr@recognitionhub.local",
      "Hr@12345",
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
    const hrToken = await loginAs(
      "hr@recognitionhub.local",
      "Hr@12345",
      "10.0.1.5",
    );
    const [hr, manager, elliot, casey, sam] = await Promise.all([
      prisma.user.findUnique({ where: { email: "hr@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "casey@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "sam@recognitionhub.local" } }),
    ]);

    await prisma.recognition.createMany({
      data: [
        {
          sender_id: hr.id,
          receiver_id: elliot.id,
          message: "Pending for engineering report",
          status: "pending",
          visibility: "public",
        },
        {
          sender_id: hr.id,
          receiver_id: sam.id,
          message: "Pending for sales employee",
          status: "pending",
          visibility: "public",
        },
        {
          sender_id: hr.id,
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
    expect(managerResponse.body.budget).toMatchObject({
      allocatedPoints: 2000,
      usedPoints: 0,
      remainingPoints: 2000,
    });
    expect(managerResponse.body.items[0].message).toBe(
      "Pending for engineering report",
    );
    expect(managerResponse.body.items[0].receiver.manager_id).toBe(manager.id);

    const hrResponse = await request(app)
      .get("/api/recognitions/pending-review")
      .set("Authorization", `Bearer ${hrToken}`);

    expect(hrResponse.status).toBe(200);
    expect(hrResponse.body.items).toHaveLength(2);
    expect(hrResponse.body.budget).toBeNull();
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

  test("returns recognition categories for authenticated users", async () => {
    const accessToken = await loginAs(
      "elliot@recognitionhub.local",
      "Employee1@123",
      "10.0.1.6a",
    );

    const response = await request(app)
      .get("/api/recognitions/categories")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(5);
    expect(response.body.items.map((item) => item.name)).toEqual([
      "Customer Focus",
      "Innovation",
      "Leadership",
      "Ownership",
      "Teamwork",
    ]);
  });

  test("returns authenticated colleague list without the current user", async () => {
    const accessToken = await loginAs(
      "elliot@recognitionhub.local",
      "Employee1@123",
      "10.0.1.6b",
    );

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items.some((item) => item.name === "Elliot Engineer")).toBe(
      false,
    );
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Casey Coder",
          departmentName: "Engineering",
        }),
        expect.objectContaining({
          name: "Morgan Manager",
          departmentName: "Engineering",
        }),
      ]),
    );
  });

  test("manager approval creates a ledger entry, updates budget, and credits receiver balance", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.1.7",
    );
    const [elliot, casey, manager] = await Promise.all([
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "casey@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
    ]);

    const recognition = await prisma.recognition.create({
      data: {
        sender_id: casey.id,
        receiver_id: elliot.id,
        message: "Great collaboration on the sprint closeout.",
        status: "pending",
        visibility: "public",
      },
    });

    const response = await request(app)
      .patch(`/api/recognitions/${recognition.id}/approve`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        pointsAwarded: 120,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("approved");
    expect(response.body.points_awarded).toBe(120);
    expect(response.body.approver.email).toBe("manager@recognitionhub.local");

    const [updatedReceiver, pointsTransaction, budget] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: elliot.id,
        },
      }),
      prisma.pointTransaction.findFirst({
        where: {
          source_id: recognition.id,
        },
      }),
      prisma.pointBudget.findFirst({
        where: {
          manager_id: manager.id,
        },
      }),
    ]);

    expect(updatedReceiver.points_balance).toBe(120);
    expect(pointsTransaction).toMatchObject({
      user_id: elliot.id,
      type: "credit",
      source_type: "recognition_approved",
      points: 120,
      balance_after: 120,
      created_by: manager.id,
    });
    expect(budget.used_points).toBe(120);
  });

  test("hr approval credits balance without consuming manager budget", async () => {
    const hrToken = await loginAs(
      "hr@recognitionhub.local",
      "Hr@12345",
      "10.0.1.8",
    );
    const [hr, elliot, sam, manager] = await Promise.all([
      prisma.user.findUnique({ where: { email: "hr@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "sam@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
    ]);

    const recognition = await prisma.recognition.create({
      data: {
        sender_id: elliot.id,
        receiver_id: sam.id,
        message: "Cross-team support on customer rollout.",
        status: "pending",
        visibility: "public",
      },
    });

    const response = await request(app)
      .patch(`/api/recognitions/${recognition.id}/approve`)
      .set("Authorization", `Bearer ${hrToken}`)
      .send({
        pointsAwarded: 90,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("approved");
    expect(response.body.approver.email).toBe("hr@recognitionhub.local");

    const [updatedReceiver, pointsTransaction, budget] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: sam.id,
        },
      }),
      prisma.pointTransaction.findFirst({
        where: {
          source_id: recognition.id,
        },
      }),
      prisma.pointBudget.findFirst({
        where: {
          manager_id: manager.id,
        },
      }),
    ]);

    expect(updatedReceiver.points_balance).toBe(90);
    expect(pointsTransaction.created_by).toBe(hr.id);
    expect(budget.used_points).toBe(0);
  });

  test("manager approval rejects points that exceed monthly budget", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.1.9",
    );
    const [elliot, casey, manager] = await Promise.all([
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "casey@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
    ]);

    await prisma.pointBudget.updateMany({
      where: {
        manager_id: manager.id,
      },
      data: {
        used_points: 1950,
      },
    });

    const recognition = await prisma.recognition.create({
      data: {
        sender_id: casey.id,
        receiver_id: elliot.id,
        message: "Budget should block this approval.",
        status: "pending",
        visibility: "public",
      },
    });

    const response = await request(app)
      .patch(`/api/recognitions/${recognition.id}/approve`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        pointsAwarded: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("points awarded exceeds monthly budget");
  });

  test("manager reject updates recognition without touching the ledger", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.1.10",
    );
    const [elliot, casey] = await Promise.all([
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "casey@recognitionhub.local" } }),
    ]);

    const recognition = await prisma.recognition.create({
      data: {
        sender_id: casey.id,
        receiver_id: elliot.id,
        message: "This recognition should be rejected.",
        status: "pending",
        visibility: "public",
      },
    });

    const response = await request(app)
      .patch(`/api/recognitions/${recognition.id}/reject`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        rejectionReason: "Needs more context before approval.",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("rejected");
    expect(response.body.rejection_reason).toBe(
      "Needs more context before approval.",
    );

    const [updatedReceiver, pointsTransaction] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: elliot.id,
        },
      }),
      prisma.pointTransaction.findFirst({
        where: {
          source_id: recognition.id,
        },
      }),
    ]);

    expect(updatedReceiver.points_balance).toBe(0);
    expect(pointsTransaction).toBeNull();
  });

  test("approval transaction rolls back completely if budget update fails", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.1.11",
    );
    const [elliot, casey, manager] = await Promise.all([
      prisma.user.findUnique({ where: { email: "elliot@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "casey@recognitionhub.local" } }),
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
    ]);

    const recognition = await prisma.recognition.create({
      data: {
        sender_id: casey.id,
        receiver_id: elliot.id,
        message: "Rollback test recognition.",
        status: "pending",
        visibility: "public",
      },
    });

    const budgetFailureSpy = jest
      .spyOn(
        recognitionService.recognitionWriteHelpers,
        "incrementManagerBudgetUsage",
      )
      .mockRejectedValueOnce(new Error("Simulated budget update failure"));

    const response = await request(app)
      .patch(`/api/recognitions/${recognition.id}/approve`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        pointsAwarded: 80,
      });

    budgetFailureSpy.mockRestore();

    expect(response.status).toBe(500);

    const [persistedRecognition, pointsTransaction, updatedReceiver, budget] = await Promise.all([
      prisma.recognition.findUnique({
        where: {
          id: recognition.id,
        },
      }),
      prisma.pointTransaction.findFirst({
        where: {
          source_id: recognition.id,
        },
      }),
      prisma.user.findUnique({
        where: {
          id: elliot.id,
        },
      }),
      prisma.pointBudget.findFirst({
        where: {
          manager_id: manager.id,
        },
      }),
    ]);

    expect(persistedRecognition.status).toBe("pending");
    expect(persistedRecognition.points_awarded).toBeNull();
    expect(persistedRecognition.approver_id).toBeNull();
    expect(pointsTransaction).toBeNull();
    expect(updatedReceiver.points_balance).toBe(0);
    expect(budget.used_points).toBe(0);
  });
});
