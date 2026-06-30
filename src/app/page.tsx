"use client";

import Link from "next/link";
import { useProjectStore } from "@/store/useProjectStore";

export default function Dashboard() {
  const { projects } = useProjectStore();
  const inProgress = projects.filter((p) => p.status === "In Progress").length;
  const blocked = projects.filter((p) => p.status === "Blocked").length;
  const completed = projects.filter((p) => p.status === "Completed").length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Total Projects" value={projects.length} />
        <Stat label="In Progress" value={inProgress} />
        <Stat label="Blocked" value={blocked} />
        <Stat label="Completed" value={completed} />
      </div>

      <div className="flex gap-3">
        <Link href="/projects" className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium">
          Open Spreadsheet
        </Link>
        <Link href="/views" className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium">
          View Roadmap
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-2">Recently Edited</h2>
        <ul className="space-y-1">
          {projects.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name} — <span className="text-neutral-500">{p.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
