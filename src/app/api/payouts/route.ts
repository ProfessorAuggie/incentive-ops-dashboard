import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/payouts
 * Fetches all incentive/payout data from shared database
 * 
 * Includes:
 * - Employee information
 * - Payout amounts (expected vs actual)
 * - Sales performance data
 * - Processing and error details
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const status = url.searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const incentives = await prisma.incentive.findMany({
      where,
      take: limit,
      orderBy: { processedAt: "desc" },
      include: {
        employee: {
          select: { id: true, name: true, email: true, region: true, department: true },
        },
      },
    });

    const data = incentives.map((inc) => ({
      id: inc.id,
      employeeId: inc.employeeId,
      employeeName: inc.employee.name,
      employeeEmail: inc.employee.email,
      region: inc.employee.region,
      department: inc.employee.department,
      
      // Payout details
      expectedAmount: inc.expectedAmount,
      actualAmount: inc.actualAmount,
      variance: inc.variance,
      variancePercent: inc.variancePercent,
      
      // Sales performance
      salesAmount: inc.salesAmount,
      salesTarget: inc.salesTarget,
      salesTargetAchieved: inc.salesAmount >= inc.salesTarget,
      salesToPayoutRatio: inc.salesAmount > 0 ? (inc.actualAmount / inc.salesAmount * 100).toFixed(2) + "%" : "N/A",
      
      // Processing
      processingTimeMs: inc.processingTimeMs,
      processingTimeExceeded: (inc.processingTimeMs ?? 0) > 5000,
      
      // Status and errors
      status: inc.status,
      period: inc.period,
      hasError: inc.hasError,
      isIncorrectPayout: inc.isIncorrectPayout,
      isSuspiciousValue: inc.isSuspiciousValue,
      errorType: inc.errorType,
      errorDescription: inc.errorDescription,
      errorSeverity: inc.errorSeverity,
      
      processedAt: inc.processedAt,
    }));

    return NextResponse.json({ 
      data,
      count: data.length,
      total: await prisma.incentive.count({ where })
    });
  } catch (err) {
    console.error("/api/payouts", err);
    return NextResponse.json({ data: [], count: 0, total: 0 });
  }
}
