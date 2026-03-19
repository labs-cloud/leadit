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
import { Building2, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

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

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading dashboard from ClickUp...
          </p>
        </div>
      </div>
    );
  }

  // Error state (with no data)
  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchData();
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Lead It Builders</h1>
                <p className="text-xs text-muted-foreground">
                  Executive Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {error && (
                <span className="text-xs text-red-500 hidden sm:inline">
                  Refresh failed
                </span>
              )}
              {lastRefresh && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Updated:{" "}
                  {lastRefresh.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              <button
                onClick={handleRefresh}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
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
            <PortfolioHealth summary={summary} />

            {/* Module 4: Construction Timeline */}
            <ConstructionTimeline projects={projects} />

            {/* Module 3: Project Cards Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
              <ProjectGrid projects={projects} />
            </div>

            {/* Module 5: Team Workload */}
            {teamMembers.length > 0 && (
              <TeamWorkload members={teamMembers} />
            )}

            {/* Module 6: Financial Summary */}
            <FinancialSummary projects={projects} />

            {/* Module 7: Activity Feed */}
            <ActivityFeed activities={activity} />
          </div>

          {/* Right Sidebar - Module 2: Alerts */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-[73px]">
              <AlertsSidebar
                alerts={alerts}
                onMarkRead={handleMarkAlertRead}
              />
            </div>
          </div>
        </div>

        {/* Mobile Alerts (shown below on smaller screens) */}
        <div className="lg:hidden mt-6">
          <AlertsSidebar alerts={alerts} onMarkRead={handleMarkAlertRead} />
        </div>
      </main>
    </div>
  );
}
