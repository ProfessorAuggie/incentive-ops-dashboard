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
    // Normal cases
    { employeeId: allEmployees[0].id, expected: 5000, actual: 5000, sales: 15000, target: 10000, delay: false, error: false },
    { employeeId: allEmployees[0].id, expected: 3500, actual: 3450, sales: 12000, target: 10000, delay: false, error: true },
    
    // Correct payout with delay
    { employeeId: allEmployees[1].id, expected: 4200, actual: 4200, sales: 14000, target: 12000, delay: true, error: false },
    { employeeId: allEmployees[1].id, expected: 2800, actual: 2850, sales: 9000, target: 8000, delay: false, error: false },
    
    // Normal high performer
    { employeeId: allEmployees[2].id, expected: 6000, actual: 5950, sales: 20000, target: 15000, delay: false, error: false },
    
    // ERROR: Incorrect payout (zero payout but exceeded target)
    { employeeId: allEmployees[2].id, expected: 4500, actual: 0, sales: 16000, target: 12000, delay: false, error: true, flagAsIncorrect: true },
    
    // Normal middle performer
    { employeeId: allEmployees[3].id, expected: 3000, actual: 3000, sales: 11000, target: 9000, delay: false, error: false },
    
    // ERROR: Suspicious value (payout too high relative to sales)
    { employeeId: allEmployees[3].id, expected: 2500, actual: 7500, sales: 12000, target: 10000, delay: true, error: true, flagAsSuspicious: true },
    
    // Normal performer
    { employeeId: allEmployees[4].id, expected: 3800, actual: 3800, sales: 13000, target: 11000, delay: false, error: false },
    
    // Another normal case
    { employeeId: allEmployees[4].id, expected: 2200, actual: 2200, sales: 8000, target: 7000, delay: false, error: false },
  ];

  const incentives = await Promise.all(
    incentiveData.map((data: any) => {
      const variance = data.actual - data.expected;
      const variancePercent = (Math.abs(variance) / data.expected) * 100;
      const processingTime = data.delay ? 6000 + Math.random() * 5000 : Math.random() * 3000;

      const isIncorrectPayout = data.flagAsIncorrect ?? (data.actual === 0 && data.sales > data.target);
      const isSuspiciousValue = data.flagAsSuspicious ?? (data.sales > 0 && data.actual / data.sales > 0.5);

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
          salesAmount: data.sales,
          salesTarget: data.target,
          hasError: data.error,
          isIncorrectPayout,
          isSuspiciousValue,
          errorType: data.error
            ? isIncorrectPayout ? "incorrect_payout"
            : isSuspiciousValue ? "suspicious_value"
            : ["data_issue", "logic_issue", "delay_issue"][Math.floor(Math.random() * 3)]
            : null,
          errorDescription: data.error
            ? isIncorrectPayout ? `Zero payout despite achieving sales target: $${data.sales.toFixed(2)} sales vs $${data.target.toFixed(2)} target`
            : isSuspiciousValue ? `Payout unusually high relative to sales: $${data.actual.toFixed(2)} payout on $${data.sales.toFixed(2)} sales`
            : [
                "Missing employee classification",
                "Calculation mismatch in formula",
                "Processing timeout exceeded",
                "Invalid data in submission",
              ][Math.floor(Math.random() * 4)]
            : null,
          errorSeverity: data.error
            ? isIncorrectPayout ? "critical"
            : isSuspiciousValue ? "high"
            : ["critical", "high", "medium"][Math.floor(Math.random() * 3)]
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
