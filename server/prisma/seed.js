const bcrypt = require("bcrypt");

const prisma = require("../src/config/db");

const seedUsers = [
  {
    key: "hr",
    employee_code: "ADM001",
    name: "Harper HR",
    email: "hr@recognitionhub.local",
    password: "Hr@12345",
    role: "HR",
    department: null,
    manager: null,
    points_balance: 12000,
  },
  {
    key: "manager",
    employee_code: "MGR001",
    name: "Morgan Manager",
    email: "manager@recognitionhub.local",
    password: "Manager@123",
    role: "Manager",
    department: "Engineering",
    manager: null,
    points_balance: 8000,
  },
  {
    key: "employee1",
    employee_code: "EMP001",
    name: "Elliot Engineer",
    email: "elliot@recognitionhub.local",
    password: "Employee1@123",
    role: "Employee",
    department: "Engineering",
    manager: "manager",
    points_balance: 0,
  },
  {
    key: "employee2",
    employee_code: "EMP002",
    name: "Casey Coder",
    email: "casey@recognitionhub.local",
    password: "Employee2@123",
    role: "Employee",
    department: "Engineering",
    manager: "manager",
    points_balance: 0,
  },
  {
    key: "employee3",
    employee_code: "EMP003",
    name: "Sam Seller",
    email: "sam@recognitionhub.local",
    password: "Employee3@123",
    role: "Employee",
    department: "Sales",
    manager: null,
    points_balance: 0,
  },
];

const seedRecognitionCategories = [
  { name: "Teamwork", icon: "users", default_points: 50 },
  { name: "Innovation", icon: "lightbulb", default_points: 100 },
  { name: "Leadership", icon: "badge", default_points: 150 },
  { name: "Customer Focus", icon: "heart-handshake", default_points: 75 },
  { name: "Ownership", icon: "target", default_points: 125 },
];

const seedRewardCatalogItems = [
  {
    title: "$25 Coffee Gift Card",
    description: "Digital coffee card for everyday wins.",
    category: "gift_card",
    points_cost: 500,
    stock_quantity: null,
    image_url: "https://example.com/rewards/coffee-card.jpg",
    is_active: true,
  },
  {
    title: "$50 Multi-Brand Gift Card",
    description: "Flexible digital gift card across major retailers.",
    category: "gift_card",
    points_cost: 1200,
    stock_quantity: 25,
    image_url: "https://example.com/rewards/multi-brand-card.jpg",
    is_active: true,
  },
  {
    title: "Applauz Premium Hoodie",
    description: "Company-branded hoodie in multiple sizes.",
    category: "merchandise",
    points_cost: 2200,
    stock_quantity: 15,
    image_url: "https://example.com/rewards/hoodie.jpg",
    is_active: true,
  },
  {
    title: "Noise-Canceling Headphones",
    description: "Premium audio gear for deep focus sessions.",
    category: "merchandise",
    points_cost: 4500,
    stock_quantity: 8,
    image_url: "https://example.com/rewards/headphones.jpg",
    is_active: true,
  },
  {
    title: "Half-Day Recharge Leave",
    description: "Take a half-day off to recharge.",
    category: "leave",
    points_cost: 3000,
    stock_quantity: null,
    image_url: "https://example.com/rewards/half-day-leave.jpg",
    is_active: true,
  },
  {
    title: "Full-Day Wellness Leave",
    description: "Redeem a full wellness day with manager approval.",
    category: "leave",
    points_cost: 5500,
    stock_quantity: 5,
    image_url: "https://example.com/rewards/full-day-leave.jpg",
    is_active: true,
  },
];

async function seedDatabase() {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const currentMonthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  );

  await prisma.$transaction(async (tx) => {
    await tx.pointTransaction.deleteMany();
    await tx.redemption.deleteMany();
    await tx.pointBudget.deleteMany();
    await tx.recognition.deleteMany();
    await tx.recognitionCategory.deleteMany();
    await tx.rewardCatalog.deleteMany();
    await tx.user.deleteMany();
    await tx.department.deleteMany();
    await tx.role.deleteMany();
  });

  await prisma.role.create({
    data: {
      name: "Employee",
      permissions: {},
    },
  });
  await prisma.role.create({
    data: {
      name: "Manager",
      permissions: {},
    },
  });
  await prisma.role.create({
    data: {
      name: "HR",
      permissions: { canApproveRedemptions: true },
    },
  });

  await prisma.department.create({
    data: {
      name: "Engineering",
      description: "Engineering department",
    },
  });
  await prisma.department.create({
    data: {
      name: "Sales",
      description: "Sales department",
    },
  });

  const createdUsers = new Map();

  for (const seedUser of seedUsers) {
    const hashedPassword = await bcrypt.hash(seedUser.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        employee_code: seedUser.employee_code,
        name: seedUser.name,
        email: seedUser.email,
        password_hash: hashedPassword,
        role: {
          connect: {
            name: seedUser.role,
          },
        },
        ...(seedUser.department
          ? {
              department: {
                connect: {
                  name: seedUser.department,
                },
              },
            }
          : {}),
        ...(seedUser.manager
          ? {
              manager: {
                connect: {
                  id: createdUsers.get(seedUser.manager).id,
                },
              },
            }
          : {}),
        points_balance: seedUser.points_balance,
      },
    });

    createdUsers.set(seedUser.key, createdUser);
  }

  await prisma.pointBudget.create({
    data: {
      manager_id: createdUsers.get("manager").id,
      allocated_points: 2000,
      used_points: 0,
      period_start: currentMonthStart,
      period_end: currentMonthEnd,
    },
  });

  await Promise.all(
    seedRecognitionCategories.map((category) =>
      prisma.recognitionCategory.create({ data: category }),
    ),
  );

  await Promise.all(
    seedRewardCatalogItems.map((reward) =>
      prisma.rewardCatalog.create({ data: reward }),
    ),
  );

  console.log("Seed completed successfully.");
  console.log("Plaintext login passwords for local testing:");

  for (const seedUser of seedUsers) {
    console.log(`${seedUser.role}: ${seedUser.email} -> ${seedUser.password}`);
  }
}

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  seedDatabase,
  seedRecognitionCategories,
  seedRewardCatalogItems,
  seedUsers,
};
