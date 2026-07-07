"use client";

import { useMemo, useState } from "react";
import { useTodoStore } from "@/store/useTodoStore";
import { sendTodoToRoadmap, sendTodosToRoadmap } from "@/lib/todoToProject";
import { QUADRANTS, getQuadrantKey, getQuadrant, type QuadrantKey, type Todo } from "@/types/todo";
import { Plus, Trash2, ArrowRightCircle, X } from "lucide-react";

type View = "matrix" | "list";

export default function TodosPage() {
  const { todos, addTodo, updateTodo, removeTodo } = useTodoStore();
  const [view, setView] = useState<View>("matrix");
  const [draft, setDraft] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleTodos = useMemo(
    () => (showCompleted ? todos : todos.filter((t) => !t.done)),
    [todos, showCompleted]
  );

  const addFromDraft = () => {
    const title = draft.trim();
    if (!title) return;
    addTodo({ title });
    setDraft("");
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const clearSelection = () => setSelectedIds([]);

  const pushSelectedToRoadmap = () => {
    const chosen = todos.filter((t) => selectedIds.includes(t.id));
    if (chosen.length) sendTodosToRoadmap(chosen);
    clearSelection();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Priority To-Do</h1>
        <p className="text-sm text-neutral-500">
          Prioritize with the Eisenhower matrix. Separate from the roadmap — push any task over when it&apos;s ready.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addFromDraft();
          }}
          placeholder="Add a task…"
          className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <button
          onClick={addFromDraft}
          className="flex items-center gap-1.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 text-sm font-medium hover:opacity-90"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
          {(["matrix", "list"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${
                view === v
                  ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-500">
          <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
          Show completed
        </label>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-sm">
          <span className="font-medium">{selectedIds.length} selected</span>
          <button
            onClick={pushSelectedToRoadmap}
            className="flex items-center gap-1 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2 py-1 text-sm font-medium"
          >
            <ArrowRightCircle size={14} /> Add selected to Roadmap
          </button>
          <button
            onClick={clearSelection}
            className="ml-auto flex items-center gap-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <X size={14} /> Clear
          </button>
        </div>
      )}

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 py-16 text-center">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No tasks yet</p>
          <p className="text-xs text-neutral-400">Add a task above to start prioritizing.</p>
        </div>
      ) : view === "matrix" ? (
        <MatrixView
          todos={visibleTodos}
          updateTodo={updateTodo}
          removeTodo={removeTodo}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
        />
      ) : (
        <ListView
          todos={visibleTodos}
          updateTodo={updateTodo}
          removeTodo={removeTodo}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
        />
      )}
    </div>
  );
}

interface RowProps {
  todos: Todo[];
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
}

function MatrixView({ todos, updateTodo, removeTodo, selectedIds, toggleSelect }: RowProps) {
  const [dragOver, setDragOver] = useState<QuadrantKey | null>(null);

  const handleDrop = (key: QuadrantKey, e: React.DragEvent) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("text/todo-id");
    const q = QUADRANTS.find((x) => x.key === key)!;
    if (todoId) updateTodo(todoId, { urgent: q.urgent, important: q.important });
    setDragOver(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {QUADRANTS.map((q) => {
        const items = todos.filter((t) => getQuadrantKey(t) === q.key);
        return (
          <div
            key={q.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(q.key);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(q.key, e)}
            className={`rounded-lg border p-3 space-y-2 min-h-[160px] transition-colors ${
              dragOver === q.key
                ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: q.color }} />
                <span className="text-sm font-semibold">{q.label}</span>
                <span className="text-xs text-neutral-400">{q.subtitle}</span>
              </div>
              <span className="text-xs text-neutral-400">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((t) => (
                <TodoCard
                  key={t.id}
                  todo={t}
                  updateTodo={updateTodo}
                  removeTodo={removeTodo}
                  selected={selectedIds.includes(t.id)}
                  toggleSelect={toggleSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TodoCard({
  todo,
  updateTodo,
  removeTodo,
  selected,
  toggleSelect,
}: {
  todo: Todo;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
  selected: boolean;
  toggleSelect: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/todo-id", todo.id)}
      className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2.5 cursor-grab active:cursor-grabbing shadow-sm space-y-1.5"
    >
      <div className="flex items-start gap-2">
        <input type="checkbox" checked={selected} onChange={() => toggleSelect(todo.id)} className="mt-1" />
        <input
          type="checkbox"
          checked={todo.done}
          onChange={(e) => updateTodo(todo.id, { done: e.target.checked })}
          className="mt-1"
          title="Mark done"
        />
        <input
          value={todo.title}
          onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
          className={`flex-1 bg-transparent outline-none text-sm ${
            todo.done ? "line-through text-neutral-400" : ""
          }`}
        />
      </div>
      <div className="flex items-center gap-2 pl-8">
        <input
          type="date"
          value={todo.dueDate}
          onChange={(e) => updateTodo(todo.id, { dueDate: e.target.value })}
          className="bg-transparent outline-none text-xs text-neutral-500"
        />
        <button
          onClick={() => sendTodoToRoadmap(todo)}
          title="Add to Roadmap"
          className="ml-auto flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowRightCircle size={13} /> Roadmap
        </button>
        <button
          onClick={() => removeTodo(todo.id)}
          title="Delete"
          className="text-neutral-400 hover:text-red-600"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function ListView({ todos, updateTodo, removeTodo, selectedIds, toggleSelect }: RowProps) {
  const order = QUADRANTS.map((q) => q.key);
  const sorted = [...todos].sort((a, b) => {
    const qa = order.indexOf(getQuadrantKey(a));
    const qb = order.indexOf(getQuadrantKey(b));
    if (qa !== qb) return qa - qb;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-100 dark:bg-neutral-900">
          <tr>
            <th className="w-8" />
            <th className="w-8" />
            <th className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Task</th>
            <th className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Quadrant</th>
            <th className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Due</th>
            <th className="w-24" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => {
            const q = getQuadrant(t);
            return (
              <tr key={t.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="px-2">
                  <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleSelect(t.id)} />
                </td>
                <td className="px-2">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={(e) => updateTodo(t.id, { done: e.target.checked })}
                    title="Mark done"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    value={t.title}
                    onChange={(e) => updateTodo(t.id, { title: e.target.value })}
                    className={`w-full bg-transparent outline-none ${t.done ? "line-through text-neutral-400" : ""}`}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: `${q.color}22`, color: q.color }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: q.color }} />
                    {q.label}
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="date"
                    value={t.dueDate}
                    onChange={(e) => updateTodo(t.id, { dueDate: e.target.value })}
                    className="bg-transparent outline-none text-neutral-600 dark:text-neutral-400"
                  />
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  <button
                    onClick={() => sendTodoToRoadmap(t)}
                    title="Add to Roadmap"
                    className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                  >
                    <ArrowRightCircle size={15} />
                  </button>
                  <button
                    onClick={() => removeTodo(t.id)}
                    title="Delete"
                    className="p-1 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
