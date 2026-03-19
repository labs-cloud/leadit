"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/lib/types";
import { Users, AlertCircle } from "lucide-react";

interface TeamWorkloadProps {
  members: TeamMember[];
}

function getWorkloadLevel(tasks: number): { label: string; color: string; indicatorColor: string } {
  if (tasks <= 8) return { label: "Light", color: "text-green-600", indicatorColor: "bg-green-500" };
  if (tasks <= 14) return { label: "Normal", color: "text-yellow-600", indicatorColor: "bg-yellow-500" };
  return { label: "Heavy", color: "text-red-600", indicatorColor: "bg-red-500" };
}

export function TeamWorkload({ members }: TeamWorkloadProps) {
  const sortedMembers = [...members].sort((a, b) => b.active_tasks - a.active_tasks);
  const maxTasks = Math.max(...members.map((m) => m.active_tasks), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Workload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedMembers.map((member) => {
            const workload = getWorkloadLevel(member.active_tasks);
            const loadPercent = (member.active_tasks / maxTasks) * 100;

            return (
              <div
                key={member.id}
                className="p-3 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.projects_assigned} projects
                    </p>
                  </div>
                  {member.overdue_tasks > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                      <AlertCircle className="h-3 w-3 mr-0.5" />
                      {member.overdue_tasks}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {member.active_tasks} tasks
                    </span>
                    <span className={workload.color}>{workload.label}</span>
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
