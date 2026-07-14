"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import { rowToTodo, todoToRow, type TodoRow } from "@/lib/todoMapper";
import type { Todo } from "@/types/todo";
import { useToastStore } from "@/store/useToastStore";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

let realtimeUnsubscribe: (() => void) | null = null;

interface TodoStore {
  todos: Todo[];
  loaded: boolean;
  workspaceId: string | null;
  init: (workspaceId: string) => Promise<void>;
  reset: () => void;
  addTodo: (t?: Partial<Todo>) => void;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],
  loaded: false,
  workspaceId: null,

  init: async (workspaceId) => {
    if (get().loaded && get().workspaceId === workspaceId) return;
    realtimeUnsubscribe?.();
    set({ loaded: false, todos: [], workspaceId });

    const supabase = createClient();
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load todos", error);
      useToastStore.getState().push("Could not load to-dos — check your connection and reload.");
      set({ loaded: true });
      return;
    }

    set({ todos: ((data ?? []) as TodoRow[]).map(rowToTodo), loaded: true });

    const channel = supabase
      .channel(`todos-${workspaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos", filter: `workspace_id=eq.${workspaceId}` },
        (payload) => {
          set((s) => {
            if (payload.eventType === "DELETE") {
              return { todos: s.todos.filter((t) => t.id !== (payload.old as TodoRow).id) };
            }
            const incoming = rowToTodo(payload.new as TodoRow);
            const exists = s.todos.some((t) => t.id === incoming.id);
            return {
              todos: exists ? s.todos.map((t) => (t.id === incoming.id ? incoming : t)) : [...s.todos, incoming],
            };
          });
        }
      )
      .subscribe();

    realtimeUnsubscribe = () => {
      supabase.removeChannel(channel);
    };
  },

  reset: () => {
    realtimeUnsubscribe?.();
    realtimeUnsubscribe = null;
    set({ todos: [], loaded: false, workspaceId: null });
  },

  addTodo: (t) => {
    const workspaceId = get().workspaceId;
    if (!workspaceId) return;
    const optimistic: Todo = {
      id: id(),
      title: "New task",
      notes: "",
      urgent: false,
      important: true,
      dueDate: "",
      done: false,
      updatedAt: "",
      ...t,
    };
    set((s) => ({ todos: [...s.todos, optimistic] }));

    const supabase = createClient();
    supabase
      .from("todos")
      .insert({ ...todoToRow(optimistic), workspace_id: workspaceId })
      .select("*")
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to add todo", error);
          useToastStore.getState().push("Failed to save task — it was not persisted.");
          set((s) => ({ todos: s.todos.filter((t) => t.id !== optimistic.id) }));
          return;
        }
        const saved = rowToTodo(data as TodoRow);
        set((s) => ({ todos: s.todos.map((t) => (t.id === optimistic.id ? saved : t)) }));
      });
  },

  updateTodo: (todoId, patch) => {
    const previous = get().todos.find((t) => t.id === todoId);
    set((s) => ({ todos: s.todos.map((t) => (t.id === todoId ? { ...t, ...patch } : t)) }));
    const supabase = createClient();
    supabase
      .from("todos")
      .update(todoToRow(patch))
      .eq("id", todoId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update todo", error);
          useToastStore.getState().push("Failed to save your change — it was not persisted.");
          if (previous) {
            set((s) => ({ todos: s.todos.map((t) => (t.id === todoId ? previous : t)) }));
          }
        }
      });
  },

  removeTodo: (todoId) => {
    const previous = get().todos;
    set((s) => ({ todos: s.todos.filter((t) => t.id !== todoId) }));
    const supabase = createClient();
    supabase
      .from("todos")
      .delete()
      .eq("id", todoId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to remove todo", error);
          useToastStore.getState().push("Failed to delete task — it was not removed.");
          set({ todos: previous });
        }
      });
  },
}));
