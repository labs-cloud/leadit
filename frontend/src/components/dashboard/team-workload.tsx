"use client";

import React from "react";
import { TeamMember } from "@/lib/types";
import { SectionHeader } from "./overview-tables";

interface TeamWorkloadProps {
  members: TeamMember[];
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-fuchsia-600",
];

function getWorkloadLevel(tasks: number): {
  label: string;
  color: string;
  barColor: string;
} {
  if (tasks <= 8) return { label: "Light", color: "text-emerald-400", barColor: "bg-emerald-500" };
  if (tasks <= 14) return { label: "Normal", color: "text-yellow-400", barColor: "bg-yellow-500" };
  return { label: "Heavy", color: "text-red-400", barColor: "bg-red-500" };
}

export function TeamWorkload({ members }: TeamWorkloadProps) {
  const sortedMembers = [...members].sort(
    (a, b) => b.active_tasks - a.active_tasks
  );
  const maxTasks = Math.max(...members.map((m) => m.active_tasks), 1);

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5 animate-slide-up">
      <SectionHeader color="bg-indigo-500" title="Team Workload" count={members.length} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedMembers.map((member, index) => {
          const workload = getWorkloadLevel(member.active_tasks);
          const loadPercent = (member.active_tasks / maxTasks) * 100;
          const colorIdx = index % AVATAR_COLORS.length;
          const initials = member.name
            .split(" ")
            .map((n) => n[0])
            .join("");

          return (
            <div
              key={member.id}
              className="p-3.5 rounded-lg bg-white/[0.03] border border-[hsl(var(--border))] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {member.projects_assigned} projects
                  </p>
                </div>
                {member.overdue_tasks > 0 && (
                  <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                    {member.overdue_tasks} late
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">
                    {member.active_tasks} tasks
                  </span>
                  <span className={`font-semibold ${workload.color}`}>
                    {workload.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${workload.barColor}`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
