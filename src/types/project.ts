export type ProjectStatus = "Planning" | "In Progress" | "Blocked" | "Completed";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  department: string;
  owner: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string; // ISO date
  endDate: string; // ISO date
  color: string;
  milestone: boolean;
  targetGoal: string;
  mandays: string;
  progress: number;
  actualStartDate: string;
  actualEndDate: string;
  updatedAt: string;
  dependsOn: string[];
}

export const PROJECT_COLUMNS: { key: keyof Project; label: string }[] = [
  { key: "name", label: "Project Name" },
  { key: "description", label: "Description" },
  { key: "category", label: "Category" },
  { key: "department", label: "Request By" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "actualStartDate", label: "Actual Start" },
  { key: "actualEndDate", label: "Actual End" },
  { key: "color", label: "Color" },
  { key: "milestone", label: "Milestone" },
  { key: "targetGoal", label: "Target Goal" },
  { key: "mandays", label: "Mandays" },
  { key: "progress", label: "Progress" },
];
