"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary, ProjectPhase } from "@/lib/types";
import { formatCurrency, getPhaseLabel } from "@/lib/utils";
import {
  Building2,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
} from "lucide-react";

interface PortfolioHealthProps {
  summary: DashboardSummary;
}

const PHASE_COLORS: Record<ProjectPhase, string> = {
  planning: "#9CA3AF",
  demo: "#EAB308",
  foundation: "#F97316",
  structure: "#EA580C",
  interior: "#3B82F6",
  complete: "#22C55E",
};

function HealthGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "#22C55E";
    if (s >= 60) return "#EAB308";
    if (s >= 40) return "#F97316";
    return "#EF4444";
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 60;
  const progress = (score / 100) * circumference * 0.75;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-[135deg]">
        <circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="12"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
        />
        <circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">Health Score</span>
      </div>
    </div>
  );
}

function PhaseDonut({
  projectsByPhase,
  total,
}: {
  projectsByPhase: Record<ProjectPhase, number>;
  total: number;
}) {
  const phases = Object.entries(projectsByPhase).filter(([, count]) => count > 0) as [
    ProjectPhase,
    number,
  ][];

  let cumulativePercent = 0;
  const size = 140;
  const radius = 55;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        {phases.map(([phase, count]) => {
          const percent = count / total;
          const dashArray = `${percent * circumference} ${circumference - percent * circumference}`;
          const dashOffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <circle
              key={phase}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={PHASE_COLORS[phase]}
              strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground">Projects</span>
      </div>
    </div>
  );
}

export function PortfolioHealth({ summary }: PortfolioHealthProps) {
  const phases = Object.entries(summary.projects_by_phase).filter(
    ([, count]) => count > 0
  ) as [ProjectPhase, number][];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Portfolio Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Health Score Gauge */}
          <div className="flex flex-col items-center">
            <HealthGauge score={summary.overall_health_score} />
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Based on tasks, violations, permits & budget
              </p>
            </div>
          </div>

          {/* Phase Donut */}
          <div className="flex flex-col items-center">
            <PhaseDonut
              projectsByPhase={summary.projects_by_phase}
              total={summary.total_projects}
            />
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {phases.map(([phase, count]) => (
                <div key={phase} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PHASE_COLORS[phase] }}
                  />
                  <span>
                    {getPhaseLabel(phase)} ({count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
              <Clock className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {summary.total_overdue_tasks}
                </p>
                <p className="text-xs text-red-600">Overdue Tasks</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
              <AlertTriangle className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {summary.total_open_violations}
                </p>
                <p className="text-xs text-orange-600">Open Violations</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <DollarSign className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(summary.total_budget)}
                </p>
                <p className="text-xs text-blue-600">Total Portfolio</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <TrendingUp className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summary.total_spent)}
                </p>
                <p className="text-xs text-green-600">
                  Total Spent ({Math.round((summary.total_spent / summary.total_budget) * 100)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
