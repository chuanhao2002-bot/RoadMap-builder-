"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { STATUSES, PRIORITIES } from "@/lib/projectOptions";
import type { Project } from "@/types/project";

const PALETTE = ["#3b82f6", "#a855f7", "#f97316", "#10b981", "#ec4899", "#06b6d4", "#eab308", "#ef4444"];

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function groupCounts<K extends string>(projects: Project[], key: (p: Project) => K): [K, number][] {
  const counts = new Map<K, number>();
  for (const p of projects) {
    const k = key(p);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function Dashboard() {
  const { projects } = useProjectStore();

  const inProgress = projects.filter((p) => p.status === "In Progress").length;
  const blocked = projects.filter((p) => p.status === "Blocked").length;
  const completed = projects.filter((p) => p.status === "Completed").length;

  const statusCounts = useMemo(
    () => STATUSES.map((s) => [s, projects.filter((p) => p.status === s).length] as const),
    [projects]
  );
  const priorityCounts = useMemo(
    () => PRIORITIES.map((pr) => [pr, projects.filter((p) => p.priority === pr).length] as const),
    [projects]
  );
  const ownerCounts = useMemo(
    () => groupCounts(projects, (p) => p.owner || "Unassigned").slice(0, 8),
    [projects]
  );
  const categoryCounts = useMemo(
    () => groupCounts(projects, (p) => p.category || "Uncategorized").slice(0, 8),
    [projects]
  );

  const upcomingMilestones = useMemo(
    () =>
      projects
        .filter((p) => p.milestone && p.startDate)
        .map((p) => ({ p, days: daysUntil(p.startDate) }))
        .filter((x): x is { p: Project; days: number } => x.days !== null && x.days >= 0 && x.days <= 90)
        .sort((a, b) => a.days - b.days)
        .slice(0, 6),
    [projects]
  );

  const atRisk = useMemo(
    () =>
      projects
        .filter((p) => p.status !== "Completed")
        .map((p) => ({ p, days: daysUntil(p.endDate) }))
        .filter((x): x is { p: Project; days: number } => x.days !== null && x.days < 0)
        .sort((a, b) => a.days - b.days)
        .slice(0, 6),
    [projects]
  );

  const onTimeStats = useMemo(() => {
    const withActual = projects.filter((p) => p.actualEndDate && p.endDate);
    if (withActual.length === 0) return null;
    const onTime = withActual.filter((p) => new Date(p.actualEndDate) <= new Date(p.endDate)).length;
    return { onTime, total: withActual.length, pct: Math.round((onTime / withActual.length) * 100) };
  }, [projects]);

  const recentlyEdited = useMemo(
    () =>
      [...projects]
        .filter((p) => p.updatedAt)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [projects]
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Stat label="Total Projects" value={projects.length} />
        <Stat label="In Progress" value={inProgress} />
        <Stat label="Blocked" value={blocked} />
        <Stat label="Completed" value={completed} />
        <Stat label="On-Time Delivery" value={onTimeStats ? `${onTimeStats.pct}%` : "—"} />
      </div>

      <div className="flex gap-3">
        <Link href="/projects" className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium">
          Open Spreadsheet
        </Link>
        <Link href="/views" className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium">
          View Roadmap
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <BarPanel title="By Status" data={statusCounts} total={projects.length} />
        <BarPanel title="By Priority" data={priorityCounts} total={projects.length} />
        <BarPanel title="Workload by Owner" data={ownerCounts} total={projects.length} />
        <BarPanel title="By Category" data={categoryCounts} total={projects.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ListPanel
          title="Upcoming Milestones (next 90 days)"
          empty="No milestones coming up."
          items={upcomingMilestones.map(({ p, days }) => ({
            id: p.id,
            color: p.color,
            primary: p.name,
            secondary: days === 0 ? "Today" : `in ${days}d`,
          }))}
        />
        <ListPanel
          title="Overdue / At Risk"
          empty="Nothing overdue — nice."
          items={atRisk.map(({ p, days }) => ({
            id: p.id,
            color: p.color,
            primary: p.name,
            secondary: `${Math.abs(days)}d overdue`,
            danger: true,
          }))}
        />
      </div>

      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-2">Recently Edited</h2>
        <ul className="space-y-1">
          {recentlyEdited.length === 0 && <li className="text-sm text-neutral-400">No edits yet.</li>}
          {recentlyEdited.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
              {p.name} — <span className="text-neutral-500">{p.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

function BarPanel({ title, data, total }: { title: string; data: readonly (readonly [string, number])[]; total: number }) {
  const max = Math.max(...data.map(([, c]) => c), 1);
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <h3 className="text-sm font-medium text-neutral-500 mb-3">{title}</h3>
      {total === 0 ? (
        <p className="text-sm text-neutral-400">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {data.map(([label, count], i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-400">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / max) * 100}%`, background: PALETTE[i % PALETTE.length] }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-neutral-500">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ListPanel({
  title,
  items,
  empty,
}: {
  title: string;
  items: { id: string; color: string; primary: string; secondary: string; danger?: boolean }[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <h3 className="text-sm font-medium text-neutral-500 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="truncate">{item.primary}</span>
              </span>
              <span className={`shrink-0 text-xs font-medium ${item.danger ? "text-red-500" : "text-neutral-500"}`}>
                {item.secondary}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
