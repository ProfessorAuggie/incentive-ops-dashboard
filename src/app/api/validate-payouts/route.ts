import { NextResponse } from "next/server";
import { validateIncentives } from "../../../services/validation";

/**
 * POST /api/validate-payouts
 * Validates recent incentive payouts from shared database
 */
export async function POST() {
  try {
    const results = await validateIncentives();
    return NextResponse.json({ results, count: results.length });
  } catch (err) {
    console.error("/api/validate-payouts", err);
    return NextResponse.json(
      { results: [], count: 0, error: "Validation failed" },
      { status: 500 }
    );
  }
}
