const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../config/db");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const tokenPayload = {
    userId: user.id,
    roleId: user.role_id,
  };

  return {
    accessToken: createAccessToken(tokenPayload),
    refreshToken: createRefreshToken(tokenPayload),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleName: user.role.name,
      pointsBalance: user.points_balance,
    },
  };
}

async function refreshAccessToken(refreshToken) {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  return createAccessToken({
    userId: payload.userId,
    roleId: payload.roleId,
  });
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  loginUser,
  refreshAccessToken,
};
