export interface Todo {
  id: string;
  title: string;
  notes: string;
  urgent: boolean;
  important: boolean;
  dueDate: string; // ISO date
  done: boolean;
  updatedAt: string;
}

export type QuadrantKey = "do" | "schedule" | "delegate" | "delete";

export interface QuadrantMeta {
  key: QuadrantKey;
  label: string;
  subtitle: string;
  color: string;
  urgent: boolean;
  important: boolean;
}

// Order matters: used for list sorting (most important first).
export const QUADRANTS: QuadrantMeta[] = [
  { key: "do", label: "Do", subtitle: "Urgent & Important", color: "#ef4444", urgent: true, important: true },
  { key: "schedule", label: "Schedule", subtitle: "Important, Not Urgent", color: "#3b82f6", urgent: false, important: true },
  { key: "delegate", label: "Delegate", subtitle: "Urgent, Not Important", color: "#eab308", urgent: true, important: false },
  { key: "delete", label: "Eliminate", subtitle: "Not Urgent or Important", color: "#94a3b8", urgent: false, important: false },
];

export function getQuadrantKey(todo: Pick<Todo, "urgent" | "important">): QuadrantKey {
  if (todo.urgent && todo.important) return "do";
  if (!todo.urgent && todo.important) return "schedule";
  if (todo.urgent && !todo.important) return "delegate";
  return "delete";
}

export function getQuadrant(todo: Pick<Todo, "urgent" | "important">): QuadrantMeta {
  const key = getQuadrantKey(todo);
  return QUADRANTS.find((q) => q.key === key)!;
}
