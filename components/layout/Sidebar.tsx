import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-10">
        Ops Dashboard
      </h2>

      <nav className="space-y-4">
        <Link
          href="/dashboard"
          className="block hover:text-blue-400"
        >
          Dashboard
        </Link>

        <Link
          href="/errors"
          className="block hover:text-blue-400"
        >
          Errors
        </Link>
      </nav>
    </aside>
  );
}
