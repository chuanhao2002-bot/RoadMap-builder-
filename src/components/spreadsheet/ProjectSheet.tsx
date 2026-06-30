"use client";

import { useProjectStore } from "@/store/useProjectStore";
import { PROJECT_COLUMNS, type Project, type ProjectStatus, type ProjectPriority } from "@/types/project";
import { Plus, Copy, Trash2 } from "lucide-react";

const STATUSES: ProjectStatus[] = ["Planning", "In Progress", "Blocked", "Completed"];
const PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];

export function ProjectSheet() {
  const { projects, updateProject, addProject, removeProject, duplicateProject } = useProjectStore();

  return (
    <div className="overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-900 z-10">
          <tr>
            <th className="w-8" />
            {PROJECT_COLUMNS.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                {c.label}
              </th>
            ))}
            <th className="w-16" />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="px-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: p.color }} />
              </td>
              <Cell value={p.name} onChange={(v) => updateProject(p.id, { name: v })} />
              <Cell value={p.description} onChange={(v) => updateProject(p.id, { description: v })} />
              <Cell value={p.category} onChange={(v) => updateProject(p.id, { category: v })} />
              <Cell value={p.department} onChange={(v) => updateProject(p.id, { department: v })} />
              <Cell value={p.owner} onChange={(v) => updateProject(p.id, { owner: v })} />
              <SelectCell value={p.status} options={STATUSES} onChange={(v) => updateProject(p.id, { status: v as ProjectStatus })} />
              <SelectCell value={p.priority} options={PRIORITIES} onChange={(v) => updateProject(p.id, { priority: v as ProjectPriority })} />
              <td className="px-3 py-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={p.progress}
                  onChange={(e) => updateProject(p.id, { progress: Number(e.target.value) })}
                  className="w-16 bg-transparent outline-none"
                />
              </td>
              <td className="px-3 py-1">
                <input
                  type="date"
                  value={p.startDate}
                  onChange={(e) => updateProject(p.id, { startDate: e.target.value })}
                  className="bg-transparent outline-none"
                />
              </td>
              <td className="px-3 py-1">
                <input
                  type="date"
                  value={p.endDate}
                  onChange={(e) => updateProject(p.id, { endDate: e.target.value })}
                  className="bg-transparent outline-none"
                />
              </td>
              <td className="px-3 py-1">
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) => updateProject(p.id, { color: e.target.value })}
                  className="w-8 h-6 bg-transparent"
                />
              </td>
              <td className="px-3 py-1 text-center">
                <input
                  type="checkbox"
                  checked={p.milestone}
                  onChange={(e) => updateProject(p.id, { milestone: e.target.checked })}
                />
              </td>
              <Cell
                value={p.tags.join(", ")}
                onChange={(v) => updateProject(p.id, { tags: v.split(",").map((t) => t.trim()).filter(Boolean) })}
              />
              <td className="px-2 py-1 whitespace-nowrap">
                <button onClick={() => duplicateProject(p.id)} className="p-1 text-neutral-400 hover:text-neutral-700">
                  <Copy size={14} />
                </button>
                <button onClick={() => removeProject(p.id)} className="p-1 text-neutral-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => addProject()}
        className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        <Plus size={14} /> Add row
      </button>
    </div>
  );
}

function Cell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <td className="px-3 py-1">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none min-w-[8rem]"
      />
    </td>
  );
}

function SelectCell<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <td className="px-3 py-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-transparent outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </td>
  );
}

export type { Project };
