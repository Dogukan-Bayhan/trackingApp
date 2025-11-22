"use client";

import { motion } from "framer-motion";
import type { Task } from "@prisma/client";
import { Check, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

import type { TaskCategory, TaskPriority } from "@/app/actions/todo";

const categoryStyles: Record<
  TaskCategory,
  {
    label: string;
    accent: string;
    glow: string;
    emoji: string;
  }
> = {
  PROJECT: {
    label: "Project",
    accent: "from-indigo-500/30 via-blue-500/10 to-transparent",
    glow: "shadow-[0_0_30px_rgba(79,70,229,0.45)]",
    emoji: "💻",
  },
  LEETCODE: {
    label: "LeetCode",
    accent: "from-amber-400/30 via-orange-500/20 to-transparent",
    glow: "shadow-[0_0_35px_rgba(251,191,36,0.45)]",
    emoji: "🧠",
  },
  SPORT: {
    label: "Sport",
    accent: "from-emerald-400/30 via-green-500/15 to-transparent",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.4)]",
    emoji: "🏋️",
  },
  STUDY: {
    label: "Study",
    accent: "from-violet-500/30 via-purple-500/15 to-transparent",
    glow: "shadow-[0_0_35px_rgba(139,92,246,0.4)]",
    emoji: "📚",
  },
};

const priorityTokens: Record<
  TaskPriority,
  { label: string; pill: string }
> = {
  LOW: {
    label: "Low",
    pill: "bg-slate-800/70 text-slate-300",
  },
  MEDIUM: {
    label: "Medium",
    pill: "bg-sky-500/20 text-sky-200 border border-sky-600/30",
  },
  HIGH: {
    label: "High",
    pill: "bg-rose-500/20 text-rose-100 border border-rose-500/40",
  },
};

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const categoryToken = categoryStyles[task.category as TaskCategory];
  const priorityToken = priorityTokens[task.priority as TaskPriority];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-4 backdrop-blur-xl",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-70",
        categoryToken.accent,
        categoryToken.glow
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label="Toggle task"
          className={cn(
            "mt-1 flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-xl transition-colors",
            task.isCompleted
              ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
              : "text-slate-400"
          )}
        >
          {task.isCompleted ? <Check className="size-5" /> : categoryToken.emoji}
        </button>

        <div className="flex-1 space-y-3">
          <div>
            <p
              className={cn(
                "text-base font-semibold tracking-tight text-slate-50 transition-colors",
                task.isCompleted && "text-slate-500 line-through"
              )}
            >
              {task.title}
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              {categoryToken.label}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] uppercase tracking-wide",
                priorityToken.pill
              )}
            >
              {priorityToken.label} Priority
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
              {new Date(task.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          aria-label="Delete task"
          onClick={() => onDelete(task.id)}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:border-rose-500/40 hover:text-rose-200"
        >
          <Trash2 className="size-4" />
        </motion.button>
      </div>
    </motion.article>
  );
}

