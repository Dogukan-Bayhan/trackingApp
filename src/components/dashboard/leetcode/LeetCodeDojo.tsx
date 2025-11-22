"use client";

import { motion } from "framer-motion";
import type { LeetcodeMetric } from "@prisma/client";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { useMemo, useState, useTransition } from "react";

import { updateSolvedProblems } from "@/app/actions/leetcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface LeetCodeDojoProps {
  metrics: LeetcodeMetric[];
  totals: {
    solved: number;
    goal: number;
  };
}

export function LeetCodeDojo({ metrics, totals }: LeetCodeDojoProps) {
  const completion =
    totals.goal === 0 ? 0 : Math.round((totals.solved / totals.goal) * 100);

  const radialData = [
    {
      name: "progress",
      value: totals.solved,
      fill: "url(#leetcodeGradient)",
    },
  ];

  return (
    <section className="space-y-8 rounded-3xl border border-white/5 bg-slate-950/70 p-6 text-slate-50 shadow-[0_40px_120px_rgba(2,6,23,0.75)]">
      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                LeetCode Dojo
              </p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                Solved {totals.solved} / {totals.goal || 1}
              </h3>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-200">
              {completion}% Focus
            </span>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="90%"
                barSize={18}
                data={radialData}
              >
                <defs>
                  <linearGradient id="leetcodeGradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#facc15" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis
                  type="number"
                  domain={[0, totals.goal || 1]}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "rgba(255,255,255,0.08)" }}
                  dataKey="value"
                  cornerRadius={30}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-x-0 bottom-4 text-center text-sm text-slate-400">
            Keep the streak alive ⚡
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.length === 0 ? (
            <p className="text-sm text-slate-500">
              Add topics to `leetcode_metrics` to unlock the dojo.
            </p>
          ) : (
            metrics.map((metric) => (
              <LeetCodeCard key={metric.id} metric={metric} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function LeetCodeCard({ metric }: { metric: LeetcodeMetric }) {
  const [solved, setSolved] = useState(metric.solvedProblems);
  const [inputValue, setInputValue] = useState(metric.solvedProblems.toString());
  const [isPending, startTransition] = useTransition();

  const completion = useMemo(() => {
    if (metric.totalProblems === 0) return 0;
    return Math.min(
      100,
      Math.round((solved / metric.totalProblems) * 100)
    );
  }, [metric.totalProblems, solved]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValue = Number(inputValue);
    if (Number.isNaN(nextValue)) return;

    startTransition(async () => {
      const updated = await updateSolvedProblems(metric.id, nextValue);
      setSolved(updated.solvedProblems);
      setInputValue(updated.solvedProblems.toString());
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 rounded-3xl border border-white/5 bg-slate-900/60 p-4 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            {metric.difficultyLevel}
          </p>
          <h4 className="text-xl font-semibold text-white">{metric.topicName}</h4>
        </div>
        <span className="text-sm font-semibold text-amber-300">
          {solved}/{metric.totalProblems}
        </span>
      </div>

      <Progress
        value={completion}
        className="h-2 bg-white/10"
      />
      <p className="text-xs text-slate-400">{completion}% mastery</p>

      <form className="mt-auto flex gap-2" onSubmit={handleSubmit}>
        <Input
          type="number"
          min={0}
          max={metric.totalProblems}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          className="border-white/10 bg-white/5 text-sm text-white"
        />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-orange-400 to-amber-400 text-slate-950 shadow-[0_10px_30px_rgba(251,146,60,0.45)]"
        >
          Update
        </Button>
      </form>
    </motion.article>
  );
}

