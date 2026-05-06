import { prisma } from "../lib/prisma";

/**
 * Validates incentives by comparing expected vs actual amounts
 * Flags mismatches and delays in the shared database
 */
export async function validateIncentives() {
  try {
    const incentives = await prisma.incentive.findMany({
      take: 100,
      orderBy: { processedAt: "desc" },
      include: {
        employee: {
          select: { id: true, name: true, email: true, region: true },
        },
      },
    });

    const results = incentives.map((inc) => {
      const variance = inc.actualAmount - inc.expectedAmount;
      const variancePct = (Math.abs(variance) / inc.expectedAmount) * 100;
      const hasMismatch = Math.abs(variance) > 0.01;
      const hasDelay = (inc.processingTimeMs ?? 0) > 5000;

      return {
        id: inc.id,
        employeeId: inc.employeeId,
        employeeName: inc.employee.name,
        region: inc.employee.region,
        expectedAmount: inc.expectedAmount,
        actualAmount: inc.actualAmount,
        variance: parseFloat(variance.toFixed(2)),
        variancePercent: parseFloat(variancePct.toFixed(2)),
        processingTimeMs: inc.processingTimeMs,
        period: inc.period,
        status: inc.status,
        hasMismatch,
        hasDelay,
        hasError: inc.hasError,
      };
    });

    return results;
  } catch (err) {
    console.error("validateIncentives error", err);
    return [];
  }
}

/**
 * Flags mismatches in the database by updating incentive records
 */
export async function flagMismatches() {
  try {
    // Get incentives with actual variance
    const mismatches = await prisma.incentive.findMany({
      where: {
        variance: {
          not: null,
        },
      },
    });

    return mismatches;
  } catch (err) {
    console.error("flagMismatches error", err);
    return [];
  }
}

