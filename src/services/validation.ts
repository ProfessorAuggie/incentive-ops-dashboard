import { prisma } from "../lib/prisma";

export async function validatePayouts() {
  // Fetch recent payouts and compare expected vs actual
  try {
    const payouts = await prisma.payout.findMany({ take: 100, orderBy: { processed_at: "desc" } });

    const results = payouts.map((p) => {
      const mismatch = Math.abs(p.expected_amount - p.actual_amount) > 0.01;
      const delay = (p.processing_time ?? 0) > 5_000; // >5s
      return {
        id: p.id,
        employee: p.employee,
        region: p.region,
        expected: p.expected_amount,
        actual: p.actual_amount,
        mismatch,
        delay,
      };
    });

    return results;
  } catch (err) {
    console.error("validatePayouts error", err);
    // fallback: return empty
    return [];
  }
}
