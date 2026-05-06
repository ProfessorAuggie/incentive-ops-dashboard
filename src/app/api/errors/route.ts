import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/errors
 * Fetches error records from shared Incentive data
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const errorType = url.searchParams.get("errorType");
    const region = url.searchParams.get("region");

    const where: any = { hasError: true };

    if (errorType) {
      where.errorType = errorType;
    }
    if (region) {
      where.employee = { region };
    }

    const incentives = await prisma.incentive.findMany({
      where,
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          select: { name: true, email: true, region: true, department: true },
        },
      },
    });

    const errors = incentives.map((inc) => ({
      id: inc.id,
      employeeId: inc.employeeId,
      employeeName: inc.employee.name,
      employeeEmail: inc.employee.email,
      region: inc.employee.region,
      department: inc.employee.department,
      type: inc.errorType || "Unknown",
      severity: inc.errorSeverity || "medium",
      description: inc.errorDescription || "No description",
      period: inc.period,
      expectedAmount: inc.expectedAmount,
      actualAmount: inc.actualAmount,
      variance: inc.variance,
      createdAt: inc.createdAt,
    }));

    return NextResponse.json({ data: errors });
  } catch (err) {
    console.error("/api/errors", err);
    return NextResponse.json({ data: [] });
  }
}
