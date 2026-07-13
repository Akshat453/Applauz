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

describe("Redemptions API", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("returns active rewards for authenticated users", async () => {
    const accessToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.2.0",
    );

    const response = await request(app)
      .get("/api/rewards?page=1&limit=10")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(6);
    expect(response.body.items).toHaveLength(6);
    expect(response.body.items.every((item) => item.is_active)).toBe(true);
  });

  test("hr can request inactive rewards while employees cannot", async () => {
    const [hrToken, employeeToken, reward] = await Promise.all([
      loginAs("hr@recognitionhub.local", "Hr@12345", "10.0.2.0a"),
      loginAs("elliot@recognitionhub.local", "Employee1@123", "10.0.2.0b"),
      prisma.rewardCatalog.findFirst({
        where: { title: "$25 Coffee Gift Card" },
      }),
    ]);

    await prisma.rewardCatalog.update({
      where: { id: reward.id },
      data: { is_active: false },
    });

    const hrResponse = await request(app)
      .get("/api/rewards?includeInactive=true&page=1&limit=20")
      .set("Authorization", `Bearer ${hrToken}`);

    const employeeResponse = await request(app)
      .get("/api/rewards?includeInactive=true&page=1&limit=20")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(hrResponse.status).toBe(200);
    expect(hrResponse.body.items.some((item) => item.id === reward.id)).toBe(true);

    expect(employeeResponse.status).toBe(200);
    expect(employeeResponse.body.items.some((item) => item.id === reward.id)).toBe(false);
  });

  test("successful redemption debits points and creates a pending record", async () => {
    const accessToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.2.1",
    );

    const [manager, reward] = await Promise.all([
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
      prisma.rewardCatalog.findFirst({ where: { title: "$25 Coffee Gift Card" } }),
    ]);

    const response = await request(app)
      .post("/api/redemptions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ rewardId: reward.id });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "pending",
      points_spent: reward.points_cost,
      user_id: manager.id,
      reward_id: reward.id,
    });

    const [updatedUser, ledgerRow] = await Promise.all([
      prisma.user.findUnique({ where: { id: manager.id } }),
      prisma.pointTransaction.findFirst({
        where: {
          source_id: response.body.id,
          source_type: "redemption",
        },
      }),
    ]);

    expect(updatedUser.points_balance).toBe(manager.points_balance - reward.points_cost);
    expect(ledgerRow).toMatchObject({
      user_id: manager.id,
      type: "debit",
      source_type: "redemption",
      points: reward.points_cost,
      balance_after: manager.points_balance - reward.points_cost,
      created_by: null,
    });
  });

  test("returns 400 when redeeming with insufficient points", async () => {
    const accessToken = await loginAs(
      "elliot@recognitionhub.local",
      "Employee1@123",
      "10.0.2.2",
    );

    const reward = await prisma.rewardCatalog.findFirst({
      where: { title: "Applauz Premium Hoodie" },
    });
    const beforeUser = await prisma.user.findUnique({
      where: { email: "elliot@recognitionhub.local" },
    });

    const response = await request(app)
      .post("/api/redemptions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ rewardId: reward.id });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient points balance");

    const [afterUser, redemptionCount, ledgerCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: beforeUser.id } }),
      prisma.redemption.count({ where: { user_id: beforeUser.id } }),
      prisma.pointTransaction.count({
        where: {
          user_id: beforeUser.id,
          source_type: "redemption",
        },
      }),
    ]);

    expect(afterUser.points_balance).toBe(beforeUser.points_balance);
    expect(redemptionCount).toBe(0);
    expect(ledgerCount).toBe(0);
  });

  test("hr approval marks redemption approved and decrements limited stock", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.2.3",
    );
    const hrToken = await loginAs(
      "hr@recognitionhub.local",
      "Hr@12345",
      "10.0.2.4",
    );

    const reward = await prisma.rewardCatalog.findFirst({
      where: { title: "Applauz Premium Hoodie" },
    });
    const initialStock = reward.stock_quantity;

    const redemptionResponse = await request(app)
      .post("/api/redemptions")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ rewardId: reward.id });

    const approveResponse = await request(app)
      .patch(`/api/redemptions/${redemptionResponse.body.id}/approve`)
      .set("Authorization", `Bearer ${hrToken}`);

    expect(approveResponse.status).toBe(200);
    expect(approveResponse.body.status).toBe("approved");
    expect(approveResponse.body.approver.email).toBe("hr@recognitionhub.local");

    const updatedReward = await prisma.rewardCatalog.findUnique({
      where: { id: reward.id },
    });

    expect(updatedReward.stock_quantity).toBe(initialStock - 1);
  });

  test("reject refund cycle restores the exact original balance", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.2.5",
    );
    const hrToken = await loginAs(
      "hr@recognitionhub.local",
      "Hr@12345",
      "10.0.2.6",
    );

    const [manager, reward] = await Promise.all([
      prisma.user.findUnique({ where: { email: "manager@recognitionhub.local" } }),
      prisma.rewardCatalog.findFirst({ where: { title: "$50 Multi-Brand Gift Card" } }),
    ]);

    const originalBalance = manager.points_balance;

    const redemptionResponse = await request(app)
      .post("/api/redemptions")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ rewardId: reward.id });

    expect(redemptionResponse.status).toBe(201);

    const rejectResponse = await request(app)
      .patch(`/api/redemptions/${redemptionResponse.body.id}/reject`)
      .set("Authorization", `Bearer ${hrToken}`)
      .send({ rejectionReason: "Catalog issue requires manual review." });

    expect(rejectResponse.status).toBe(200);
    expect(rejectResponse.body.status).toBe("rejected");
    expect(rejectResponse.body.rejection_reason).toBe(
      "Catalog issue requires manual review.",
    );

    const [updatedUser, debitRow, refundRow] = await Promise.all([
      prisma.user.findUnique({ where: { id: manager.id } }),
      prisma.pointTransaction.findFirst({
        where: {
          source_id: redemptionResponse.body.id,
          source_type: "redemption",
        },
      }),
      prisma.pointTransaction.findFirst({
        where: {
          source_id: redemptionResponse.body.id,
          source_type: "redemption_refund",
        },
      }),
    ]);

    expect(updatedUser.points_balance).toBe(originalBalance);
    expect(debitRow).toMatchObject({
      type: "debit",
      points: reward.points_cost,
    });
    expect(refundRow).toMatchObject({
      type: "credit",
      points: reward.points_cost,
      balance_after: originalBalance,
    });
  });

  test("redemptions listing is scoped to the authenticated user unless HR", async () => {
    const managerToken = await loginAs(
      "manager@recognitionhub.local",
      "Manager@123",
      "10.0.2.7",
    );
    const hrToken = await loginAs(
      "hr@recognitionhub.local",
      "Hr@12345",
      "10.0.2.8",
    );

    const [giftCard, leaveReward] = await Promise.all([
      prisma.rewardCatalog.findFirst({ where: { title: "$25 Coffee Gift Card" } }),
      prisma.rewardCatalog.findFirst({ where: { title: "Half-Day Recharge Leave" } }),
    ]);

    await request(app)
      .post("/api/redemptions")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ rewardId: giftCard.id });

    await request(app)
      .post("/api/redemptions")
      .set("Authorization", `Bearer ${hrToken}`)
      .send({ rewardId: leaveReward.id });

    const managerList = await request(app)
      .get("/api/redemptions?status=pending")
      .set("Authorization", `Bearer ${managerToken}`);

    const hrList = await request(app)
      .get("/api/redemptions?status=pending")
      .set("Authorization", `Bearer ${hrToken}`);

    expect(managerList.status).toBe(200);
    expect(managerList.body.items).toHaveLength(1);
    expect(managerList.body.items[0].user.email).toBe("manager@recognitionhub.local");

    expect(hrList.status).toBe(200);
    expect(hrList.body.items.length).toBeGreaterThanOrEqual(2);
  });
});
