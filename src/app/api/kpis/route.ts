import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { detectAnomalies, detectInvalidPayouts } from "../../../services/errorDetection";

/**
 * GET /api/kpis
 * Returns incentive operation KPI metrics from shared database
 * 
 * Includes:
 * - Total payouts processed
 * - Average incentive amount
 * - Anomaly count and detection
 * - Error breakdown (data, logic, delay, incorrect payout, suspicious values)
 */
export async function GET() {
  try {
    // Count incentives
    const totalIncentives = await prisma.incentive.count();

    // Get all incentives for analysis
    const allIncentives = await prisma.incentive.findMany({
      select: { actualAmount: true, expectedAmount: true, variance: true }
    });

    // Count errors by type
    const errorCount = await prisma.incentive.count({ where: { hasError: true } });
    const dataIssues = await prisma.incentive.count({ where: { errorType: "data_issue" } });
    const logicIssues = await prisma.incentive.count({ where: { errorType: "logic_issue" } });
    const delayIssues = await prisma.incentive.count({ where: { errorType: "delay_issue" } });

    // Detect incorrect payouts and suspicious values
    const incorrectPayouts = await detectInvalidPayouts();
    const incorrectPayoutCount = incorrectPayouts.filter(e => e.errorType === "incorrect_payout").length;
    const suspiciousValueCount = incorrectPayouts.filter(e => e.errorType === "suspicious_value").length;

    // Calculate average processing time
    const avgProcessing = await prisma.incentive.aggregate({
      _avg: { processingTimeMs: true },
    });

    // Count pending incentives
    const pendingCount = await prisma.incentive.count({
      where: { status: "pending" },
    });

    // Calculate average amounts
    const avgActual = allIncentives.reduce((sum, inc) => sum + inc.actualAmount, 0) / totalIncentives || 0;
    const avgExpected = allIncentives.reduce((sum, inc) => sum + inc.expectedAmount, 0) / totalIncentives || 0;

    // Detect anomalies
    const anomalies = await detectAnomalies();

    // Calculate average accuracy (SLA compliance)
    const perfMetrics = await prisma.performance.aggregate({
      _avg: { slaCompliance: true, accuracyRate: true },
    });

    const kpis = {
      // Primary metrics
      totalIncentivesProcessed: totalIncentives,
      averageIncentive: Math.round(avgActual * 100) / 100,
      
      // Error metrics
      errorRate: totalIncentives > 0 ? Math.round((errorCount / totalIncentives) * 10000) / 100 : 0,
      anomalyCount: anomalies.anomalyCount,
      
      // Error breakdown
      errorBreakdown: {
        dataIssues,
        logicIssues,
        delayIssues,
        incorrectPayouts: incorrectPayoutCount,
        suspiciousValues: suspiciousValueCount,
      },
      
      // Processing metrics
      avgProcessingTimeMs: Math.round((avgProcessing._avg.processingTimeMs ?? 0) * 100) / 100,
      pendingIncentives: pendingCount,
      
      // Quality metrics
      slaCompliance: Math.round((perfMetrics._avg.slaCompliance ?? 100) * 100) / 100,
      avgAccuracy: Math.round((perfMetrics._avg.accuracyRate ?? 100) * 100) / 100,
      
      // Variance metrics
      avgVariancePercent: anomalies.avgVariancePercent,
    };

    return NextResponse.json(kpis);
  } catch (err) {
    console.error("/api/kpis", err);
    // Return fallback data
    return NextResponse.json({
      totalIncentivesProcessed: 0,
      averageIncentive: 0,
      errorRate: 0,
      anomalyCount: 0,
      errorBreakdown: {
        dataIssues: 0,
        logicIssues: 0,
        delayIssues: 0,
        incorrectPayouts: 0,
        suspiciousValues: 0,
      },
      avgProcessingTimeMs: 0,
      pendingIncentives: 0,
      slaCompliance: 100,
      avgAccuracy: 100,
      avgVariancePercent: 0,
    });
  }
}