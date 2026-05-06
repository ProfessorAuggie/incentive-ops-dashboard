import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const total = await prisma.payout.count();
    const errors = await prisma.errorLog.count();
    const avgTime = await prisma.payout.aggregate({ _avg: { processing_time: true } });

    const kpis = {
      totalPayouts: total,
      errorRate: total > 0 ? Math.round((errors / total) * 10000) / 100 : 0,
      avgProcessingTimeMs: Math.round((avgTime._avg.processing_time ?? 0) * 100) / 100,
      pendingPayouts: await prisma.payout.count({ where: { status: "pending" } }),
    };

    return NextResponse.json(kpis);
  } catch (err) {
    console.error("/api/kpis", err);
    // fallback sample data
    return NextResponse.json({
      totalPayouts: 12432,
      errorRate: 1.23,
      avgProcessingTimeMs: 2130,
      pendingPayouts: 42,
    });
  }
}
