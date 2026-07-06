import type { Project } from "@/types/project";

export interface AtRiskInfo {
  project: Project;
  blockedBy: Project;
  daysOverlap: number;
}

function effectiveEnd(p: Project): Date | null {
  const raw = p.actualEndDate || p.endDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getAtRiskInfo(project: Project, allProjects: Project[]): AtRiskInfo | null {
  if (project.dependsOn.length === 0 || !project.startDate) return null;
  const start = new Date(project.startDate);
  if (Number.isNaN(start.getTime())) return null;

  for (const depId of project.dependsOn) {
    const dep = allProjects.find((p) => p.id === depId);
    if (!dep) continue;
    const depEnd = effectiveEnd(dep);
    if (depEnd && depEnd > start) {
      const daysOverlap = Math.round((depEnd.getTime() - start.getTime()) / 86400000);
      return { project, blockedBy: dep, daysOverlap };
    }
  }
  return null;
}

export function getAllAtRisk(projects: Project[]): AtRiskInfo[] {
  return projects
    .map((p) => getAtRiskInfo(p, projects))
    .filter((x): x is AtRiskInfo => x !== null);
}
