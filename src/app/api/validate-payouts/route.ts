import { NextResponse } from "next/server";
import { validatePayouts } from "../../../services/validation";

export async function POST() {
  try {
    const results = await validatePayouts();
    return NextResponse.json({ results });
  } catch (err) {
    console.error("/api/validate-payouts", err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
