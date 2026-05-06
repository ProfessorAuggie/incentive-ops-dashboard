"use client";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white/60 px-6 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Incentive Ops</h2>
        <nav className="hidden gap-3 text-sm md:flex">
          <Link href="/dashboard" className="text-zinc-600 hover:underline">Dashboard</Link>
          <Link href="/errors" className="text-zinc-600 hover:underline">Errors</Link>
          <Link href="/performance" className="text-zinc-600 hover:underline">Performance</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
