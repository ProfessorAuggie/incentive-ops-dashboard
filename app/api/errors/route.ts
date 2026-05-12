import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const incentives = await prisma.incentive.findMany({
    include: {
      employee: true,
    },
  });

  const errors = incentives.filter(
    (i) => i.anomalyFlag
  );

  return NextResponse.json(errors);
}
