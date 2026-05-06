"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailPage() {
  const router = useRouter();
  const params = useParams();
  const payoutId = params.id as string;
  const [payout, setPayout] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    if (!payoutId) return;
    // Fetch specific payout and related errors
    fetch(`/api/payouts?limit=1`).then((r) => r.json()).then((j) => {
      const found = j.data?.find((p: any) => p.id === payoutId);
      setPayout(found || j.data?.[0]);
    });
    fetch(`/api/errors`).then((r) => r.json()).then((j) => setErrors(j.data || []));
  }, [payoutId]);

  if (!payout) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="text-blue-600 underline">← Back</button>
        <div>Loading...</div>
      </div>
    );
  }

  const mismatch = Math.abs(payout.expected_amount - payout.actual_amount);
  const mismatchPct = ((mismatch / payout.expected_amount) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-blue-600 underline">← Back</button>

      <h3 className="text-2xl font-semibold">Payout Details</h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Payout Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-500">Employee:</span> {payout.employee}</div>
            <div><span className="text-zinc-500">Region:</span> {payout.region}</div>
            <div><span className="text-zinc-500">Status:</span> {payout.status}</div>
            <div><span className="text-zinc-500">Processed:</span> {new Date(payout.processed_at).toLocaleString()}</div>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Processing Analysis</h4>
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-500">Expected Payout:</span> ${payout.expected_amount.toFixed(2)}</div>
            <div><span className="text-zinc-500">Actual Payout:</span> ${payout.actual_amount.toFixed(2)}</div>
            <div className={mismatch > 0.01 ? "text-red-600" : "text-green-600"}>
              <span className="text-zinc-500">Variance:</span> ${mismatch.toFixed(2)} ({mismatchPct}%)
            </div>
            <div><span className="text-zinc-500">Processing Time:</span> {payout.processing_time || 0} ms</div>
          </div>
        </section>
      </div>

      {mismatch > 0.01 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <h4 className="mb-2 font-medium text-red-900">Mismatch Detected</h4>
          <p className="text-sm text-red-800">Expected and actual payout amounts do not match. Review error logs for details.</p>
        </section>
      )}

      <section className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Related Errors</h4>
        {errors.length === 0 ? (
          <div className="text-sm text-zinc-500">No errors found for this payout.</div>
        ) : (
          <div className="space-y-2">
            {errors.slice(0, 5).map((e) => (
              <div key={e.id} className="rounded border p-2 text-sm">
                <div className="font-medium">{e.type}</div>
                <div className="text-zinc-600">{e.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
