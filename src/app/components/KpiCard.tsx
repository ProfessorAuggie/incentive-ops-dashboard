export default function KpiCard({ title, value, delta }: { title: string; value: string | number; delta?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-4 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
      <div className="text-sm text-zinc-500">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        {delta && <div className="text-sm text-green-600">{delta}</div>}
      </div>
    </div>
  );
}
