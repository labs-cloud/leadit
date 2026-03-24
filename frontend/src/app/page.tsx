"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { OverviewTables } from "@/components/dashboard/overview-tables";
import { ProjectTable } from "@/components/dashboard/project-table";
import { ConstructionTimeline } from "@/components/dashboard/construction-timeline";
import { TeamWorkload } from "@/components/dashboard/team-workload";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
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
  Search,
  Download,
  SlidersHorizontal,
} from "lucide-react";

const CLICKUP_WORKSPACE_URL = "https://app.clickup.com/9017603275";

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

function exportToCSV(projects: Project[]) {
  const headers = [
    "Project",
    "Phase",
    "Health Score",
    "Total Tasks",
    "Completed Tasks",
    "Overdue Tasks",
    "Open Violations",
    "Approved Permits",
    "Total Permits",
    "Budget Total",
    "Budget Spent",
    "Last Activity",
  ];
  const rows = projects.map((p) => [
    `"${p.address}"`,
    p.phase,
    p.health_score,
    p.total_tasks,
    p.completed_tasks,
    p.overdue_tasks,
    p.open_violations,
    p.approved_permits,
    p.total_permits,
    p.budget_total,
    p.budget_spent,
    p.last_activity_at || "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leadit-projects-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type Tab = "overview" | "projects" | "timeline" | "team" | "activity";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) setIsRefreshing(true);
      setError(null);

      try {
        const [projectsData, alertsData, activityData, teamData] =
          await Promise.all([
            api.getProjects(forceRefresh),
            api.getAlerts(forceRefresh),
            api.getActivity(forceRefresh),
            api.getTeamWorkload(forceRefresh),
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
    },
    []
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => fetchData(true);

  const handleMarkAlertRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
    );
  };

  const handleOpenProject = (project: Project) => {
    window.open(
      `${CLICKUP_WORKSPACE_URL}/v/li/${project.clickup_folder_id}`,
      "_blank"
    );
  };

  const handleOpenAlert = (alert: Alert) => {
    if (alert.link) {
      window.open(alert.link, "_blank");
    } else if (alert.project_id) {
      window.open(
        `${CLICKUP_WORKSPACE_URL}/v/li/${alert.project_id}`,
        "_blank"
      );
    }
    handleMarkAlertRead(alert.id);
  };

  const summary = computeLocalSummary(projects, alerts);

  const pendingPermits = projects.reduce(
    (s, p) => s + (p.total_permits - p.approved_permits),
    0
  );
  const projectsAtRisk = projects.filter(
    (p) =>
      p.phase !== "complete" &&
      (p.overdue_tasks > 0 || p.health_score < 60)
  ).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mx-auto mb-6 w-14 h-14">
            <div className="absolute inset-0 rounded-xl bg-blue-500/10 animate-ping" />
            <div className="relative rounded-xl bg-blue-600/20 border border-blue-500/20 p-3.5">
              <Building2 className="h-7 w-7 text-blue-400" />
            </div>
          </div>
          <h2 className="text-base font-semibold text-foreground mb-2">
            Lead It Builders
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Syncing with ClickUp...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md animate-fade-in">
          <div className="mx-auto mb-6 w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchData(true);
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "projects", label: "Projects", count: projects.length },
    { key: "timeline", label: "Timeline" },
    { key: "team", label: "Team", count: teamMembers.length },
    { key: "activity", label: "Activity", count: activity.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span>Dashboards</span>
              <span>/</span>
              <span className="text-foreground">Executive Overview</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`${CLICKUP_WORKSPACE_URL}/home`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-white/5 transition-colors"
                title="Open ClickUp"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </a>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
                IA
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Title bar */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 py-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Executive Overview
              </h1>
              <p className="text-[12px] text-muted-foreground mt-1">
                Isaac Adler
                {lastRefresh && (
                  <>
                    {" \u00B7 Last synced "}
                    {lastRefresh.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" at "}
                    {lastRefresh.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </>
                )}
                {error && (
                  <span className="text-red-400 ml-2">
                    {"\u00B7"} Sync failed
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(projects)}
                className="px-3.5 py-1.5 rounded-md bg-white/5 border border-[hsl(var(--border))] text-[12px] font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                title="Export projects to CSV"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3.5 py-1.5 rounded-md bg-blue-600 text-[12px] font-medium text-white hover:bg-blue-500 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Syncing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-5 sm:px-6 py-5 space-y-5">
        {/* KPI Cards */}
        <KPICards
          summary={summary}
          pendingPermits={pendingPermits}
          projectsAtRisk={projectsAtRisk}
        />

        {/* Tab Navigation */}
        <div className="border-b border-[hsl(var(--border))]">
          <nav className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "text-blue-400 border-blue-400"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-white/20"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1.5 text-[10px] opacity-50">
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            <OverviewTables
              projects={projects}
              alerts={alerts}
              onOpenProject={handleOpenProject}
              onOpenAlert={handleOpenAlert}
              onMarkAlertRead={handleMarkAlertRead}
            />
            <ProjectTable
              projects={projects}
              onOpenProject={handleOpenProject}
            />
          </>
        )}

        {activeTab === "projects" && (
          <ProjectTable
            projects={projects}
            onOpenProject={handleOpenProject}
          />
        )}

        {activeTab === "timeline" && (
          <ConstructionTimeline projects={projects} />
        )}

        {activeTab === "team" && teamMembers.length > 0 && (
          <TeamWorkload members={teamMembers} />
        )}

        {activeTab === "activity" && <ActivityFeed activities={activity} />}
      </main>
    </div>
  );
}
