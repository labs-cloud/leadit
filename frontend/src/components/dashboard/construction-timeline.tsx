"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project, ProjectPhase } from "@/lib/types";
import { getPhaseLabel } from "@/lib/utils";
import { Calendar, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface ConstructionTimelineProps {
  projects: Project[];
}

const PHASE_ORDER: ProjectPhase[] = [
  "planning",
  "demo",
  "foundation",
  "structure",
  "interior",
  "complete",
];

const PHASE_COLORS: Record<ProjectPhase, string> = {
  planning: "#94A3B8",
  demo: "#FACC15",
  foundation: "#FB923C",
  structure: "#F97316",
  interior: "#60A5FA",
  complete: "#34D399",
};

export function ConstructionTimeline({ projects }: ConstructionTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  const activeProjects = projects
    .filter((p) => p.phase !== "complete")
    .sort((a, b) => {
      const ai = PHASE_ORDER.indexOf(a.phase);
      const bi = PHASE_ORDER.indexOf(b.phase);
      return bi - ai;
    });

  const displayProjects = expanded
    ? activeProjects
    : activeProjects.slice(0, 10);

  const overdueCount = activeProjects.filter(
    (p) => p.overdue_tasks > 0
  ).length;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
                <Calendar className="h-4 w-4" />
              </div>
              Construction Timeline
            </CardTitle>
            {overdueCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <AlertCircle className="h-3 w-3" />
                {overdueCount} delayed
              </div>
            )}
          </div>
          <div className="hidden sm:flex gap-3">
            {PHASE_ORDER.filter((p) => p !== "complete").map((phase) => (
              <div key={phase} className="flex items-center gap-1.5 text-[11px]">
                <div
                  className="w-3 h-2 rounded-sm"
                  style={{ backgroundColor: PHASE_COLORS[phase] }}
                />
                <span className="text-muted-foreground">
                  {getPhaseLabel(phase)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {displayProjects.map((project) => {
            const phaseIndex = PHASE_ORDER.indexOf(project.phase);
            const hasOverdue = project.overdue_tasks > 0;

            return (
              <div
                key={project.id}
                className="flex items-center gap-3 group py-0.5 hover:bg-slate-50/50 rounded-lg px-1 -mx-1 transition-colors"
              >
                {/* Project Name */}
                <div className="w-44 flex-shrink-0 text-[12px] truncate text-right pr-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  {project.address.split(",")[0]}
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 h-7 bg-slate-100 rounded-lg relative overflow-hidden">
                  {PHASE_ORDER.slice(0, phaseIndex + 1).map((phase, i) => {
                    const segmentWidth = 100 / (PHASE_ORDER.length - 1);
                    return (
                      <div
                        key={phase}
                        className="absolute top-0 bottom-0 transition-all duration-500"
                        style={{
                          left: `${i * segmentWidth}%`,
                          width: `${segmentWidth}%`,
                          backgroundColor: PHASE_COLORS[phase],
                          opacity: i === phaseIndex ? 1 : 0.5,
                        }}
                      />
                    );
                  })}

                  {/* Overdue stripe */}
                  {hasOverdue && (
                    <div
                      className="absolute top-0 right-0 bottom-0 w-full"
                      style={{
                        left: `${((phaseIndex + 1) / (PHASE_ORDER.length - 1)) * 100}%`,
                        background:
                          "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(239,68,68,0.08) 3px, rgba(239,68,68,0.08) 6px)",
                      }}
                    />
                  )}

                  {/* Phase label overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                      {getPhaseLabel(project.phase)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="w-20 flex-shrink-0 text-[11px] font-medium">
                  {hasOverdue ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {project.overdue_tasks} late
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      On track
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {activeProjects.length > 10 && (
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" /> Show All{" "}
                  {activeProjects.length} Projects
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
