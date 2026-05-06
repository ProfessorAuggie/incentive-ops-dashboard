import { NextResponse } from "next/server";
import { classifyErrors, detectInvalidPayouts } from "../../../services/errorDetection";

/**
 * GET /api/errors
 * Fetches and detects errors from shared Incentive data
 * 
 * Detects:
 * - Data issues (missing/invalid data)
 * - Logic issues (calculation mismatches)
 * - Delay issues (processing delays)
 * - Incorrect payouts (zero payout when sales > target)
 * - Suspicious values (payout too high relative to sales)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const errorType = url.searchParams.get("errorType");
    const region = url.searchParams.get("region");

    // Get classified errors from existing error records
    const classifiedErrors = await classifyErrors(200);
    
    // Detect invalid payouts (zero payout with sales > target, suspicious values)
    const invalidPayouts = await detectInvalidPayouts();
    
    // Combine all errors
    let allErrors = [...classifiedErrors, ...invalidPayouts];

    // Apply filters
    if (errorType && errorType !== "all") {
      allErrors = allErrors.filter((err) => err.errorType === errorType);
    }

    if (region && region !== "all") {
      allErrors = allErrors.filter((err) => err.region === region);
    }

    // Format for API response
    const errors = allErrors.map((err) => ({
      id: err.id,
      employeeId: err.employeeId,
      employeeName: err.employeeName,
      region: err.region,
      type: err.errorType || "Unknown",
      severity: err.errorSeverity || "medium",
      description: err.errorDescription || "No description",
      period: err.period,
      classification: err.classification,
      expectedAmount: err.expectedAmount,
      actualAmount: err.actualAmount,
      salesAmount: err.salesAmount || 0,
      salesTarget: err.salesTarget || 0,
      variance: err.variance,
    }));

    const breakdown = {
      total: allErrors.length,
      byType: {
        "data_issue": allErrors.filter((e) => e.errorType === "data_issue").length,
        "logic_issue": allErrors.filter((e) => e.errorType === "logic_issue").length,
        "delay_issue": allErrors.filter((e) => e.errorType === "delay_issue").length,
        "incorrect_payout": allErrors.filter((e) => e.errorType === "incorrect_payout").length,
        "suspicious_value": allErrors.filter((e) => e.errorType === "suspicious_value").length,
      },
      bySeverity: {
        "critical": allErrors.filter((e) => e.errorSeverity === "critical").length,
        "high": allErrors.filter((e) => e.errorSeverity === "high").length,
        "medium": allErrors.filter((e) => e.errorSeverity === "medium").length,
        "low": allErrors.filter((e) => e.errorSeverity === "low").length,
      },
    };

    return NextResponse.json({ 
      data: errors.slice(0, 100),
      breakdown 
    });
  } catch (err) {
    console.error("/api/errors", err);
    return NextResponse.json({ data: [], breakdown: {} });
  }
}
