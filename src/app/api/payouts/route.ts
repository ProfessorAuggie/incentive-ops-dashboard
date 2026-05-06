import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);

    const payouts = await prisma.payout.findMany({ take: limit, orderBy: { processed_at: "desc" } });
    return NextResponse.json({ data: payouts });
  } catch (err) {
    console.error("/api/payouts", err);
    return NextResponse.json({ data: [] });
  }
}
