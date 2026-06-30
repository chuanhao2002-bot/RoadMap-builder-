import { TimelineRoadmap } from "@/components/roadmap/TimelineRoadmap";

export default function ViewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Timeline View</h1>
      <p className="text-sm text-neutral-500">
        Auto-generated from the Projects spreadsheet. No manual positioning.
      </p>
      <TimelineRoadmap />
    </div>
  );
}
