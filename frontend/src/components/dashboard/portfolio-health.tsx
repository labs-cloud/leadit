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
  ShieldAlert,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

interface PortfolioHealthProps {
  summary: DashboardSummary;
}

const PHASE_COLORS: Record<ProjectPhase, string> = {
  planning: "#94A3B8",
  demo: "#FACC15",
  foundation: "#FB923C",
  structure: "#F97316",
  interior: "#60A5FA",
  complete: "#34D399",
};

function HealthGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return { color: "#22C55E", label: "Excellent", bg: "rgba(34,197,94,0.1)" };
    if (s >= 60) return { color: "#EAB308", label: "Good", bg: "rgba(234,179,8,0.1)" };
    if (s >= 40) return { color: "#F97316", label: "At Risk", bg: "rgba(249,115,22,0.1)" };
    return { color: "#EF4444", label: "Critical", bg: "rgba(239,68,68,0.1)" };
  };

  const { color, label, bg } = getColor(score);
  const circumference = 2 * Math.PI * 56;
  const progress = (score / 100) * circumference * 0.75;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-[135deg]">
        {/* Background track */}
        <circle
          cx="70"
          cy="70"
          r="56"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="10"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx="70"
          cy="70"
          r="56"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color }}>
          {score}
        </span>
        <span
          className="text-[11px] font-semibold mt-0.5 px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: bg }}
        >
          {label}
        </span>
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
  const phases = Object.entries(projectsByPhase).filter(
    ([, count]) => count > 0
  ) as [ProjectPhase, number][];

  let cumulativePercent = 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        {/* Background */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="14"
        />
        {phases.map(([phase, count]) => {
          const percent = count / total;
          const gap = 0.005;
          const dashArray = `${Math.max(0, percent - gap) * circumference} ${(1 - percent + gap) * circumference}`;
          const dashOffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <circle
              key={phase}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={PHASE_COLORS[phase]}
              strokeWidth="14"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight">{total}</span>
        <span className="text-[11px] text-muted-foreground font-medium">
          Projects
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  colorClass,
  bgClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 ${bgClass} border transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium ${colorClass} opacity-80`}>
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
          {subtext && (
            <p className={`text-[11px] mt-0.5 ${colorClass} opacity-70`}>
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
          <Icon className="h-5 w-5 opacity-60" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioHealth({ summary }: PortfolioHealthProps) {
  const phases = Object.entries(summary.projects_by_phase).filter(
    ([, count]) => count > 0
  ) as [ProjectPhase, number][];

  const budgetUsage = summary.total_budget > 0
    ? Math.round((summary.total_spent / summary.total_budget) * 100)
    : 0;

  const completedCount = summary.projects_by_phase.complete || 0;
  const activeCount = summary.total_projects - completedCount;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <BarChart3 className="h-4 w-4" />
            </div>
            Portfolio Overview
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {completedCount} completed
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-blue-500" />
              {activeCount} active
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Health Score Gauge */}
          <div className="flex flex-col items-center justify-center">
            <HealthGauge score={summary.overall_health_score} />
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Weighted: tasks, violations, permits & budget
            </p>
          </div>

          {/* Phase Donut */}
          <div className="flex flex-col items-center justify-center">
            <PhaseDonut
              projectsByPhase={summary.projects_by_phase}
              total={summary.total_projects}
            />
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {phases.map(([phase, count]) => (
                <div key={phase} className="flex items-center gap-1.5 text-[11px]">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PHASE_COLORS[phase] }}
                  />
                  <span className="text-muted-foreground truncate">
                    {getPhaseLabel(phase)}
                  </span>
                  <span className="font-semibold ml-auto">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-3">
            <MetricCard
              icon={Clock}
              label="Overdue Tasks"
              value={summary.total_overdue_tasks}
              subtext={`across ${summary.total_projects} projects`}
              colorClass="text-red-700"
              bgClass="bg-red-50/80 border-red-100"
            />
            <MetricCard
              icon={ShieldAlert}
              label="Open Violations"
              value={summary.total_open_violations}
              subtext="require resolution"
              colorClass="text-amber-700"
              bgClass="bg-amber-50/80 border-amber-100"
            />
            <MetricCard
              icon={DollarSign}
              label="Total Portfolio"
              value={formatCurrency(summary.total_budget)}
              subtext={`${summary.total_projects} projects`}
              colorClass="text-blue-700"
              bgClass="bg-blue-50/80 border-blue-100"
            />
            <MetricCard
              icon={TrendingUp}
              label="Total Spent"
              value={formatCurrency(summary.total_spent)}
              subtext={`${budgetUsage}% of budget used`}
              colorClass="text-emerald-700"
              bgClass="bg-emerald-50/80 border-emerald-100"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
