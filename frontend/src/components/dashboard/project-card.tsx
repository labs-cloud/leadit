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
} from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

function HealthDot({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
        ? "bg-yellow-500"
        : score >= 40
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-muted-foreground">{score}</span>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">
              {project.address}
            </h3>
            {project.last_activity_at && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Active{" "}
                {formatDistanceToNow(new Date(project.last_activity_at), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <HealthDot score={project.health_score} />
            <Badge variant={project.phase as ProjectPhase}>
              {getPhaseLabel(project.phase)}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>
              {project.completed_tasks}/{project.total_tasks} tasks ({progressPercent}%)
            </span>
          </div>
          <Progress
            value={progressPercent}
            indicatorClassName={
              progressPercent >= 75
                ? "bg-green-500"
                : progressPercent >= 50
                  ? "bg-blue-500"
                  : progressPercent >= 25
                    ? "bg-yellow-500"
                    : "bg-gray-400"
            }
          />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={project.overdue_tasks > 0 ? "text-red-600 font-medium" : ""}>
              {project.overdue_tasks > 0
                ? `${project.overdue_tasks} overdue`
                : `${project.total_tasks} tasks`}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {project.approved_permits}/{project.total_permits}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <AlertTriangle
              className={`h-3.5 w-3.5 ${
                project.open_violations > 0 ? "text-red-500" : "text-muted-foreground"
              }`}
            />
            <span
              className={project.open_violations > 0 ? "text-red-600 font-medium" : ""}
            >
              {project.open_violations} viol.
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <DollarSign
              className={`h-3.5 w-3.5 ${
                isOverBudget ? "text-red-500" : "text-muted-foreground"
              }`}
            />
            <span className={isOverBudget ? "text-red-600 font-medium" : ""}>
              {budgetPercent}%
            </span>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Budget</span>
            <span>
              {formatCurrency(project.budget_spent)} / {formatCurrency(project.budget_total)}
            </span>
          </div>
          <Progress
            value={Math.min(budgetPercent, 100)}
            indicatorClassName={
              isOverBudget
                ? "bg-red-500"
                : budgetPercent >= 90
                  ? "bg-orange-500"
                  : budgetPercent >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <ExternalLink className="h-3 w-3 mr-1" />
            ClickUp
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <FolderOpen className="h-3 w-3 mr-1" />
            Files
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <MessageSquare className="h-3 w-3 mr-1" />
            Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
