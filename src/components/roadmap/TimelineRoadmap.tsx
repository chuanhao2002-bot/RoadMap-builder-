"use client";

import { useMemo, useRef, useState } from "react";
import { useFilteredProjects } from "@/lib/useFilteredProjects";
import { useProjectStore } from "@/store/useProjectStore";
import { computeYearLayout, groupBy } from "@/lib/timelineLayout";
import { ExportMenu } from "./ExportMenu";

export function TimelineRoadmap() {
  const projects = useFilteredProjects();
  const updateProject = useProjectStore((s) => s.updateProject);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultYear = useMemo(() => {
    if (projects.length === 0) return new Date().getFullYear();
    const years = projects.map((p) => new Date(p.startDate).getFullYear()).filter((y) => !Number.isNaN(y));
    if (years.length === 0) return new Date().getFullYear();
    const counts = new Map<number, number>();
    for (const y of years) counts.set(y, (counts.get(y) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, [projects]);

  const [year, setYear] = useState(defaultYear);

  const groups = useMemo(() => groupBy(projects, (p) => p.category || "Uncategorized"), [projects]);
  const { bars, months } = useMemo(() => computeYearLayout(projects, year), [projects, year]);
  const barByProjectId = useMemo(() => new Map(bars.map((b) => [b.project.id, b])), [bars]);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const opts = new Set<number>([year, defaultYear, current]);
    return [...opts].sort();
  }, [year, defaultYear]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 py-1.5 text-sm"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <ExportMenu containerRef={containerRef} filenameBase="roadmap-timeline" />
      </div>
      <div
        className="overflow-x-hidden overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
        ref={containerRef}
      >
        <table className="w-full table-fixed text-sm border-collapse">
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "68%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr className="bg-neutral-100 dark:bg-neutral-900">
              <th className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                Category
              </th>
              <th className="p-0 border-b border-neutral-200 dark:border-neutral-800">
                <div className="relative flex h-full">
                  {months.map((m) => (
                    <div
                      key={m.label}
                      className="flex-1 px-1 py-2 text-center text-xs font-medium text-neutral-500 border-l border-neutral-100 dark:border-neutral-800 first:border-l-0"
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
              </th>
              <th className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                KPI
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([category, group]) =>
              group.map((project, i) => {
                const bar = barByProjectId.get(project.id);
                return (
                  <tr
                    key={project.id}
                    className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  >
                    {i === 0 && (
                      <td
                        rowSpan={group.length}
                        className="px-3 py-2 align-top font-medium text-neutral-700 dark:text-neutral-200 border-r border-neutral-200 dark:border-neutral-800"
                      >
                        {category}
                      </td>
                    )}
                    <td className="relative px-1 py-1" style={{ height: 44 }}>
                      <div className="absolute inset-0 flex">
                        {months.map((m, mi) => (
                          <div
                            key={mi}
                            className="flex-1 border-l border-neutral-100 dark:border-neutral-900 first:border-l-0"
                          />
                        ))}
                      </div>
                      {bar && (
                        <div
                          className="absolute top-1.5 bottom-1.5 rounded-md overflow-hidden"
                          style={{ left: `${bar.leftPct}%`, width: `${Math.max(bar.widthPct, 1)}%`, background: project.color, opacity: 0.9 }}
                          title={project.name}
                        >
                          <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white truncate">
                            {project.name}
                            {project.milestone && <span className="ml-1">🚩</span>}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-1">
                      <input
                        value={project.kpi}
                        onChange={(e) => updateProject(project.id, { kpi: e.target.value })}
                        placeholder="Add KPI..."
                        className="w-full bg-transparent outline-none"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
