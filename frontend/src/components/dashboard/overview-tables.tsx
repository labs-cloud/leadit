"use client";

import React from "react";
import { Project, Alert } from "@/lib/types";
import { formatCurrency, getPhaseLabel } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

/* ─── Shared Section Header ─── */
function SectionHeader({
  color,
  title,
  count,
}: {
  color: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      {count !== undefined && (
        <span className="text-[11px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full border border-[hsl(var(--border))]">
          {count}
        </span>
      )}
    </div>
  );
}

/* Column header */
function ColHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-[10px] font-semibold tracking-wider uppercase text-muted-foreground pb-3 text-left ${className}`}
    >
      {children}
    </th>
  );
}

/* Status badge */
function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant:
    | "red"
    | "yellow"
    | "orange"
    | "green"
    | "blue"
    | "purple"
    | "gray";
}) {
  const colors: Record<string, string> = {
    red: "bg-red-500/15 text-red-400 border-red-500/20",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    purple: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    gray: "bg-white/5 text-muted-foreground border-white/10",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

/* Action button */
function ActionBtn({
  label,
  variant = "blue",
  onClick,
}: {
  label: string;
  variant?: "blue" | "green" | "red" | "gray";
  onClick?: () => void;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-600 hover:bg-blue-500 text-white",
    green: "bg-emerald-600 hover:bg-emerald-500 text-white",
    red: "bg-red-600 hover:bg-red-500 text-white",
    gray: "bg-white/10 hover:bg-white/15 text-muted-foreground",
  };

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${colors[variant]}`}
    >
      {label}
    </button>
  );
}

/* ─── Utility ─── */
function getProjectStatus(
  p: Project
): { label: string; variant: "red" | "yellow" | "orange" | "green" | "gray" } {
  if (p.phase === "complete") return { label: "COMPLETED", variant: "green" };
  if (p.open_violations > 0 && p.health_score < 40)
    return { label: "STOP WORK", variant: "red" };
  if (p.health_score < 50) return { label: "AT RISK", variant: "orange" };
  if (p.overdue_tasks > 3) return { label: "DELAYED", variant: "yellow" };
  return { label: "ACTIVE", variant: "green" };
}

/* ─── Projects At Risk Table ─── */
function ProjectsAtRiskTable({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject?: (p: Project) => void;
}) {
  const atRisk = projects
    .filter(
      (p) =>
        p.phase !== "complete" &&
        (p.overdue_tasks > 0 || p.health_score < 60)
    )
    .sort((a, b) => a.health_score - b.health_score)
    .slice(0, 6);

  if (atRisk.length === 0) return null;

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5">
      <div className="mb-4">
        <SectionHeader
          color="bg-red-500"
          title="Projects At Risk"
          count={atRisk.length}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <ColHeader>Project</ColHeader>
              <ColHeader>Status</ColHeader>
              <ColHeader>Phase</ColHeader>
              <ColHeader className="text-right">Overdue</ColHeader>
              <ColHeader className="text-right">Action</ColHeader>
            </tr>
          </thead>
          <tbody>
            {atRisk.map((p) => {
              const status = getProjectStatus(p);
              return (
                <tr
                  key={p.id}
                  className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">
                      {p.address.split(",")[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {getPhaseLabel(p.phase)}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge label={status.label} variant={status.variant} />
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">
                    {getPhaseLabel(p.phase)}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span
                      className={`text-sm font-semibold ${p.overdue_tasks > 0 ? "text-red-400" : "text-foreground"}`}
                    >
                      {p.overdue_tasks}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <ActionBtn
                      label="View"
                      onClick={() => onOpenProject?.(p)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Open Violations Table ─── */
function ViolationsTable({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject?: (p: Project) => void;
}) {
  const withViolations = projects
    .filter((p) => p.open_violations > 0)
    .sort((a, b) => b.open_violations - a.open_violations)
    .slice(0, 6);

  if (withViolations.length === 0) return null;

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5">
      <div className="mb-4">
        <SectionHeader
          color="bg-red-500"
          title="Open Violations"
          count={withViolations.reduce(
            (s, p) => s + p.open_violations,
            0
          )}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <ColHeader>Project</ColHeader>
              <ColHeader className="text-center">Violations</ColHeader>
              <ColHeader>Phase</ColHeader>
              <ColHeader className="text-right">Action</ColHeader>
            </tr>
          </thead>
          <tbody>
            {withViolations.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 pr-4">
                  <p className="text-sm font-medium text-foreground">
                    {p.address.split(",")[0]}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {getPhaseLabel(p.phase)}
                  </p>
                </td>
                <td className="py-3 pr-4 text-center">
                  <span className="text-sm font-bold text-red-400">
                    {p.open_violations}
                  </span>
                </td>
                <td className="py-3 pr-4 text-sm text-muted-foreground">
                  {getPhaseLabel(p.phase)}
                </td>
                <td className="py-3 text-right">
                  <ActionBtn
                    label="View"
                    variant="red"
                    onClick={() => onOpenProject?.(p)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Budget Overview Table ─── */
function BudgetOverviewTable({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject?: (p: Project) => void;
}) {
  const topBudget = [...projects]
    .filter((p) => p.budget_total > 0)
    .sort((a, b) => b.budget_total - a.budget_total)
    .slice(0, 6);

  if (topBudget.length === 0) return null;

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5">
      <div className="mb-4">
        <SectionHeader
          color="bg-emerald-500"
          title="Budget Overview \u2013 Top Projects"
          count={topBudget.length}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <ColHeader>Project</ColHeader>
              <ColHeader className="text-right">Budget</ColHeader>
              <ColHeader className="text-right">Spent</ColHeader>
              <ColHeader className="text-right">Open</ColHeader>
              <ColHeader className="text-right w-24">%</ColHeader>
            </tr>
          </thead>
          <tbody>
            {topBudget.map((p) => {
              const open = p.budget_total - p.budget_spent;
              const pct = Math.round(
                (p.budget_spent / p.budget_total) * 100
              );
              const isOver = pct > 100;
              return (
                <tr
                  key={p.id}
                  className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => onOpenProject?.(p)}
                >
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">
                      {p.address.split(",")[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {getPhaseLabel(p.phase)}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-right text-sm text-foreground">
                    {formatCurrency(p.budget_total)}
                  </td>
                  <td
                    className={`py-3 pr-4 text-right text-sm ${isOver ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {formatCurrency(p.budget_spent)}
                  </td>
                  <td
                    className={`py-3 pr-4 text-right text-sm ${open < 0 ? "text-red-400" : "text-foreground"}`}
                  >
                    {open < 0
                      ? `-${formatCurrency(Math.abs(open))}`
                      : formatCurrency(open)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver
                              ? "bg-red-500"
                              : pct > 80
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-medium w-8 text-right ${
                          isOver ? "text-red-400" : "text-muted-foreground"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Alerts Table ─── */
function AlertsTable({
  alerts,
  onOpenAlert,
  onMarkAlertRead,
}: {
  alerts: Alert[];
  onOpenAlert?: (a: Alert) => void;
  onMarkAlertRead?: (id: string) => void;
}) {
  const sorted = [...alerts]
    .sort((a, b) => {
      if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
      const priority = { critical: 0, warning: 1, info: 2 };
      return (
        (priority[a.type as keyof typeof priority] ?? 2) -
        (priority[b.type as keyof typeof priority] ?? 2)
      );
    })
    .slice(0, 8);

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5">
      <div className="mb-4">
        <SectionHeader
          color="bg-amber-500"
          title="Recent Alerts"
          count={alerts.filter((a) => !a.is_read).length}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <ColHeader>Alert</ColHeader>
              <ColHeader>Type</ColHeader>
              <ColHeader>Source</ColHeader>
              <ColHeader className="text-right">Action</ColHeader>
            </tr>
          </thead>
          <tbody>
            {sorted.map((alert) => (
              <tr
                key={alert.id}
                className={`border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-white/[0.02] transition-colors ${
                  alert.is_read ? "opacity-50" : ""
                }`}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {!alert.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse-soft" />
                    )}
                    <p className="text-sm text-foreground leading-tight">
                      {alert.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 pl-3.5">
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge
                    label={alert.type}
                    variant={
                      alert.type === "critical"
                        ? "red"
                        : alert.type === "warning"
                          ? "yellow"
                          : "blue"
                    }
                  />
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-muted-foreground capitalize">
                    {alert.source}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <ActionBtn
                      label="Open"
                      variant="blue"
                      onClick={() => onOpenAlert?.(alert)}
                    />
                    {!alert.is_read && (
                      <ActionBtn
                        label="Read"
                        variant="gray"
                        onClick={() => onMarkAlertRead?.(alert.id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No alerts
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Permits Table ─── */
function PermitsTable({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject?: (p: Project) => void;
}) {
  const withPending = projects
    .filter(
      (p) => p.total_permits > 0 && p.approved_permits < p.total_permits
    )
    .sort((a, b) => {
      const aRatio = a.approved_permits / a.total_permits;
      const bRatio = b.approved_permits / b.total_permits;
      return aRatio - bRatio;
    })
    .slice(0, 6);

  if (withPending.length === 0) return null;

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5">
      <div className="mb-4">
        <SectionHeader
          color="bg-violet-500"
          title="Permits Pending"
          count={withPending.reduce(
            (s, p) => s + (p.total_permits - p.approved_permits),
            0
          )}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <ColHeader>Project</ColHeader>
              <ColHeader className="text-center">Approved</ColHeader>
              <ColHeader className="text-center">Total</ColHeader>
              <ColHeader>Status</ColHeader>
              <ColHeader className="text-right">Action</ColHeader>
            </tr>
          </thead>
          <tbody>
            {withPending.map((p) => {
              const ratio = p.approved_permits / p.total_permits;
              const statusVariant: "green" | "yellow" | "orange" | "red" =
                ratio >= 0.8
                  ? "green"
                  : ratio >= 0.5
                    ? "yellow"
                    : ratio > 0
                      ? "orange"
                      : "red";
              const statusLabel =
                ratio >= 0.8
                  ? "MOSTLY DONE"
                  : ratio >= 0.5
                    ? "IN PROGRESS"
                    : ratio > 0
                      ? "PENDING"
                      : "NOT STARTED";

              return (
                <tr
                  key={p.id}
                  className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">
                      {p.address.split(",")[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {getPhaseLabel(p.phase)}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-center text-sm text-emerald-400 font-semibold">
                    {p.approved_permits}
                  </td>
                  <td className="py-3 pr-4 text-center text-sm text-foreground">
                    {p.total_permits}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      label={statusLabel}
                      variant={statusVariant}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <ActionBtn
                      label="View"
                      variant="gray"
                      onClick={() => onOpenProject?.(p)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
interface OverviewTablesProps {
  projects: Project[];
  alerts: Alert[];
  onOpenProject?: (p: Project) => void;
  onOpenAlert?: (a: Alert) => void;
  onMarkAlertRead?: (id: string) => void;
}

export function OverviewTables({
  projects,
  alerts,
  onOpenProject,
  onOpenAlert,
  onMarkAlertRead,
}: OverviewTablesProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Row 1: Projects At Risk + Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProjectsAtRiskTable
          projects={projects}
          onOpenProject={onOpenProject}
        />
        <ViolationsTable
          projects={projects}
          onOpenProject={onOpenProject}
        />
      </div>

      {/* Row 2: Budget + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetOverviewTable
          projects={projects}
          onOpenProject={onOpenProject}
        />
        <AlertsTable
          alerts={alerts}
          onOpenAlert={onOpenAlert}
          onMarkAlertRead={onMarkAlertRead}
        />
      </div>

      {/* Row 3: Permits */}
      <PermitsTable projects={projects} onOpenProject={onOpenProject} />
    </div>
  );
}

export { getProjectStatus, StatusBadge, ActionBtn, ColHeader, SectionHeader };
