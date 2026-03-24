"use client";

import React, { useState, useMemo } from "react";
import { Project } from "@/lib/types";
import { getPhaseLabel } from "@/lib/utils";
import { getProjectStatus, StatusBadge, ColHeader, SectionHeader } from "./overview-tables";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

interface ProjectTableProps {
  projects: Project[];
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-fuchsia-600",
];

export function ProjectTable({ projects }: ProjectTableProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter((p) => p.address.toLowerCase().includes(q));
  }, [projects, search]);

  const displayProjects = expanded ? filtered : filtered.slice(0, 10);

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader
          color="bg-blue-500"
          title="Project Status Overview"
          count={projects.length}
        />
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-7 w-56 rounded-md bg-white/5 border border-[hsl(var(--border))] text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          {filtered.length > 10 && (
            <span
              className="text-[11px] text-blue-400 cursor-pointer hover:underline"
              onClick={() => setExpanded((e) => !e)}
            >
              View all {filtered.length} projects &rarr;
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <ColHeader>Project</ColHeader>
              <ColHeader>Status</ColHeader>
              <ColHeader>Phase</ColHeader>
              <ColHeader className="text-center">Tasks</ColHeader>
              <ColHeader className="text-center">Permits</ColHeader>
              <ColHeader className="text-center">Violations</ColHeader>
              <ColHeader className="text-right w-28">Budget %</ColHeader>
              <ColHeader className="text-right">Action</ColHeader>
            </tr>
          </thead>
          <tbody>
            {displayProjects.map((project, index) => {
              const status = getProjectStatus(project);
              const budgetPct =
                project.budget_total > 0
                  ? Math.round((project.budget_spent / project.budget_total) * 100)
                  : 0;
              const isOver = budgetPct > 100;
              const colorIdx = index % AVATAR_COLORS.length;

              return (
                <tr
                  key={project.id}
                  className="border-b border-[hsl(var(--border))]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Project */}
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">
                      {project.address.split(",")[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {project.address.split(",").slice(1).join(",").trim() || getPhaseLabel(project.phase)}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3 pr-4">
                    <StatusBadge label={status.label} variant={status.variant} />
                  </td>

                  {/* Phase */}
                  <td className="py-3 pr-4 text-sm text-muted-foreground">
                    {getPhaseLabel(project.phase)}
                  </td>

                  {/* Tasks */}
                  <td className="py-3 pr-4 text-center">
                    <span className="text-sm text-foreground">
                      {project.completed_tasks}/{project.total_tasks}
                    </span>
                    {project.overdue_tasks > 0 && (
                      <span className="text-[10px] text-red-400 block">
                        {project.overdue_tasks} overdue
                      </span>
                    )}
                  </td>

                  {/* Permits */}
                  <td className="py-3 pr-4 text-center text-sm">
                    <span className="text-foreground">
                      {project.approved_permits}/{project.total_permits}
                    </span>
                  </td>

                  {/* Violations */}
                  <td className="py-3 pr-4 text-center">
                    <span
                      className={`text-sm font-semibold ${
                        project.open_violations > 0 ? "text-red-400" : "text-muted-foreground"
                      }`}
                    >
                      {project.open_violations}
                    </span>
                  </td>

                  {/* Budget % with bar */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver
                              ? "bg-red-500"
                              : budgetPct > 80
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(budgetPct, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          isOver ? "text-red-400" : "text-muted-foreground"
                        }`}
                      >
                        {budgetPct}%
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 text-right">
                    <button className="px-2.5 py-1 rounded text-[11px] font-medium bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show more/less */}
      {filtered.length > 10 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Show all {filtered.length} projects
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
