import { PROJECT_COLUMNS, type Project } from "@/types/project";

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProjectsAsCsv(projects: Project[], filename = "projects.csv") {
  const columns = PROJECT_COLUMNS.filter((c) => c.key !== "color");
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const rows = projects.map((p) => columns.map((c) => escapeCsvCell(p[c.key])).join(","));
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
