"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import KpiCard from "../components/KpiCard";

export default function PerformancePage() {
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    fetch("/api/kpis").then((r) => r.json()).then(setKpis);
  }, []);

  const slaData = [
    { region: "US", onTime: 98, delayed: 2 },
    { region: "EMEA", onTime: 96, delayed: 4 },
    { region: "APAC", onTime: 94, delayed: 6 },
  ];

  const processingTrendData = [
    { hour: "00:00", avgTime: 2100 },
    { hour: "04:00", avgTime: 2300 },
    { hour: "08:00", avgTime: 1900 },
    { hour: "12:00", avgTime: 2200 },
    { hour: "16:00", avgTime: 2400 },
    { hour: "20:00", avgTime: 2000 },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Performance & SLA Tracking</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard title="Avg Processing Time (ms)" value={kpis ? Math.round(kpis.avgProcessingTimeMs) : "—"} />
        <KpiCard title="SLA Compliance" value={kpis ? "96.7%" : "—"} />
        <KpiCard title="On-Time Delivery" value={kpis ? "97.2%" : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">SLA Performance by Region</h4>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaData}>
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onTime" fill="#10b981" name="On-Time (%)" />
                <Bar dataKey="delayed" fill="#ef4444" name="Delayed (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Processing Time Trend (24h)</h4>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processingTrendData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#06b6d4" strokeWidth={2} name="Avg Time (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Regional Performance Summary</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { region: "US", sla: "98%", avgTime: 2050, payouts: 5400 },
            { region: "EMEA", sla: "96%", avgTime: 2180, payouts: 3200 },
            { region: "APAC", sla: "94%", avgTime: 2340, payouts: 2800 },
          ].map((r) => (
            <div key={r.region} className="rounded-lg border p-3">
              <div className="font-medium">{r.region}</div>
              <div className="mt-2 space-y-1 text-sm text-zinc-600">
                <div>SLA Compliance: <span className="font-medium">{r.sla}</span></div>
                <div>Avg Processing: <span className="font-medium">{r.avgTime}ms</span></div>
                <div>Total Payouts: <span className="font-medium">{r.payouts}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
