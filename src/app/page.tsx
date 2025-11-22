import type { ComponentProps } from "react";
import { format } from "date-fns";

import TabLeetCode from "@/components/dashboard/TabLeetCode";
import TabToday from "@/components/dashboard/TabToday";
import TabTomorrow from "@/components/dashboard/TabTomorrow";
import TabVault from "@/components/dashboard/TabVault";
import TabWeek from "@/components/dashboard/TabWeek";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function Home() {
  const todayLabel = format(new Date(), "MMMM d, yyyy");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] px-4 py-14 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
        <div className="absolute right-10 top-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute left-10 top-1/2 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.6em] text-slate-400">
            Gamified Life OS
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Deep Focus Command Center
              </h1>
              <p className="mt-2 text-base text-slate-400">
                {todayLabel} &middot; Craft rituals, attack sprints, archive
                mastery.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Current Streak
              </span>
              <p className="text-2xl font-semibold text-emerald-300">7 days 🔥</p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="today" className="space-y-8">
          <TabsList className="flex flex-wrap items-center justify-center gap-4 rounded-[32px] border border-white/10 bg-white/10 p-3 text-sm font-medium backdrop-blur-xl">
            <StyledTrigger value="today" gradient="from-amber-500/30 to-orange-500/10">
              Today
            </StyledTrigger>
            <StyledTrigger value="tomorrow" gradient="from-sky-500/20 to-indigo-500/10">
              Tomorrow
            </StyledTrigger>
            <StyledTrigger value="week" gradient="from-emerald-500/25 to-lime-500/10">
              This Week
            </StyledTrigger>
            <StyledTrigger value="leetcode" gradient="from-orange-400/30 to-amber-300/10">
              LeetCode
            </StyledTrigger>
            <StyledTrigger value="vault" gradient="from-cyan-500/25 to-violet-500/15">
              The Vault
            </StyledTrigger>
          </TabsList>

          <TabsContent value="today">
            <TabToday />
          </TabsContent>
          <TabsContent value="tomorrow">
            <TabTomorrow />
          </TabsContent>
          <TabsContent value="week">
            <TabWeek />
          </TabsContent>
          <TabsContent value="leetcode">
            <TabLeetCode />
          </TabsContent>
          <TabsContent value="vault">
            <TabVault />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StyledTriggerProps
  extends ComponentProps<typeof TabsTrigger> {
  gradient: string;
}

function StyledTrigger({ gradient, children, ...props }: StyledTriggerProps) {
  return (
    <TabsTrigger
      {...props}
      className={cn(
        "rounded-2xl border border-transparent px-4 py-2 text-slate-300 transition data-[state=active]:text-white",
        "data-[state=active]:border-white/20 data-[state=active]:shadow-[0_20px_40px_rgba(0,0,0,0.45)]",
        `data-[state=active]:bg-gradient-to-r ${gradient}`
      )}
    >
      {children}
    </TabsTrigger>
  );
}
