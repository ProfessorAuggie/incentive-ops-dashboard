import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800">
      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">IOM Dashboard</h1>
          <p className="text-sm text-zinc-500">Incentive operations monitoring</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Dashboard</Link>
          <Link href="/errors" className="rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Error Monitoring</Link>
          <Link href="/performance" className="rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Performance</Link>
        </nav>
      </div>
    </aside>
  );
}
