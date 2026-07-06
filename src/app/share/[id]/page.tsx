"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getSnapshot, type Snapshot } from "@/lib/snapshots";
import { computeYearLayout } from "@/lib/timelineLayout";

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    getSnapshot(params.id).then((s) => {
      if (cancelled) return;
      if (s) {
        setSnapshot(s);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const year = useMemo(() => {
    if (!snapshot || snapshot.projects.length === 0) return new Date().getFullYear();
    const years = snapshot.projects.map((p) => new Date(p.startDate).getFullYear()).filter((y) => !Number.isNaN(y));
    return years.length ? years.sort((a, b) => b - a)[0] : new Date().getFullYear();
  }, [snapshot]);

  const layout = useMemo(
    () => (snapshot ? computeYearLayout(snapshot.projects, year) : null),
    [snapshot, year]
  );

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading...</div>;
  }

  if (status === "error" || !snapshot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium">This link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{snapshot.name}</h1>
        <p className="text-xs text-neutral-500">
          Read-only snapshot · {new Date(snapshot.createdAt).toLocaleString()} · {snapshot.projects.length} project(s)
        </p>
      </div>

      {layout && (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="mb-2 flex text-xs font-medium text-neutral-400">
            {layout.months.map((m) => (
              <div key={m.label} className="flex-1 text-center">
                {m.label}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {layout.bars.map((bar) => (
              <div key={bar.project.id} className="relative h-6">
                <div className="absolute inset-0 flex">
                  {layout.months.map((m) => (
                    <div key={m.label} className="flex-1 border-l border-neutral-100 dark:border-neutral-800 first:border-l-0" />
                  ))}
                </div>
                <div
                  className="absolute top-0.5 bottom-0.5 rounded-full flex items-center px-2 text-[11px] font-medium text-white truncate"
                  style={{ left: `${bar.leftPct}%`, width: `${Math.max(bar.widthPct, 1)}%`, background: bar.project.color }}
                >
                  {bar.project.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-800">
            <tr>
              {["Name", "Category", "Owner", "Status", "Priority", "Start", "End", "Progress"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshot.projects.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="px-3 py-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  {p.name}
                </td>
                <td className="px-3 py-1.5">{p.category}</td>
                <td className="px-3 py-1.5">{p.owner}</td>
                <td className="px-3 py-1.5">{p.status}</td>
                <td className="px-3 py-1.5">{p.priority}</td>
                <td className="px-3 py-1.5">{p.startDate}</td>
                <td className="px-3 py-1.5">{p.endDate}</td>
                <td className="px-3 py-1.5">{p.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
