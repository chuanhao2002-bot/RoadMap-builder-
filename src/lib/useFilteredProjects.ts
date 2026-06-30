"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilterStore } from "@/store/useFilterStore";
import { filterProjects } from "./filterProjects";

export function useFilteredProjects() {
  const projects = useProjectStore((s) => s.projects);
  const filters = useFilterStore((s) => s.filters);
  return useMemo(() => filterProjects(projects, filters), [projects, filters]);
}
