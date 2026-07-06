import { PROJECT_COLUMNS, type Project } from "@/types/project";
import { STATUSES, PRIORITIES } from "@/lib/projectOptions";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export function parseProjectsCsv(text: string): Partial<Project>[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const [headerRow, ...dataRows] = rows;
  const columns = PROJECT_COLUMNS.filter((c) => c.key !== "color");
  const keyByLabel = new Map(columns.map((c) => [c.label.toLowerCase().trim(), c.key]));
  const keys = headerRow.map((label) => keyByLabel.get(label.toLowerCase().trim()) ?? null);

  return dataRows.map((row) => {
    const project: Partial<Project> = {};
    row.forEach((rawValue, i) => {
      const key = keys[i];
      if (!key) return;
      const value = rawValue.trim();
      if (key === "milestone") {
        project.milestone = /^(true|yes|1)$/i.test(value);
      } else if (key === "progress") {
        const n = Number(value);
        project.progress = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
      } else if (key === "status") {
        project.status = (STATUSES as string[]).includes(value) ? (value as Project["status"]) : "Planning";
      } else if (key === "priority") {
        project.priority = (PRIORITIES as string[]).includes(value) ? (value as Project["priority"]) : "Medium";
      } else {
        (project as Record<string, unknown>)[key] = value;
      }
    });
    return project;
  });
}
