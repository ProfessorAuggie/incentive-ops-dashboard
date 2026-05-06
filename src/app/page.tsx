import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold">Welcome to Incentive Operations Monitoring Dashboard</h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          Monitor payouts, detect errors, and ensure accuracy and efficiency in incentive operations.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/dashboard" className="rounded-lg border border-blue-200 bg-blue-50 p-4 hover:shadow dark:border-blue-900 dark:bg-blue-900/20">
          <h3 className="font-semibold">Operations Dashboard</h3>
          <p className="mt-1 text-sm text-zinc-600">View KPIs, charts, and recent payouts</p>
        </Link>
        <Link href="/errors" className="rounded-lg border border-red-200 bg-red-50 p-4 hover:shadow dark:border-red-900 dark:bg-red-900/20">
          <h3 className="font-semibold">Error Monitoring</h3>
          <p className="mt-1 text-sm text-zinc-600">Track and filter error logs by type and region</p>
        </Link>
        <Link href="/performance" className="rounded-lg border border-green-200 bg-green-50 p-4 hover:shadow dark:border-green-900 dark:bg-green-900/20">
          <h3 className="font-semibold">Performance & SLA</h3>
          <p className="mt-1 text-sm text-zinc-600">Analyze regional performance and SLA compliance</p>
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">About This System</h2>
        <div className="mt-4 space-y-3 text-sm md:max-w-2xl">
          <p>
            This dashboard monitors critical metrics for incentive operations including payouts, errors, and processing performance.
          </p>
          <p>
            <strong>Key Features:</strong>
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Real-time KPI tracking (payouts, error rate, processing time)</li>
            <li>Comprehensive error logging with classification (data, logic, delay issues)</li>
            <li>Region-based performance analysis and SLA tracking</li>
            <li>Dark/light mode support with modern UI design</li>
            <li>Drill-down views for detailed payout analysis</li>
          </ul>
          <p className="pt-2">
            <strong>Technology Stack:</strong> Next.js 16, PostgreSQL (Neon), Prisma ORM, Tailwind CSS, Recharts
          </p>
        </div>
      </section>
    </div>
  );
}
