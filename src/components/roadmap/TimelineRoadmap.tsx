"use client";

import { useMemo, useRef, useState } from "react";
import { useFilteredProjects } from "@/lib/useFilteredProjects";
import { useProjectStore } from "@/store/useProjectStore";
import { computeYearLayout, daysBetween, groupBy } from "@/lib/timelineLayout";
import { ExportMenu } from "./ExportMenu";

const CATEGORY_DOT_COLORS = [
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#06b6d4",
  "#eab308",
];

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

  const todayLeftPct = useMemo(() => {
    const today = new Date();
    if (today.getFullYear() !== year) return null;
    const yearStart = new Date(year, 0, 1);
    const totalDays = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    return (daysBetween(yearStart, today) / totalDays) * 100;
  }, [year]);

  const categoryNames = Object.keys(groups);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="appearance-none rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-3 pr-7 py-1.5 text-sm font-medium shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <ExportMenu containerRef={containerRef} filenameBase="roadmap-timeline" />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-16 text-center">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No projects to show</p>
          <p className="text-xs text-neutral-400">Add a project or adjust your filters to see it on the timeline.</p>
        </div>
      ) : (
        <div
          className="overflow-x-hidden overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm"
          ref={containerRef}
        >
          <table className="w-full table-fixed text-sm border-collapse">
            <colgroup>
              <col style={{ width: "12%" }} />
              <col style={{ width: "68%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  Category
                </th>
                <th className="p-0 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="relative flex h-full">
                    {months.map((m) => {
                      const isCurrentMonth =
                        todayLeftPct !== null && m.label === new Date().toLocaleDateString("en-US", { month: "short" });
                      return (
                        <div
                          key={m.label}
                          className={`flex-1 px-1 py-2.5 text-center text-xs font-semibold border-l border-neutral-100 dark:border-neutral-800 first:border-l-0 ${
                            isCurrentMonth ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                          }`}
                        >
                          {m.label}
                        </div>
                      );
                    })}
                  </div>
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  Target Goal
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryNames.map((category, ci) => {
                const group = groups[category];
                const dotColor = CATEGORY_DOT_COLORS[ci % CATEGORY_DOT_COLORS.length];
                return group.map((project, i) => {
                  const bar = barByProjectId.get(project.id);
                  return (
                    <tr
                      key={project.id}
                      className={`border-t border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors ${
                        ci % 2 === 1 ? "bg-neutral-50/40 dark:bg-neutral-900/20" : ""
                      }`}
                    >
                      {i === 0 && (
                        <td
                          rowSpan={group.length}
                          className="px-3 py-2 align-top border-r border-neutral-100 dark:border-neutral-900"
                        >
                          <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-200">
                            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                            {category}
                          </span>
                        </td>
                      )}
                      <td className="relative px-1 py-1" style={{ height: 48 }}>
                        <div className="absolute inset-0 flex">
                          {months.map((m, mi) => (
                            <div
                              key={mi}
                              className="flex-1 border-l border-neutral-100 dark:border-neutral-900 first:border-l-0"
                            />
                          ))}
                        </div>
                        {todayLeftPct !== null && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-red-400/70 dark:bg-red-500/60"
                            style={{ left: `${todayLeftPct}%` }}
                          />
                        )}
                        {bar && (
                          <div
                            className="group absolute top-2 bottom-2 rounded-full overflow-hidden shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:brightness-105"
                            style={{
                              left: `${bar.leftPct}%`,
                              width: `${Math.max(bar.widthPct, 1)}%`,
                              background: project.color,
                            }}
                            title={project.name}
                          >
                            <span className="absolute inset-0 flex items-center px-2.5 text-xs font-medium text-white truncate">
                              {project.name}
                              {project.milestone && <span className="ml-1">🚩</span>}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1">
                        <input
                          value={project.targetGoal}
                          onChange={(e) => updateProject(project.id, { targetGoal: e.target.value })}
                          placeholder="Add target goal..."
                          className="w-full rounded-md bg-transparent px-1.5 py-1 outline-none placeholder:italic placeholder:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 focus:bg-neutral-50 dark:focus:bg-neutral-900 focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-colors"
                        />
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
