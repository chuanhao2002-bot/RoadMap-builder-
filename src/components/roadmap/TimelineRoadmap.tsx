"use client";

import { useMemo, useRef } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { toPng } from "html-to-image";

const DAY_WIDTH = 6;
const ROW_HEIGHT = 44;
const LEFT_PADDING = 16;
const TOP_PADDING = 40;

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function TimelineRoadmap() {
  const { projects } = useProjectStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const { rows, totalWidth, totalHeight, months } = useMemo(() => {
    if (projects.length === 0) {
      return { rows: [], minDate: new Date(), totalWidth: 0, totalHeight: 0, months: [] };
    }
    const starts = projects.map((p) => new Date(p.startDate));
    const ends = projects.map((p) => new Date(p.endDate));
    const minDate = new Date(Math.min(...starts.map((d) => d.getTime())));
    minDate.setDate(1);
    const maxDate = new Date(Math.max(...ends.map((d) => d.getTime())));

    const rows = projects.map((p, i) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const x = LEFT_PADDING + daysBetween(minDate, start) * DAY_WIDTH;
      const width = Math.max(daysBetween(start, end) * DAY_WIDTH, 24);
      const y = TOP_PADDING + i * ROW_HEIGHT;
      return { project: p, x, y, width };
    });

    const totalDays = daysBetween(minDate, maxDate) + 30;
    const totalWidth = LEFT_PADDING * 2 + totalDays * DAY_WIDTH;
    const totalHeight = TOP_PADDING + projects.length * ROW_HEIGHT + 20;

    const months: { x: number; label: string }[] = [];
    const cursor = new Date(minDate);
    while (cursor <= maxDate) {
      months.push({
        x: LEFT_PADDING + daysBetween(minDate, cursor) * DAY_WIDTH,
        label: cursor.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return { rows, minDate, totalWidth, totalHeight, months };
  }, [projects]);

  const exportPng = async () => {
    if (!containerRef.current) return;
    const dataUrl = await toPng(containerRef.current, { pixelRatio: 3, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.download = "roadmap.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={exportPng}
          className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
        >
          Export PNG
        </button>
      </div>
      <div className="overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" ref={containerRef}>
        <svg width={Math.max(totalWidth, 600)} height={Math.max(totalHeight, 200)}>
          {months.map((m) => (
            <g key={m.label}>
              <line x1={m.x} y1={0} x2={m.x} y2={totalHeight} stroke="currentColor" strokeOpacity={0.08} />
              <text x={m.x + 4} y={20} fontSize={11} fill="currentColor" opacity={0.6}>
                {m.label}
              </text>
            </g>
          ))}
          {rows.map(({ project, x, y, width }) => (
            <g key={project.id}>
              <rect x={x} y={y} width={width} height={ROW_HEIGHT - 14} rx={8} fill={project.color} opacity={0.9} />
              <rect
                x={x}
                y={y}
                width={(width * project.progress) / 100}
                height={ROW_HEIGHT - 14}
                rx={8}
                fill={project.color}
                opacity={0.5}
              />
              <text x={x + 8} y={y + (ROW_HEIGHT - 14) / 2 + 4} fontSize={12} fill="#fff" fontWeight={500}>
                {project.name}
              </text>
              {project.milestone && (
                <text x={x + width + 6} y={y + (ROW_HEIGHT - 14) / 2 + 5} fontSize={12}>
                  🚩
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
