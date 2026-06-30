import { ProjectSheet } from "@/components/spreadsheet/ProjectSheet";

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-sm text-neutral-500">
        Edit data here. Every roadmap view updates automatically.
      </p>
      <ProjectSheet />
    </div>
  );
}
