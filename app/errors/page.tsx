async function getErrors() {
  const res = await fetch(
    "http://localhost:3000/api/errors",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function ErrorsPage() {
  const errors = await getErrors();

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-10">
        Error Monitoring
      </h1>

      <div className="space-y-4">
        {errors.map((item: any) => (
          <div
            key={item.id}
            className="bg-red-900/20 border border-red-500 rounded-xl p-5"
          >
            <h2 className="font-bold text-xl">
              {item.employee.name}
            </h2>

            <p>
              Final Payout: $
              {item.finalPayout}
            </p>

            <p>
              {item.anomalyReason}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
