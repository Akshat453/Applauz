const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seedUsers = [
  {
    key: "admin",
    employee_code: "ADM001",
    name: "Avery Admin",
    email: "admin@recognitionhub.local",
    password: "Admin@123",
    role: "Admin",
    department: null,
    manager: null,
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
  },
];

const seedRecognitionCategories = [
  {
    name: "Teamwork",
    icon: "users",
    default_points: 50,
  },
  {
    name: "Innovation",
    icon: "lightbulb",
    default_points: 100,
  },
  {
    name: "Leadership",
    icon: "badge",
    default_points: 150,
  },
  {
    name: "Customer Focus",
    icon: "heart-handshake",
    default_points: 75,
  },
  {
    name: "Ownership",
    icon: "target",
    default_points: 125,
  },
];

async function seedDatabase() {
  await prisma.recognition.deleteMany();
  await prisma.recognitionCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.role.deleteMany();

  const [employeeRole, managerRole, adminRole] = await Promise.all([
    prisma.role.create({
      data: {
        name: "Employee",
        permissions: {},
      },
    }),
    prisma.role.create({
      data: {
        name: "Manager",
        permissions: {},
      },
    }),
    prisma.role.create({
      data: {
        name: "Admin",
        permissions: { canApproveRedemptions: true },
      },
    }),
  ]);

  const [engineeringDepartment, salesDepartment] = await Promise.all([
    prisma.department.create({
      data: {
        name: "Engineering",
        description: "Engineering department",
      },
    }),
    prisma.department.create({
      data: {
        name: "Sales",
        description: "Sales department",
      },
    }),
  ]);

  const roleMap = new Map([
    ["Employee", employeeRole.id],
    ["Manager", managerRole.id],
    ["Admin", adminRole.id],
  ]);

  const departmentMap = new Map([
    ["Engineering", engineeringDepartment.id],
    ["Sales", salesDepartment.id],
  ]);

  const createdUsers = new Map();

  for (const seedUser of seedUsers) {
    const hashedPassword = await bcrypt.hash(seedUser.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        employee_code: seedUser.employee_code,
        name: seedUser.name,
        email: seedUser.email,
        password_hash: hashedPassword,
        role_id: roleMap.get(seedUser.role),
        department_id: seedUser.department
          ? departmentMap.get(seedUser.department)
          : null,
        manager_id: seedUser.manager
          ? createdUsers.get(seedUser.manager)?.id ?? null
          : null,
      },
    });

    createdUsers.set(seedUser.key, createdUser);
  }

  await Promise.all(
    seedRecognitionCategories.map((category) =>
      prisma.recognitionCategory.create({
        data: category,
      }),
    ),
  );

  console.log("Seed completed successfully.");
  console.log("Plaintext login passwords for local testing:");

  for (const seedUser of seedUsers) {
    console.log(
      `${seedUser.role}: ${seedUser.email} -> ${seedUser.password}`,
    );
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
  seedUsers,
};
