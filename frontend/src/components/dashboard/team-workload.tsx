"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/lib/types";
import { Users, AlertCircle, Briefcase } from "lucide-react";

interface TeamWorkloadProps {
  members: TeamMember[];
}

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-cyan-400 to-cyan-600",
  "from-indigo-400 to-indigo-600",
  "from-fuchsia-400 to-fuchsia-600",
];

function getWorkloadLevel(
  tasks: number
): { label: string; color: string; indicatorColor: string; bgColor: string } {
  if (tasks <= 8)
    return {
      label: "Light",
      color: "text-emerald-600",
      indicatorColor: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      bgColor: "bg-emerald-50",
    };
  if (tasks <= 14)
    return {
      label: "Normal",
      color: "text-amber-600",
      indicatorColor: "bg-gradient-to-r from-amber-400 to-amber-500",
      bgColor: "bg-amber-50",
    };
  return {
    label: "Heavy",
    color: "text-red-600",
    indicatorColor: "bg-gradient-to-r from-red-400 to-red-500",
    bgColor: "bg-red-50",
  };
}

export function TeamWorkload({ members }: TeamWorkloadProps) {
  const sortedMembers = [...members].sort(
    (a, b) => b.active_tasks - a.active_tasks
  );
  const maxTasks = Math.max(...members.map((m) => m.active_tasks), 1);
  const totalOverdue = members.reduce((sum, m) => sum + m.overdue_tasks, 0);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
            Team Workload
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {members.length} members
            </span>
            {totalOverdue > 0 && (
              <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <AlertCircle className="h-3 w-3" />
                {totalOverdue} overdue
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedMembers.map((member, index) => {
            const workload = getWorkloadLevel(member.active_tasks);
            const loadPercent = (member.active_tasks / maxTasks) * 100;
            const colorIndex = index % AVATAR_COLORS.length;

            return (
              <div
                key={member.id}
                className="p-3 rounded-xl border border-slate-100 hover:shadow-md transition-all bg-white/60 group"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[colorIndex]} flex items-center justify-center text-[11px] font-bold text-white shadow-sm flex-shrink-0`}
                  >
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {member.projects_assigned} projects
                    </p>
                  </div>
                  {member.overdue_tasks > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1.5 h-5"
                    >
                      {member.overdue_tasks} late
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      {member.active_tasks} active tasks
                    </span>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded ${workload.bgColor} ${workload.color}`}
                      style={{ fontSize: "10px" }}
                    >
                      {workload.label}
                    </span>
                  </div>
                  <Progress
                    value={loadPercent}
                    indicatorClassName={workload.indicatorColor}
                    className="h-1.5"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
