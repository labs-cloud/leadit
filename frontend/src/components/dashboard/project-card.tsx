"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Project, ProjectPhase } from "@/lib/types";
import { formatCurrency, getPhaseLabel } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ClipboardList,
  FileText,
  AlertTriangle,
  DollarSign,
  ExternalLink,
  FolderOpen,
  MessageSquare,
  MapPin,
  Clock,
} from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

const PHASE_ACCENT: Record<ProjectPhase, string> = {
  planning: "from-slate-400 to-slate-500",
  demo: "from-yellow-400 to-yellow-500",
  foundation: "from-orange-400 to-orange-500",
  structure: "from-orange-500 to-orange-600",
  interior: "from-blue-400 to-blue-500",
  complete: "from-emerald-400 to-emerald-500",
};

function HealthIndicator({ score }: { score: number }) {
  const config =
    score >= 80
      ? { color: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700" }
      : score >= 60
        ? { color: "bg-yellow-500", ring: "ring-yellow-200", text: "text-yellow-700" }
        : score >= 40
          ? { color: "bg-orange-500", ring: "ring-orange-200", text: "text-orange-700" }
          : { color: "bg-red-500", ring: "ring-red-200", text: "text-red-700" };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${config.color} ring-2 ${config.ring}`}
      />
      <span className={`text-xs font-semibold ${config.text}`}>{score}</span>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progressPercent =
    project.total_tasks > 0
      ? Math.round((project.completed_tasks / project.total_tasks) * 100)
      : 0;

  const budgetPercent =
    project.budget_total > 0
      ? Math.round((project.budget_spent / project.budget_total) * 100)
      : 0;

  const isOverBudget = project.budget_spent > project.budget_total;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm">
      {/* Colored top accent bar */}
      <div
        className={`h-1 bg-gradient-to-r ${PHASE_ACCENT[project.phase]}`}
      />

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-sm leading-tight truncate">
                {project.address}
              </h3>
            </div>
            {project.last_activity_at && (
              <div className="flex items-center gap-1 text-muted-foreground ml-[18px]">
                <Clock className="h-3 w-3" />
                <p className="text-[11px]">
                  {formatDistanceToNow(new Date(project.last_activity_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <HealthIndicator score={project.health_score} />
            <Badge variant={project.phase as ProjectPhase} className="text-[10px]">
              {getPhaseLabel(project.phase)}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span className="font-medium">Task Progress</span>
            <span>
              <span className="font-semibold text-foreground">
                {project.completed_tasks}
              </span>
              /{project.total_tasks} ({progressPercent}%)
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2"
            indicatorClassName={
              progressPercent >= 75
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : progressPercent >= 50
                  ? "bg-gradient-to-r from-blue-400 to-blue-500"
                  : progressPercent >= 25
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-r from-slate-300 to-slate-400"
            }
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-1 mb-3 p-2.5 rounded-lg bg-slate-50/80">
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <ClipboardList
                className={`h-3 w-3 ${project.overdue_tasks > 0 ? "text-red-500" : "text-slate-400"}`}
              />
            </div>
            <p
              className={`text-xs font-bold mt-0.5 ${project.overdue_tasks > 0 ? "text-red-600" : "text-foreground"}`}
            >
              {project.overdue_tasks > 0 ? project.overdue_tasks : project.total_tasks}
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight">
              {project.overdue_tasks > 0 ? "Overdue" : "Tasks"}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <FileText className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-xs font-bold mt-0.5">
              {project.approved_permits}/{project.total_permits}
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight">
              Permits
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <AlertTriangle
                className={`h-3 w-3 ${project.open_violations > 0 ? "text-red-500" : "text-slate-400"}`}
              />
            </div>
            <p
              className={`text-xs font-bold mt-0.5 ${project.open_violations > 0 ? "text-red-600" : "text-foreground"}`}
            >
              {project.open_violations}
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight">
              Violations
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <DollarSign
                className={`h-3 w-3 ${isOverBudget ? "text-red-500" : "text-slate-400"}`}
              />
            </div>
            <p
              className={`text-xs font-bold mt-0.5 ${isOverBudget ? "text-red-600" : "text-foreground"}`}
            >
              {budgetPercent}%
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight">
              Budget
            </p>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span className="font-medium">Budget</span>
            <span>
              {formatCurrency(project.budget_spent)}{" "}
              <span className="text-muted-foreground/60">
                / {formatCurrency(project.budget_total)}
              </span>
            </span>
          </div>
          <Progress
            value={Math.min(budgetPercent, 100)}
            className="h-1.5"
            indicatorClassName={
              isOverBudget
                ? "bg-gradient-to-r from-red-400 to-red-500"
                : budgetPercent >= 90
                  ? "bg-gradient-to-r from-orange-400 to-orange-500"
                  : budgetPercent >= 75
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-r from-emerald-400 to-emerald-500"
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] flex-1 border-slate-200 hover:bg-slate-50"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            ClickUp
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] flex-1 border-slate-200 hover:bg-slate-50"
          >
            <FolderOpen className="h-3 w-3 mr-1" />
            Files
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] flex-1 border-slate-200 hover:bg-slate-50"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
