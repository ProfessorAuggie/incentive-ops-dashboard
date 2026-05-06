import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/payouts
 * Fetches incentive payout data from shared database
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);

    const incentives = await prisma.incentive.findMany({
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
      expectedAmount: inc.expectedAmount,
      actualAmount: inc.actualAmount,
      variance: inc.variance,
      variancePercent: inc.variancePercent,
      processingTimeMs: inc.processingTimeMs,
      status: inc.status,
      period: inc.period,
      hasError: inc.hasError,
      errorType: inc.errorType,
      processedAt: inc.processedAt,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("/api/payouts", err);
    return NextResponse.json({ data: [] });
  }
}
