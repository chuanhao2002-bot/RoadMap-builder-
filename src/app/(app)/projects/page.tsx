import { ProjectSheet } from "@/components/spreadsheet/ProjectSheet";
import { FilterBar } from "@/components/filters/FilterBar";

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-sm text-neutral-500">
        Edit data here. Every roadmap view updates automatically.
      </p>
      <FilterBar />
      <ProjectSheet />
    </div>
  );
}
