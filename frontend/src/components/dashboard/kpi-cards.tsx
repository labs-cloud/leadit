"use client";

import React from "react";
import { DashboardSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface KPICardsProps {
  summary: DashboardSummary;
  pendingPermits: number;
  projectsAtRisk: number;
}

interface KPICardData {
  label: string;
  value: string | number;
  subtitle: string;
  accentColor: string;
  valueColor: string;
}

function KPICard({ label, value, subtitle, accentColor, valueColor }: KPICardData) {
  return (
    <div className="relative bg-[hsl(var(--card))] rounded-lg p-5 border border-[hsl(var(--border))] overflow-hidden">
      {/* Left accent line */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: accentColor }}
      />
      <p className="text-[11px] font-medium tracking-wider uppercase text-[hsl(var(--muted-foreground))] mb-2">
        {label}
      </p>
      <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </p>
      <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
        {subtitle}
      </p>
    </div>
  );
}

export function KPICards({ summary, pendingPermits, projectsAtRisk }: KPICardsProps) {
  const activeProjects = summary.total_projects - (summary.projects_by_phase.complete || 0);
  const constructionCount =
    (summary.projects_by_phase.foundation || 0) +
    (summary.projects_by_phase.structure || 0) +
    (summary.projects_by_phase.interior || 0);
  const planningCount = (summary.projects_by_phase.planning || 0) + (summary.projects_by_phase.demo || 0);

  const budgetUsed = summary.total_budget > 0
    ? Math.round((summary.total_spent / summary.total_budget) * 100)
    : 0;

  const cards: KPICardData[] = [
    {
      label: "Overdue Tasks",
      value: summary.total_overdue_tasks,
      subtitle: `${projectsAtRisk} projects at risk`,
      accentColor: "#EF4444",
      valueColor: summary.total_overdue_tasks > 0 ? "text-red-400" : "text-white",
    },
    {
      label: "Active Projects",
      value: activeProjects,
      subtitle: `${constructionCount} construction \u00B7 ${planningCount} planning`,
      accentColor: "#3B82F6",
      valueColor: "text-blue-400",
    },
    {
      label: "Total Budget",
      value: formatCurrency(summary.total_budget),
      subtitle: `${formatCurrency(summary.total_spent)} spent`,
      accentColor: "#10B981",
      valueColor: "text-white",
    },
    {
      label: "Budget Utilized",
      value: `${budgetUsed}%`,
      subtitle: `${formatCurrency(summary.total_budget - summary.total_spent)} remaining`,
      accentColor: budgetUsed > 90 ? "#F59E0B" : "#10B981",
      valueColor: budgetUsed > 100 ? "text-red-400" : budgetUsed > 90 ? "text-yellow-400" : "text-emerald-400",
    },
    {
      label: "Pending Permits",
      value: pendingPermits,
      subtitle: `across ${activeProjects} projects`,
      accentColor: "#8B5CF6",
      valueColor: pendingPermits > 0 ? "text-violet-400" : "text-white",
    },
    {
      label: "Open Violations",
      value: summary.total_open_violations,
      subtitle: `${summary.unread_alerts} unread alerts`,
      accentColor: "#F59E0B",
      valueColor: summary.total_open_violations > 0 ? "text-amber-400" : "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
