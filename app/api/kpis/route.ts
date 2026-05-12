import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const incentives =
    await prisma.incentive.findMany();

  const totalPayout =
    incentives.reduce(
      (acc, curr) =>
        acc + curr.finalPayout,
      0
    );

  const anomalies =
    incentives.filter(
      (i) => i.anomalyFlag
    ).length;

  return NextResponse.json({
    totalPayout,
    anomalies,
    count: incentives.length,
  });
}
