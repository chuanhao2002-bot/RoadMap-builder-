import type { Todo } from "@/types/todo";

export interface TodoRow {
  id: string;
  title: string;
  notes: string | null;
  urgent: boolean;
  important: boolean;
  due_date: string | null;
  done: boolean;
  updated_at: string | null;
}

export function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? "",
    urgent: row.urgent,
    important: row.important,
    dueDate: row.due_date ?? "",
    done: row.done,
    updatedAt: row.updated_at ?? "",
  };
}

export function todoToRow(t: Partial<Todo>) {
  const row: Record<string, unknown> = {};
  if (t.title !== undefined) row.title = t.title;
  if (t.notes !== undefined) row.notes = t.notes;
  if (t.urgent !== undefined) row.urgent = t.urgent;
  if (t.important !== undefined) row.important = t.important;
  if (t.dueDate !== undefined) row.due_date = t.dueDate || null;
  if (t.done !== undefined) row.done = t.done;
  return row;
}
