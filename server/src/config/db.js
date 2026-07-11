const { PrismaClient } = require("@prisma/client");

const prisma = globalThis.__prisma__ || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma__ = prisma;
}

module.exports = prisma;
