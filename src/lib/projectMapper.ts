import type { Project } from "@/types/project";

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  department: string | null;
  owner: string | null;
  status: Project["status"];
  priority: Project["priority"];
  start_date: string | null;
  end_date: string | null;
  color: string | null;
  milestone: boolean;
  target_goal: string | null;
}

export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category: row.category ?? "",
    department: row.department ?? "",
    owner: row.owner ?? "",
    status: row.status,
    priority: row.priority,
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    color: row.color ?? "#64748b",
    milestone: row.milestone,
    targetGoal: row.target_goal ?? "",
  };
}

export function projectToRow(p: Partial<Project>) {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.description !== undefined) row.description = p.description;
  if (p.category !== undefined) row.category = p.category;
  if (p.department !== undefined) row.department = p.department;
  if (p.owner !== undefined) row.owner = p.owner;
  if (p.status !== undefined) row.status = p.status;
  if (p.priority !== undefined) row.priority = p.priority;
  if (p.startDate !== undefined) row.start_date = p.startDate || null;
  if (p.endDate !== undefined) row.end_date = p.endDate || null;
  if (p.color !== undefined) row.color = p.color;
  if (p.milestone !== undefined) row.milestone = p.milestone;
  if (p.targetGoal !== undefined) row.target_goal = p.targetGoal;
  return row;
}
