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
  classification: "Data issue" | "Logic issue" | "Delay issue" | "Incorrect payout" | "Suspicious value" | "Unknown";
  salesAmount: number;
  salesTarget: number;
  expectedAmount: number;
  actualAmount: number;
  variance: number;
};

export type InvalidPayout = {
  id: string;
  employeeId: string;
  employeeName: string;
  region: string;
  period: string;
  errorType: "incorrect_payout" | "suspicious_value";
  classification: "Incorrect payout" | "Suspicious value";
  errorDescription: string;
  errorSeverity: "critical" | "high";
  salesAmount: number;
  salesTarget: number;
  expectedAmount: number;
  actualAmount: number;
  variance: number;
};

/**
 * Detects invalid payouts and suspicious values
 * - Flag if payout = 0 but sales > target
 * - Flag if payout too high relative to sales
 */
export async function detectInvalidPayouts(): Promise<InvalidPayout[]> {
  try {
    const incentives = await prisma.incentive.findMany({
      include: {
        employee: {
          select: { id: true, name: true, email: true, region: true },
        },
      },
    });

    const flagged = incentives.filter((inc: any) => {
      // Rule 1: Payout = 0 but sales > target
      const incorrectPayout = inc.actualAmount === 0 && inc.salesAmount > inc.salesTarget;

      // Rule 2: Payout too high relative to sales (payout > 50% of sales)
      const suspiciousValue = inc.salesAmount > 0 && inc.actualAmount / inc.salesAmount > 0.5;

      return incorrectPayout || suspiciousValue;
    });

    return flagged.map((inc: any) => ({
      id: inc.id,
      employeeId: inc.employeeId,
      employeeName: inc.employee.name,
      region: inc.employee.region,
      period: inc.period,
      errorType: inc.actualAmount === 0 && inc.salesAmount > inc.salesTarget ? "incorrect_payout" : "suspicious_value",
      classification: inc.actualAmount === 0 && inc.salesAmount > inc.salesTarget ? "Incorrect payout" : "Suspicious value",
      errorDescription: inc.actualAmount === 0 && inc.salesAmount > inc.salesTarget 
        ? `Zero payout despite achieving sales target: $${inc.salesAmount.toFixed(2)} sales vs $${inc.salesTarget.toFixed(2)} target`
        : `Payout unusually high relative to sales: $${inc.actualAmount.toFixed(2)} payout on $${inc.salesAmount.toFixed(2)} sales`,
      errorSeverity: inc.actualAmount === 0 && inc.salesAmount > inc.salesTarget ? "critical" : "high",
      salesAmount: inc.salesAmount,
      salesTarget: inc.salesTarget,
      expectedAmount: inc.expectedAmount,
      actualAmount: inc.actualAmount,
      variance: inc.actualAmount - inc.expectedAmount,
    }));
  } catch (err) {
    console.error("detectInvalidPayouts error:", err);
    return [];
  }
}

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

    const classified: ClassifiedError[] = incentives.map((inc: any) => {
      let classification: ClassifiedError["classification"] = "Unknown";

      if (inc.errorType === "incorrect_payout") {
        classification = "Incorrect payout";
      } else if (inc.errorType === "suspicious_value") {
        classification = "Suspicious value";
      } else if (inc.errorType === "delay_issue" || inc.errorDescription?.toLowerCase().includes("delay")) {
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
        salesAmount: inc.salesAmount,
        salesTarget: inc.salesTarget,
        expectedAmount: inc.expectedAmount,
        actualAmount: inc.actualAmount,
        variance: inc.variance ?? inc.actualAmount - inc.expectedAmount,
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
    const withVariance = recent.filter((inc: any) => inc.variance !== null);
    const avgVariance =
      withVariance.length > 0
        ? withVariance.reduce((sum: number, inc: any) => sum + (inc.variance ?? 0), 0) / withVariance.length
        : 0;

    // Flag outliers (variance > 5% from mean)
    const anomalies = recent.filter((inc: any) => {
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

