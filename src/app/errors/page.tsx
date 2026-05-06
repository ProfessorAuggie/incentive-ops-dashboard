"use client";
import { useEffect, useState } from "react";

export default function ErrorsPage() {
  const [errors, setErrors] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (region) qs.set("region", region);
    fetch(`/api/errors?${qs.toString()}`).then((r) => r.json()).then((j) => setErrors(j.data || []));
  }, [type, region]);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Error Monitoring</h3>

      <div className="flex items-center gap-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border px-3 py-1">
          <option value="">All types</option>
          <option>Data issue</option>
          <option>Logic issue</option>
          <option>Delay issue</option>
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded border px-3 py-1">
          <option value="">All regions</option>
          <option>US</option>
          <option>EMEA</option>
          <option>APAC</option>
        </select>
      </div>

      <section className="rounded-lg border p-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-left text-sm text-zinc-500">
              <tr>
                <th className="pb-2">Employee</th>
                <th className="pb-2">Region</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e) => (
                <tr key={e.id} className={`border-t ${e.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/50' : ''}`}>
                  <td className="py-2">{e.employee}</td>
                  <td>{e.region}</td>
                  <td>{e.type}</td>
                  <td>{e.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
