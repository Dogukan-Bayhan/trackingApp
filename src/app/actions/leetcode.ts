"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function updateSolvedProblems(id: string, solved: number) {
  const metric = await prisma.leetcodeMetric.findUnique({
    where: { id },
    select: {
      totalProblems: true,
    },
  });

  if (!metric) {
    throw new Error("Metric not found");
  }

  const safeValue = Number.isFinite(solved) ? Math.floor(solved) : 0;
  const clamped = Math.min(
    Math.max(safeValue, 0),
    Math.max(metric.totalProblems, 0)
  );

  const updated = await prisma.leetcodeMetric.update({
    where: { id },
    data: { solvedProblems: clamped },
  });

  revalidatePath("/");
  return updated;
}

