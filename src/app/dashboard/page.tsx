"use client";
import { useEffect, useMemo, useState } from "react";
import KpiCard from "../components/KpiCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [flaggedErrors, setFlaggedErrors] = useState<any[]>([]);

  const regionData = useMemo(() => {
    const totals = new Map<string, number>();

    for (const payout of payouts) {
      const region = payout.region ?? "Unknown";
      const amount = Number(payout.actualAmount ?? 0);
      totals.set(region, (totals.get(region) ?? 0) + amount);
    }

    return Array.from(totals.entries()).map(([region, payout]) => ({ region, payout }));
  }, [payouts]);

  const trendData = useMemo(() => {
    return payouts.slice(0, 7).reverse().map((payout, index) => ({
      label: payout.period ?? `Txn ${index + 1}`,
      processingTimeMs: Number(payout.processingTimeMs ?? 0),
    }));
  }, [payouts]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [kpisResponse, payoutsResponse, errorsResponse] = await Promise.all([
        fetch("/api/kpis", { cache: "no-store" }),
        fetch("/api/payouts?limit=50", { cache: "no-store" }),
        fetch("/api/errors?errorType=all&region=all", { cache: "no-store" }),
      ]);

      const [kpisJson, payoutsJson, errorsJson] = await Promise.all([
        kpisResponse.json(),
        payoutsResponse.json(),
        errorsResponse.json(),
      ]);

      setKpis(kpisJson);
      setPayouts(payoutsJson.data || []);
      setFlaggedErrors(errorsJson.data || []);
    };

    void loadDashboard();
  }, []);

  const hasKpis = Boolean(kpis);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Monitoring Dashboard</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Live shared-database view for payouts, anomalies, and validation flags.
          </p>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Refreshed on page load from the shared Neon database.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="Total Payouts" value={hasKpis ? kpis.totalIncentivesProcessed : "—"} />
        <KpiCard title="Average Incentive" value={hasKpis ? `$${Number(kpis.averageIncentive).toFixed(2)}` : "—"} />
        <KpiCard title="Anomalies" value={hasKpis ? kpis.anomalyCount : "—"} />
        <KpiCard title="Error Rate" value={hasKpis ? `${Number(kpis.errorRate).toFixed(2)}%` : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Region vs Payout</h4>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="payout" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Processing Time Trend</h4>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="processingTimeMs" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Flagged Errors</h4>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-left text-sm text-zinc-500">
              <tr>
                <th className="pb-2">Employee</th>
                <th className="pb-2">Region</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Severity</th>
                <th className="pb-2">Sales</th>
                <th className="pb-2">Payout</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {flaggedErrors.length === 0 ? (
                <tr className="border-t">
                  <td className="py-4 text-sm text-zinc-500" colSpan={7}>
                    No flagged errors detected.
                  </td>
                </tr>
              ) : (
                flaggedErrors.map((error) => (
                  <tr key={error.id} className="border-t align-top">
                    <td className="py-3">{error.employeeName}</td>
                    <td>{error.region}</td>
                    <td>{error.type}</td>
                    <td>
                      <span className={error.severity === "critical" ? "text-red-600" : "text-amber-600"}>
                        {error.severity}
                      </span>
                    </td>
                    <td>${Number(error.salesAmount ?? 0).toFixed(2)}</td>
                    <td>${Number(error.actualAmount ?? 0).toFixed(2)}</td>
                    <td className="max-w-[24rem] text-sm text-zinc-500">{error.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
