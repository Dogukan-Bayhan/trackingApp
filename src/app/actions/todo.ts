"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export type TaskType = "TODAY" | "TOMORROW" | "WEEK";
export type TaskCategory = "PROJECT" | "LEETCODE" | "SPORT" | "STUDY";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export async function getTasks(type: TaskType) {
  return prisma.task.findMany({
    where: { type },
    orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
  });
}

export async function addTask(
  title: string,
  type: TaskType,
  category: TaskCategory = "PROJECT",
  priority: TaskPriority = "MEDIUM"
) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Title is required");
  }

  const task = await prisma.task.create({
    data: {
      title: trimmed,
      type,
      category,
      priority,
    },
  });

  revalidatePath("/");
  return task;
}

export async function toggleTask(id: string) {
  const current = await prisma.task.findUnique({
    where: { id },
    select: { isCompleted: true },
  });

  if (!current) {
    throw new Error("Task not found");
  }

  const task = await prisma.task.update({
    where: { id },
    data: { isCompleted: !current.isCompleted },
  });

  revalidatePath("/");
  return task;
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

