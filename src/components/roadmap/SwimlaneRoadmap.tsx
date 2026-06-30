"use client";

import { useMemo, useRef, useState } from "react";
import { useFilteredProjects } from "@/lib/useFilteredProjects";
import { computeTimelineLayout, groupBy, ROW_HEIGHT, LEFT_PADDING } from "@/lib/timelineLayout";
import type { Project } from "@/types/project";
import { ExportMenu } from "./ExportMenu";

const GROUP_FIELDS: { key: keyof Project; label: string }[] = [
  { key: "department", label: "Department" },
  { key: "category", label: "Category" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
];

const LANE_HEADER_HEIGHT = 28;

export function SwimlaneRoadmap() {
  const projects = useFilteredProjects();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [groupField, setGroupField] = useState<keyof Project>("department");

  const groups = useMemo(() => {
    const grouped = groupBy(projects, (p) => String(p[groupField] || "Ungrouped"));
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      layout: computeTimelineLayout(items, LANE_HEADER_HEIGHT + 8),
    }));
  }, [projects, groupField]);

  const totalWidth = Math.max(...groups.map((g) => g.layout.totalWidth), 600);
  let runningY = 0;
  const laneOffsets = groups.map((g) => {
    const offset = runningY;
    runningY += g.layout.totalHeight + 16;
    return offset;
  });
  const totalHeight = runningY;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-neutral-500 flex items-center gap-2">
          Group by
          <select
            value={groupField}
            onChange={(e) => setGroupField(e.target.value as keyof Project)}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
          >
            {GROUP_FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <ExportMenu containerRef={containerRef} svgRef={svgRef} filenameBase="roadmap-swimlane" />
      </div>
      <div
        className="overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
        ref={containerRef}
      >
        <svg ref={svgRef} width={totalWidth} height={Math.max(totalHeight, 200)}>
          {groups.map((g, gi) => (
            <g key={g.name} transform={`translate(0, ${laneOffsets[gi]})`}>
              <rect x={0} y={0} width={totalWidth} height={g.layout.totalHeight} fill="currentColor" opacity={0.03} />
              <text x={LEFT_PADDING} y={18} fontSize={13} fontWeight={600} fill="currentColor">
                {g.name}
              </text>
              {g.layout.months.map((m) => (
                <line
                  key={m.label}
                  x1={m.x}
                  y1={LANE_HEADER_HEIGHT}
                  x2={m.x}
                  y2={g.layout.totalHeight}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
              ))}
              {g.layout.rows.map(({ project, x, y, width }) => (
                <g key={project.id}>
                  <rect x={x} y={y} width={width} height={ROW_HEIGHT - 14} rx={8} fill={project.color} opacity={0.9} />
                  <text x={x + 8} y={y + (ROW_HEIGHT - 14) / 2 + 4} fontSize={12} fill="#fff" fontWeight={500}>
                    {project.name}
                  </text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
