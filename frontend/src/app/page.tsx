"use client";

import React, { useState, useEffect } from "react";
import { PortfolioHealth } from "@/components/dashboard/portfolio-health";
import { AlertsSidebar } from "@/components/dashboard/alerts-sidebar";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { ConstructionTimeline } from "@/components/dashboard/construction-timeline";
import { TeamWorkload } from "@/components/dashboard/team-workload";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  mockProjects,
  mockAlerts,
  mockActivity,
  mockTeamMembers,
  getMockSummary,
} from "@/lib/mock-data";
import type { Alert, DashboardSummary } from "@/lib/types";
import { Building2, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [summary, setSummary] = useState<DashboardSummary>(getMockSummary());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleMarkAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In production, this would call the API
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Last updated:{" "}
                {lastRefresh.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
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
            <ConstructionTimeline projects={mockProjects} />

            {/* Module 3: Project Cards Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
              <ProjectGrid projects={mockProjects} />
            </div>

            {/* Module 5: Team Workload */}
            <TeamWorkload members={mockTeamMembers} />

            {/* Module 6: Financial Summary */}
            <FinancialSummary projects={mockProjects} />

            {/* Module 7: Activity Feed */}
            <ActivityFeed activities={mockActivity} />
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
