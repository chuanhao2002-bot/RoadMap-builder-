"use client";

import { useMemo, useRef } from "react";
import { useFilteredProjects } from "@/lib/useFilteredProjects";
import { computeTimelineLayout, ROW_HEIGHT } from "@/lib/timelineLayout";
import { ExportMenu } from "./ExportMenu";

export function TimelineRoadmap() {
  const projects = useFilteredProjects();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { rows, totalWidth, totalHeight, months } = useMemo(
    () => computeTimelineLayout(projects),
    [projects]
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ExportMenu containerRef={containerRef} svgRef={svgRef} filenameBase="roadmap-timeline" />
      </div>
      <div className="overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" ref={containerRef}>
        <svg ref={svgRef} width={Math.max(totalWidth, 600)} height={Math.max(totalHeight, 200)}>
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
