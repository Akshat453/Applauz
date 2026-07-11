const jwt = require("jsonwebtoken");
const request = require("supertest");

const prisma = require("../src/config/db");
const { app } = require("../src/app");
const { seedDatabase } = require("../prisma/seed");

describe("Authentication API", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  test("logs in successfully with valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "hr@recognitionhub.local",
      password: "Hr@12345",
    }).set("X-Forwarded-For", "10.0.0.1");

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
    expect(response.body.user).toMatchObject({
      email: "hr@recognitionhub.local",
      roleName: "HR",
    });
  });

  test("returns 401 for wrong password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "hr@recognitionhub.local",
      password: "wrong-password",
    }).set("X-Forwarded-For", "10.0.0.2");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "invalid credentials",
    });
  });

  test("triggers rate limiting after repeated login failures", async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await request(app).post("/api/auth/login").send({
        email: "hr@recognitionhub.local",
        password: "wrong-password",
      }).set("X-Forwarded-For", "10.0.0.3");

      expect(response.status).toBe(401);
    }

    const rateLimitedResponse = await request(app).post("/api/auth/login").send({
      email: "hr@recognitionhub.local",
      password: "wrong-password",
    }).set("X-Forwarded-For", "10.0.0.3");

    expect(rateLimitedResponse.status).toBe(429);
    expect(rateLimitedResponse.body.message).toBe(
      "Too many login attempts. Please try again later.",
    );
  });

  test("returns current user profile when a valid access token is provided", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "manager@recognitionhub.local",
      password: "Manager@123",
    }).set("X-Forwarded-For", "10.0.0.4");

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      email: "manager@recognitionhub.local",
      roleName: "Manager",
    });
    expect(response.body.password_hash).toBeUndefined();
  });

  test("returns 401 when accessing /api/users/me without a token", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(401);
  });

  test("returns 401 when accessing /api/users/me with an invalid token", async () => {
    const invalidToken = jwt.sign(
      { userId: "bad-user", roleId: "bad-role" },
      "wrong-secret",
      { expiresIn: "15m" },
    );

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
  });
});
