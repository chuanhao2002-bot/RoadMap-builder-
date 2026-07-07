import { useProjectStore } from "@/store/useProjectStore";
import { useToastStore } from "@/store/useToastStore";
import { getQuadrantKey, type Todo } from "@/types/todo";
import type { ProjectPriority } from "@/types/project";

const QUADRANT_PRIORITY: Record<ReturnType<typeof getQuadrantKey>, ProjectPriority> = {
  do: "Critical",
  schedule: "High",
  delegate: "Medium",
  delete: "Low",
};

export function sendTodoToRoadmap(todo: Todo) {
  const today = new Date().toISOString().slice(0, 10);
  useProjectStore.getState().addProject({
    name: todo.title,
    description: todo.notes,
    priority: QUADRANT_PRIORITY[getQuadrantKey(todo)],
    startDate: today,
    endDate: todo.dueDate || today,
    status: "Planning",
  });
  useToastStore.getState().push(`"${todo.title}" added to roadmap`, "info");
}

export function sendTodosToRoadmap(todos: Todo[]) {
  todos.forEach((t) => {
    const today = new Date().toISOString().slice(0, 10);
    useProjectStore.getState().addProject({
      name: t.title,
      description: t.notes,
      priority: QUADRANT_PRIORITY[getQuadrantKey(t)],
      startDate: today,
      endDate: t.dueDate || today,
      status: "Planning",
    });
  });
  useToastStore.getState().push(`${todos.length} task(s) added to roadmap`, "info");
}
