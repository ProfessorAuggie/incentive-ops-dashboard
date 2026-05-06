import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding shared database...");

  // Create sample employees
  const employees = await prisma.employee.createMany({
    data: [
      {
        name: "Alice Johnson",
        email: "alice.johnson@company.com",
        region: "US",
        department: "Sales",
        role: "Sales Manager",
        hireDate: new Date("2022-01-15"),
        status: "active",
      },
      {
        name: "Bob Smith",
        email: "bob.smith@company.com",
        region: "EMEA",
        department: "Operations",
        role: "Operations Analyst",
        hireDate: new Date("2021-06-20"),
        status: "active",
      },
      {
        name: "Carol Davis",
        email: "carol.davis@company.com",
        region: "APAC",
        department: "Finance",
        role: "Finance Manager",
        hireDate: new Date("2020-03-10"),
        status: "active",
      },
      {
        name: "David Chen",
        email: "david.chen@company.com",
        region: "US",
        department: "Sales",
        role: "Sales Rep",
        hireDate: new Date("2023-02-01"),
        status: "active",
      },
      {
        name: "Emma Wilson",
        email: "emma.wilson@company.com",
        region: "EMEA",
        department: "Operations",
        role: "Operations Coordinator",
        hireDate: new Date("2022-09-15"),
        status: "active",
      },
    ],
  });

  console.log(`✓ Created ${employees.count} employees`);

  // Fetch employees for creating incentives
  const allEmployees = await prisma.employee.findMany();

  // Create sample incentives with various statuses and amounts
  const incentiveData = [
    { employeeId: allEmployees[0].id, expected: 5000, actual: 5000, delay: false, error: false },
    { employeeId: allEmployees[0].id, expected: 3500, actual: 3450, delay: false, error: true },
    {
      employeeId: allEmployees[1].id,
      expected: 4200,
      actual: 4200,
      delay: true,
      error: false,
    },
    { employeeId: allEmployees[1].id, expected: 2800, actual: 2850, delay: false, error: false },
    { employeeId: allEmployees[2].id, expected: 6000, actual: 5950, delay: false, error: false },
    { employeeId: allEmployees[2].id, expected: 4500, actual: 4100, delay: false, error: true },
    { employeeId: allEmployees[3].id, expected: 3000, actual: 3000, delay: false, error: false },
    { employeeId: allEmployees[3].id, expected: 2500, actual: 2550, delay: true, error: true },
    { employeeId: allEmployees[4].id, expected: 3800, actual: 3800, delay: false, error: false },
    {
      employeeId: allEmployees[4].id,
      expected: 2200,
      actual: 2200,
      delay: false,
      error: false,
    },
  ];

  const incentives = await Promise.all(
    incentiveData.map((data) => {
      const variance = data.actual - data.expected;
      const variancePercent = (Math.abs(variance) / data.expected) * 100;
      const processingTime = data.delay ? 6000 + Math.random() * 5000 : Math.random() * 3000;

      return prisma.incentive.create({
        data: {
          employeeId: data.employeeId,
          expectedAmount: data.expected,
          actualAmount: data.actual,
          variance: variance > 0.01 ? variance : null,
          variancePercent: variance > 0.01 ? variancePercent : null,
          processingTimeMs: Math.round(processingTime),
          status: "processed",
          period: "2026-05",
          hasError: data.error,
          errorType: data.error
            ? ["data_issue", "logic_issue", "delay_issue"][Math.floor(Math.random() * 3)]
            : null,
          errorDescription: data.error
            ? [
                "Missing employee classification",
                "Calculation mismatch in formula",
                "Processing timeout exceeded",
                "Invalid data in submission",
              ][Math.floor(Math.random() * 4)]
            : null,
          errorSeverity: data.error
            ? ["critical", "high", "medium"][Math.floor(Math.random() * 3)]
            : null,
        },
      });
    })
  );

  console.log(`✓ Created ${incentives.length} incentive records`);

  // Create performance metrics for each employee
  const performances = await Promise.all(
    allEmployees.map((emp) =>
      prisma.performance.create({
        data: {
          employeeId: emp.id,
          metricsDate: new Date(),
          payoutsProcessed: Math.floor(Math.random() * 50) + 10,
          errorCount: Math.floor(Math.random() * 5),
          avgProcessingTimeMs: Math.random() * 3000 + 1000,
          slaCompliance: 90 + Math.random() * 8,
          accuracyRate: 95 + Math.random() * 5,
          delayRate: Math.random() * 3,
          status: "active",
        },
      })
    )
  );

  console.log(`✓ Created ${performances.length} performance records`);

  console.log("✅ Database seeding complete!");

  // Print summary
  console.log("\n📊 Database Summary:");
  console.log(`  • Employees: ${allEmployees.length}`);
  console.log(`  • Incentives: ${incentives.length}`);
  console.log(`  • Performance Records: ${performances.length}`);
  console.log("\n✨ The shared database is now ready for use!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
