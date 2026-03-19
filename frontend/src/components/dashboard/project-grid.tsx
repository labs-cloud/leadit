"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { Project, ProjectPhase, SortField, SortDirection, ProjectFilter } from "@/lib/types";
import { getPhaseLabel } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  X,
  LayoutGrid,
  List,
} from "lucide-react";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [sortField, setSortField] = useState<SortField>("health_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState<ProjectFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = [...projects];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.address.toLowerCase().includes(q));
    }

    // Filter by phase
    if (filter.phase) {
      result = result.filter((p) => p.phase === filter.phase);
    }

    // Filter by violations
    if (filter.hasViolations) {
      result = result.filter((p) => p.open_violations > 0);
    }

    // Filter by overdue
    if (filter.hasOverdueTasks) {
      result = result.filter((p) => p.overdue_tasks > 0);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.address.localeCompare(b.address);
          break;
        case "phase":
          const phaseOrder: Record<string, number> = {
            planning: 0,
            demo: 1,
            foundation: 2,
            structure: 3,
            interior: 4,
            complete: 5,
          };
          cmp = (phaseOrder[a.phase] ?? 0) - (phaseOrder[b.phase] ?? 0);
          break;
        case "health_score":
          cmp = a.health_score - b.health_score;
          break;
        case "last_activity":
          cmp =
            new Date(a.last_activity_at || 0).getTime() -
            new Date(b.last_activity_at || 0).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [projects, sortField, sortDirection, filter, searchQuery]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "health_score" ? "asc" : "desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const phases: ProjectPhase[] = [
    "planning",
    "demo",
    "foundation",
    "structure",
    "interior",
    "complete",
  ];

  const activeFilterCount = [
    filter.phase,
    filter.hasViolations,
    filter.hasOverdueTasks,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-8 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-1">
          {(
            [
              ["name", "Name"],
              ["phase", "Phase"],
              ["health_score", "Health"],
              ["last_activity", "Activity"],
            ] as [SortField, string][]
          ).map(([field, label]) => (
            <Button
              key={field}
              variant={sortField === field ? "secondary" : "ghost"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => toggleSort(field)}
            >
              {label} <SortIcon field={field} />
            </Button>
          ))}
        </div>

        {/* Filter Toggle */}
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          className="h-9"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-lg bg-muted/50 border">
          {/* Phase filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Phase:</span>
            {phases.map((phase) => (
              <Button
                key={phase}
                variant={filter.phase === phase ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  setFilter((f) => ({
                    ...f,
                    phase: f.phase === phase ? undefined : phase,
                  }))
                }
              >
                {getPhaseLabel(phase)}
              </Button>
            ))}
          </div>

          <div className="w-px h-7 bg-border self-center" />

          <Button
            variant={filter.hasViolations ? "destructive" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              setFilter((f) => ({ ...f, hasViolations: !f.hasViolations }))
            }
          >
            Has Violations
          </Button>

          <Button
            variant={filter.hasOverdueTasks ? "destructive" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              setFilter((f) => ({ ...f, hasOverdueTasks: !f.hasOverdueTasks }))
            }
          >
            Has Overdue Tasks
          </Button>

          {activeFilterCount > 0 && (
            <>
              <div className="w-px h-7 bg-border self-center" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilter({})}
              >
                <X className="h-3 w-3 mr-1" /> Clear All
              </Button>
            </>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-3">
        Showing {filteredAndSorted.length} of {projects.length} projects
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAndSorted.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No projects match your filters.</p>
          <Button
            variant="link"
            className="mt-2"
            onClick={() => {
              setFilter({});
              setSearchQuery("");
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
