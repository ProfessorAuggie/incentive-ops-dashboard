import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/kpis
 * Returns incentive operation KPI metrics from shared database
 */
export async function GET() {
  try {
    // Count incentives
    const totalIncentives = await prisma.incentive.count();

    // Count errors (hasError = true)
    const errorCount = await prisma.incentive.count({ where: { hasError: true } });

    // Calculate average processing time
    const avgProcessing = await prisma.incentive.aggregate({
      _avg: { processingTimeMs: true },
    });

    // Count pending incentives
    const pendingCount = await prisma.incentive.count({
      where: { status: "pending" },
    });

    // Calculate average accuracy (SLA compliance)
    const perfMetrics = await prisma.performance.aggregate({
      _avg: { slaCompliance: true, accuracyRate: true },
    });

    const kpis = {
      totalIncentivesProcessed: totalIncentives,
      errorRate: totalIncentives > 0 ? Math.round((errorCount / totalIncentives) * 10000) / 100 : 0,
      avgProcessingTimeMs: Math.round((avgProcessing._avg.processingTimeMs ?? 0) * 100) / 100,
      pendingIncentives: pendingCount,
      slaCompliance: Math.round((perfMetrics._avg.slaCompliance ?? 100) * 100) / 100,
      avgAccuracy: Math.round((perfMetrics._avg.accuracyRate ?? 100) * 100) / 100,
    };

    return NextResponse.json(kpis);
  } catch (err) {
    console.error("/api/kpis", err);
    // Return fallback data
    return NextResponse.json({
      totalIncentivesProcessed: 0,
      errorRate: 0,
      avgProcessingTimeMs: 0,
      pendingIncentives: 0,
      slaCompliance: 100,
      avgAccuracy: 100,
    });
  }
}

