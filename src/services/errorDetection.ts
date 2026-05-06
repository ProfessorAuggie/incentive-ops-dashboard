import { prisma } from "../lib/prisma";

export type ClassifiedError = {
  id: string;
  employeeId: string;
  employeeName: string;
  region: string;
  period: string;
  errorType: string | null;
  errorDescription: string | null;
  errorSeverity: string | null;
  classification: "Data issue" | "Logic issue" | "Delay issue" | "Unknown";
};

/**
 * Classifies errors from the shared Incentive records
 * Uses errorType and errorDescription to determine classification
 */
export async function classifyErrors(limit = 100) {
  try {
    const incentives = await prisma.incentive.findMany({
      where: { hasError: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          select: { id: true, name: true, email: true, region: true },
        },
      },
    });

    const classified: ClassifiedError[] = incentives.map((inc) => {
      let classification: ClassifiedError["classification"] = "Unknown";

      if (inc.errorType === "delay_issue" || inc.errorDescription?.toLowerCase().includes("delay")) {
        classification = "Delay issue";
      } else if (
        inc.errorType === "logic_issue" ||
        inc.errorDescription?.toLowerCase().includes("calculation")
      ) {
        classification = "Logic issue";
      } else if (
        inc.errorType === "data_issue" ||
        inc.errorDescription?.toLowerCase().includes("missing")
      ) {
        classification = "Data issue";
      }

      return {
        id: inc.id,
        employeeId: inc.employeeId,
        employeeName: inc.employee.name,
        region: inc.employee.region,
        period: inc.period,
        errorType: inc.errorType,
        errorDescription: inc.errorDescription,
        errorSeverity: inc.errorSeverity,
        classification,
      };
    });

    return classified;
  } catch (err) {
    console.error("classifyErrors", err);
    return [];
  }
}

/**
 * Detects anomalies in incentive data
 * Returns incentives with unusual patterns
 */
export async function detectAnomalies() {
  try {
    // Get recent incentives
    const recent = await prisma.incentive.findMany({
      take: 200,
      orderBy: { processedAt: "desc" },
      include: {
        employee: true,
      },
    });

    // Calculate average variance across all incentives
    const withVariance = recent.filter((inc) => inc.variance !== null);
    const avgVariance =
      withVariance.length > 0
        ? withVariance.reduce((sum, inc) => sum + (inc.variance ?? 0), 0) / withVariance.length
        : 0;

    // Flag outliers (variance > 2 standard deviations from mean)
    const anomalies = recent.filter((inc) => {
      if (inc.variance === null || inc.variancePercent === null) return false;
      return Math.abs(inc.variancePercent) > 5; // > 5% variance
    });

    return {
      total: recent.length,
      anomalyCount: anomalies.length,
      avgVariancePercent: parseFloat(((avgVariance / 100) * 100).toFixed(2)),
      anomalies: anomalies.slice(0, 20),
    };
  } catch (err) {
    console.error("detectAnomalies", err);
    return {
      total: 0,
      anomalyCount: 0,
      avgVariancePercent: 0,
      anomalies: [],
    };
  }
}

