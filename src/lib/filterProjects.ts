import type { Project } from "@/types/project";
import type { ProjectFilters } from "@/types/filters";

export function filterProjects(projects: Project[], f: ProjectFilters): Project[] {
  const search = f.search.trim().toLowerCase();
  return projects.filter((p) => {
    if (search) {
      const haystack = `${p.name} ${p.description} ${p.owner} ${p.category} ${p.department}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (f.status.length && !f.status.includes(p.status)) return false;
    if (f.priority.length && !f.priority.includes(p.priority)) return false;
    if (f.department.length && !f.department.includes(p.department)) return false;
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.owner.length && !f.owner.includes(p.owner)) return false;
    if (f.startAfter && p.startDate < f.startAfter) return false;
    if (f.endBefore && p.endDate > f.endBefore) return false;
    return true;
  });
}
