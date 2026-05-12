import Sidebar from "@/components/layout/Sidebar";

async function getKPIs() {
  const res = await fetch(
    "http://localhost:3000/api/kpis",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Dashboard() {
  const data = await getKPIs();

  return (
    <div className="flex bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-10">
          Operations Monitoring Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-zinc-400">
              Total Payout
            </h2>

            <p className="text-3xl font-bold mt-2">
              ${data.totalPayout}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-zinc-400">
              Records
            </h2>

            <p className="text-3xl font-bold mt-2">
              {data.count}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-zinc-400">
              Anomalies
            </h2>

            <p className="text-3xl font-bold mt-2">
              {data.anomalies}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
