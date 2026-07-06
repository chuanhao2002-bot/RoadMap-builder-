"use client";

import { useRef, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilteredProjects } from "@/lib/useFilteredProjects";
import type { Project, ProjectStatus } from "@/types/project";
import { ExportMenu } from "./ExportMenu";

const COLUMNS: ProjectStatus[] = ["Planning", "In Progress", "Blocked", "Completed"];

export function KanbanBoard() {
  const { updateProject } = useProjectStore();
  const projects = useFilteredProjects();
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrop = (status: ProjectStatus, e: React.DragEvent) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("text/project-id");
    if (projectId) updateProject(projectId, { status });
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ExportMenu containerRef={containerRef} filenameBase="roadmap-kanban" />
      </div>
      <div ref={containerRef} className="flex gap-4 overflow-x-auto pb-2 bg-white dark:bg-neutral-950 p-2">
      {COLUMNS.map((status) => {
        const items = projects.filter((p) => p.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(status);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(status, e)}
            className={`flex-1 min-w-[220px] rounded-lg border p-3 space-y-2 transition-colors ${
              dragOverColumn === status
                ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{status}</span>
              <span className="text-neutral-400">{items.length}</span>
            </div>
            <div className="space-y-2 min-h-[40px]">
              {items.map((p) => (
                <KanbanCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function KanbanCard({ project }: { project: Project }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/project-id", project.id)}
      className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 cursor-grab active:cursor-grabbing shadow-sm"
    >
      <div className="flex items-start gap-2">
        <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: project.color }} />
        <div>
          <div className="text-sm font-medium">{project.name}</div>
          <div className="text-xs text-neutral-500">{project.owner || "Unassigned"}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
        <span>{project.priority}</span>
        <span>{project.progress}%</span>
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${project.progress}%`, background: project.color }}
        />
      </div>
    </div>
  );
}
