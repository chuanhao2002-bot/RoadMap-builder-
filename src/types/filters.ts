import type { ProjectPriority, ProjectStatus } from "./project";

export interface ProjectFilters {
  search: string;
  status: ProjectStatus[];
  priority: ProjectPriority[];
  department: string[];
  category: string[];
  owner: string[];
  tags: string[];
  startAfter: string;
  endBefore: string;
}

export const EMPTY_FILTERS: ProjectFilters = {
  search: "",
  status: [],
  priority: [],
  department: [],
  category: [],
  owner: [],
  tags: [],
  startAfter: "",
  endBefore: "",
};

export interface SavedView {
  id: string;
  name: string;
  filters: ProjectFilters;
}

export function isFiltersEmpty(filters: ProjectFilters) {
  return (
    !filters.search &&
    filters.status.length === 0 &&
    filters.priority.length === 0 &&
    filters.department.length === 0 &&
    filters.category.length === 0 &&
    filters.owner.length === 0 &&
    filters.tags.length === 0 &&
    !filters.startAfter &&
    !filters.endBefore
  );
}
