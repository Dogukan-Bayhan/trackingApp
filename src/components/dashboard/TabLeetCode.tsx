import { prisma } from "@/lib/prisma";
import { LeetCodeDojo } from "@/components/dashboard/leetcode/LeetCodeDojo";

export default async function TabLeetCode() {
  const metrics = await prisma.leetcodeMetric.findMany({
    orderBy: { topicName: "asc" },
  });

  const totalSolved = metrics.reduce(
    (sum, metric) => sum + metric.solvedProblems,
    0
  );
  const totalGoal = metrics.reduce(
    (sum, metric) => sum + metric.totalProblems,
    0
  );

  return (
    <LeetCodeDojo
      metrics={metrics}
      totals={{ solved: totalSolved, goal: totalGoal }}
    />
  );
}

