const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const prisma = require("./config/db");
const {
  createAccessToken,
  loginUser,
  refreshAccessToken,
} = require("./services/auth.service");
const verifyToken = require("./middleware/auth.middleware");

const app = express();
app.set("trust proxy", 1);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.post("/api/auth/login", loginLimiter, async (request, response) => {
  const parsedBody = loginSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const result = await loginUser(parsedBody.data);

    return response.status(200).json(result);
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return response.status(401).json({
        message: "invalid credentials",
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/auth/refresh", async (request, response) => {
  const parsedBody = refreshSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: "Invalid request body",
      errors: parsedBody.error.flatten(),
    });
  }

  try {
    const accessToken = await refreshAccessToken(parsedBody.data.refreshToken);

    return response.status(200).json({ accessToken });
  } catch (_error) {
    return response.status(401).json({
      message: "Invalid refresh token",
    });
  }
});

app.get("/api/users/me", verifyToken, async (request, response) => {
  const user = await prisma.user.findUnique({
    where: {
      id: request.user.userId,
    },
    include: {
      role: true,
      department: true,
    },
  });

  if (!user) {
    return response.status(404).json({
      message: "User not found",
    });
  }

  return response.status(200).json({
    id: user.id,
    employeeCode: user.employee_code,
    name: user.name,
    email: user.email,
    roleName: user.role.name,
    departmentName: user.department ? user.department.name : null,
    pointsBalance: user.points_balance,
    avatarUrl: user.avatar_url,
    status: user.status,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  });
});

module.exports = {
  app,
};
