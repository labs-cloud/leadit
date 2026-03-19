"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PortfolioHealth } from "@/components/dashboard/portfolio-health";
import { AlertsSidebar } from "@/components/dashboard/alerts-sidebar";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { ConstructionTimeline } from "@/components/dashboard/construction-timeline";
import { TeamWorkload } from "@/components/dashboard/team-workload";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { api } from "@/lib/api";
import type {
  Project,
  Alert,
  ActivityLogEntry,
  TeamMember,
  DashboardSummary,
  ProjectPhase,
} from "@/lib/types";
import {
  Building2,
  RefreshCw,
  AlertCircle,
  Loader2,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";

function computeLocalSummary(
  projects: Project[],
  alerts: Alert[]
): DashboardSummary {
  const projectsByPhase: Record<ProjectPhase, number> = {
    planning: 0,
    demo: 0,
    foundation: 0,
    structure: 0,
    interior: 0,
    complete: 0,
  };

  let totalHealth = 0;
  let totalOverdue = 0;
  let totalViolations = 0;
  let totalBudget = 0;
  let totalSpent = 0;

  for (const p of projects) {
    projectsByPhase[p.phase]++;
    totalHealth += p.health_score;
    totalOverdue += p.overdue_tasks;
    totalViolations += p.open_violations;
    totalBudget += p.budget_total;
    totalSpent += p.budget_spent;
  }

  return {
    total_projects: projects.length,
    projects_by_phase: projectsByPhase,
    overall_health_score:
      projects.length > 0 ? Math.round(totalHealth / projects.length) : 0,
    total_overdue_tasks: totalOverdue,
    total_open_violations: totalViolations,
    total_budget: totalBudget,
    total_spent: totalSpent,
    unread_alerts: alerts.filter((a) => !a.is_read).length,
  };
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    setError(null);

    try {
      const [projectsData, alertsData, activityData, teamData] =
        await Promise.all([
          api.getProjects(),
          api.getAlerts(),
          api.getActivity(),
          api.getTeamWorkload(),
        ]);

      setProjects(projectsData);
      setAlerts(alertsData);
      setActivity(activityData);
      setTeamMembers(teamData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleMarkAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
  };

  const summary = computeLocalSummary(projects, alerts);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg shadow-blue-500/25">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Lead It Builders
          </h2>
          <div className="flex items-center justify-center gap-2 text-blue-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Loading dashboard from ClickUp...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md animate-fade-in">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchData();
            }}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-400 text-sm font-medium transition-colors shadow-lg shadow-blue-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 sticky top-0 z-50 shadow-lg shadow-black/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-2 shadow-lg shadow-blue-500/25">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Lead It Builders
                </h1>
                <p className="text-[11px] text-blue-300/80 font-medium">
                  Executive Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection status */}
              <div className="hidden sm:flex items-center gap-1.5">
                {error ? (
                  <WifiOff className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <span
                  className={`text-[11px] font-medium ${error ? "text-red-400" : "text-emerald-400"}`}
                >
                  {error ? "Offline" : "Live"}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-white/10" />

              {/* Last updated */}
              {lastRefresh && (
                <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[11px]">
                    {lastRefresh.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 text-slate-400 group-hover:text-white transition-colors ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Module 1: Portfolio Health */}
            <div className="animate-slide-up">
              <PortfolioHealth summary={summary} />
            </div>

            {/* Module 4: Construction Timeline */}
            <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
              <ConstructionTimeline projects={projects} />
            </div>

            {/* Module 3: Project Cards Grid */}
            <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Active Projects</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {projects.length} total across all phases
                  </p>
                </div>
              </div>
              <ProjectGrid projects={projects} />
            </div>

            {/* Module 5: Team Workload */}
            {teamMembers.length > 0 && (
              <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
                <TeamWorkload members={teamMembers} />
              </div>
            )}

            {/* Module 6: Financial Summary */}
            <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <FinancialSummary projects={projects} />
            </div>

            {/* Module 7: Activity Feed */}
            <div className="animate-slide-up" style={{ animationDelay: "250ms" }}>
              <ActivityFeed activities={activity} />
            </div>
          </div>

          {/* Right Sidebar - Module 2: Alerts */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-[80px]">
              <AlertsSidebar
                alerts={alerts}
                onMarkRead={handleMarkAlertRead}
              />
            </div>
          </div>
        </div>

        {/* Mobile Alerts */}
        <div className="lg:hidden mt-6">
          <AlertsSidebar alerts={alerts} onMarkRead={handleMarkAlertRead} />
        </div>
      </main>
    </div>
  );
}
