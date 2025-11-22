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

  const willBeCompleted = !current.isCompleted;
  const task = await prisma.task.update({
    where: { id },
    data: {
      isCompleted: willBeCompleted,
      completedAt: willBeCompleted ? new Date() : null,
    },
  });

  // Update streak if task is being completed
  if (willBeCompleted) {
    await updateDailyStreak();
  }

  revalidatePath("/");
  return task;
}

async function updateDailyStreak() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if activity already logged for today
  const existing = await prisma.userActivityLog.findUnique({
    where: { date: today },
  });

  if (existing) {
    return; // Already counted today
  }

  // Get last activity date
  const lastActivity = await prisma.userActivityLog.findFirst({
    orderBy: { date: "desc" },
  });

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (!lastActivity) {
    // First activity ever
    await prisma.userActivityLog.create({
      data: { date: today },
    });
  } else {
    const lastDate = new Date(lastActivity.date);
    lastDate.setHours(0, 0, 0, 0);

    if (lastDate.getTime() < yesterday.getTime()) {
      // Streak broken - start new streak
      await prisma.userActivityLog.create({
        data: { date: today },
      });
    } else {
      // Continue streak - log today
      await prisma.userActivityLog.create({
        data: { date: today },
      });
    }
  }
}

export async function getStreakCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activities = await prisma.userActivityLog.findMany({
    orderBy: { date: "desc" },
  });

  if (activities.length === 0) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(today);

  for (const activity of activities) {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (checkDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      checkDate = new Date(activityDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

