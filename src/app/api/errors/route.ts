import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const region = url.searchParams.get("region");

    const where: any = {};
    if (type) where.type = type;
    if (region) where.region = region;

    const errors = await prisma.errorLog.findMany({ where, take: 200, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: errors });
  } catch (err) {
    console.error("/api/errors", err);
    return NextResponse.json({ data: [] });
  }
}
