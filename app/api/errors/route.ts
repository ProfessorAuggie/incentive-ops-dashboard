import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const errors =
    await prisma.incentive.findMany({
      where: {
        anomalyFlag: true,
      },
      include: {
        employee: true,
      },
    });

  return NextResponse.json(errors);
}
