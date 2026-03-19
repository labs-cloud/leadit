import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    planning: "bg-gray-500",
    demo: "bg-yellow-500",
    foundation: "bg-orange-500",
    structure: "bg-orange-600",
    interior: "bg-blue-500",
    complete: "bg-green-500",
  };
  return colors[phase] || "bg-gray-400";
}

export function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    planning: "Planning",
    demo: "Demo/Site Work",
    foundation: "Foundation/Structure",
    structure: "Structure",
    interior: "Interior/Finishes",
    complete: "Completed",
  };
  return labels[phase] || phase;
}

export function getAlertColor(type: string): string {
  const colors: Record<string, string> = {
    critical: "border-red-500 bg-red-50 text-red-900",
    warning: "border-yellow-500 bg-yellow-50 text-yellow-900",
    info: "border-blue-500 bg-blue-50 text-blue-900",
  };
  return colors[type] || "border-gray-500 bg-gray-50";
}

export function calculateHealthScore(project: {
  overdue_tasks: number;
  total_tasks: number;
  open_violations: number;
  total_permits: number;
  approved_permits: number;
  budget_total: number;
  budget_spent: number;
}): number {
  let score = 100;

  // Overdue tasks penalty (40% weight)
  if (project.total_tasks > 0) {
    const overdueRatio = project.overdue_tasks / project.total_tasks;
    score -= overdueRatio * 40;
  }

  // Violations penalty (30% weight)
  score -= Math.min(project.open_violations * 10, 30);

  // Missing permits penalty (20% weight)
  if (project.total_permits > 0) {
    const missingRatio =
      (project.total_permits - project.approved_permits) /
      project.total_permits;
    score -= missingRatio * 20;
  }

  // Budget overrun penalty (10% weight)
  if (project.budget_total > 0 && project.budget_spent > project.budget_total) {
    const overrunRatio =
      (project.budget_spent - project.budget_total) / project.budget_total;
    score -= Math.min(overrunRatio * 10, 10);
  }

  return Math.max(0, Math.round(score));
}
