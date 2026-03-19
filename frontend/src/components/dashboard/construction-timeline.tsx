"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project, ProjectPhase } from "@/lib/types";
import { getPhaseLabel } from "@/lib/utils";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

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
  planning: "#9CA3AF",
  demo: "#EAB308",
  foundation: "#F97316",
  structure: "#EA580C",
  interior: "#3B82F6",
  complete: "#22C55E",
};

export function ConstructionTimeline({ projects }: ConstructionTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  // Show only non-completed projects for timeline
  const activeProjects = projects
    .filter((p) => p.phase !== "complete")
    .sort((a, b) => {
      const ai = PHASE_ORDER.indexOf(a.phase);
      const bi = PHASE_ORDER.indexOf(b.phase);
      return bi - ai; // furthest along first
    });

  const displayProjects = expanded ? activeProjects : activeProjects.slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Construction Timeline
          </CardTitle>
          <div className="flex gap-2">
            {PHASE_ORDER.filter((p) => p !== "complete").map((phase) => (
              <div key={phase} className="flex items-center gap-1 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: PHASE_COLORS[phase] }}
                />
                <span className="hidden sm:inline">{getPhaseLabel(phase)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {displayProjects.map((project) => {
            const phaseIndex = PHASE_ORDER.indexOf(project.phase);
            const progressPercent = ((phaseIndex + 1) / (PHASE_ORDER.length - 1)) * 100;
            const hasOverdue = project.overdue_tasks > 0;

            return (
              <div key={project.id} className="flex items-center gap-3 group">
                {/* Project Name */}
                <div className="w-48 flex-shrink-0 text-xs truncate text-right pr-2">
                  {project.address.split(",")[0]}
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 h-6 bg-muted rounded-md relative overflow-hidden">
                  {/* Phase blocks */}
                  {PHASE_ORDER.slice(0, phaseIndex + 1).map((phase, i) => {
                    const segmentWidth = 100 / (PHASE_ORDER.length - 1);
                    return (
                      <div
                        key={phase}
                        className="absolute top-0 bottom-0 transition-all"
                        style={{
                          left: `${i * segmentWidth}%`,
                          width: `${segmentWidth}%`,
                          backgroundColor: PHASE_COLORS[phase],
                          opacity: i === phaseIndex ? 1 : 0.6,
                        }}
                      />
                    );
                  })}

                  {/* Delay indicator */}
                  {hasOverdue && (
                    <div
                      className="absolute top-0 bottom-0 w-1"
                      style={{
                        left: `${progressPercent}%`,
                        background:
                          "repeating-linear-gradient(45deg, transparent, transparent 2px, #EF4444 2px, #EF4444 4px)",
                      }}
                    />
                  )}

                  {/* Current phase label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-white drop-shadow-sm">
                      {getPhaseLabel(project.phase)}
                    </span>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="w-16 flex-shrink-0 text-xs">
                  {hasOverdue ? (
                    <span className="text-red-600 font-medium">
                      {project.overdue_tasks} late
                    </span>
                  ) : (
                    <span className="text-green-600">On track</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {activeProjects.length > 10 && (
          <div className="text-center mt-3">
            <Button
              variant="ghost"
              size="sm"
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
