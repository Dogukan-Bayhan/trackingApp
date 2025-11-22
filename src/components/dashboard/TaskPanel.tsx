"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@prisma/client";

import {
  addTask,
  deleteTask,
  TaskCategory,
  TaskPriority,
  TaskType,
  toggleTask,
} from "@/app/actions/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { cn } from "@/lib/utils";

type OptimisticAction =
  | { type: "add"; task: Task }
  | { type: "toggle"; id: string }
  | { type: "delete"; id: string };

interface TaskPanelProps {
  initialTasks: Task[];
  type: TaskType;
  title?: string;
}

const categoryOptions: TaskCategory[] = [
  "PROJECT",
  "LEETCODE",
  "SPORT",
  "STUDY",
];

const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

export function TaskPanel({ initialTasks, type, title }: TaskPanelProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<TaskCategory>("PROJECT");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [isPending, startTransition] = useTransition();

  const [optimisticTasks, applyOptimistic] = useOptimistic(
    tasks,
    (state: Task[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [action.task, ...state];
        case "toggle":
          return state.map((task) =>
            task.id === action.id
              ? { ...task, isCompleted: !task.isCompleted }
              : task
          );
        case "delete":
          return state.filter((task) => task.id !== action.id);
        default:
          return state;
      }
    }
  );

  const placeholderLabel = useMemo(() => {
    switch (type) {
      case "TOMORROW":
        return "Plan the next sprint...";
      case "WEEK":
        return "What anchors this week?";
      default:
        return "Name the next big action...";
    }
  }, [type]);

  const displayTasks = useMemo(
    () =>
      [...optimisticTasks].sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }
        return Number(a.isCompleted) - Number(b.isCompleted);
      }),
    [optimisticTasks]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }

    const optimisticTask: Task = {
      id: `optimistic-${crypto.randomUUID()}`,
      title: text.trim(),
      type,
      category,
      priority,
      isCompleted: false,
      createdAt: new Date(),
    };
    applyOptimistic({ type: "add", task: optimisticTask });
    setText("");

    startTransition(async () => {
      try {
        const created = await addTask(
          optimisticTask.title,
          type,
          category,
          priority
        );
        setTasks((prev) => [created, ...prev]);
      } finally {
        router.refresh();
      }
    });
  };

  const handleToggle = (id: string) => {
    applyOptimistic({ type: "toggle", id });
    startTransition(async () => {
      try {
        const updated = await toggleTask(id);
        setTasks((prev) =>
          prev.map((task) => (task.id === updated.id ? updated : task))
        );
      } finally {
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    applyOptimistic({ type: "delete", id });
    startTransition(async () => {
      try {
        await deleteTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } finally {
        router.refresh();
      }
    });
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/80 p-6 text-slate-100 shadow-[0_20px_80px_rgba(15,23,42,0.75)] backdrop-blur-3xl">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {title ?? type.toLowerCase()}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {type === "TODAY"
              ? "Today's Quest Log"
              : type === "TOMORROW"
                ? "Tomorrow's Momentum"
                : "Weekly Master Plan"}
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
        >
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={placeholderLabel}
            className="border-white/10 bg-white/5 text-slate-50 placeholder:text-slate-400"
            disabled={isPending}
          />
          <select
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 outline-none transition hover:border-white/30"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as TaskCategory)
            }
            disabled={isPending}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 outline-none transition hover:border-white/30"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
            disabled={isPending}
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 text-slate-950 shadow-[0_15px_40px_rgba(45,212,191,0.35)] transition hover:opacity-90"
          >
            Add Task
          </Button>
        </form>
      </div>

      <div className="mt-8 space-y-4">
        {displayTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks yet. Add one above.</p>
        ) : (
          <AnimatePresence initial={false}>
            {displayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

