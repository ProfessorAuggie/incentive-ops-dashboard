"use client";
import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [regionData, setRegionData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/kpis").then((r) => r.json()).then(setKpis);
    fetch("/api/payouts?limit=10").then((r) => r.json()).then((j) => setPayouts(j.data || []));

    // sample region chart
    setRegionData([
      { region: "US", payouts: 5400 },
      { region: "EMEA", payouts: 3200 },
      { region: "APAC", payouts: 2800 },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Operations Dashboard</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="Total Payouts Processed" value={kpis ? kpis.totalPayouts : "—"} />
        <KpiCard title="Error Rate (%)" value={kpis ? `${kpis.errorRate}%` : "—"} />
        <KpiCard title="Avg Processing Time" value={kpis ? `${Math.round(kpis.avgProcessingTimeMs)} ms` : "—"} />
        <KpiCard title="Pending Payouts" value={kpis ? kpis.pendingPayouts : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Region vs Payouts</h4>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="payouts" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Processing Time Trend</h4>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ t: 'T-4', v: 2100 }, { t: 'T-3', v: 2300 }, { t: 'T-2', v: 2000 }, { t: 'T-1', v: 2200 }, { t: 'Now', v: 2130 }]}>
                <XAxis dataKey="t" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Recent Payouts</h4>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-left text-sm text-zinc-500">
              <tr>
                <th className="pb-2">Employee</th>
                <th className="pb-2">Region</th>
                <th className="pb-2">Expected</th>
                <th className="pb-2">Actual</th>
                <th className="pb-2">Processing Time</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.employee}</td>
                  <td>{p.region}</td>
                  <td>{p.expected_amount}</td>
                  <td>{p.actual_amount}</td>
                  <td>{p.processing_time ? `${p.processing_time} ms` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
