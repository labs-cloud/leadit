"use client";

import React, { useState } from "react";
import { Project, ProjectPhase } from "@/lib/types";
import { getPhaseLabel } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SectionHeader } from "./overview-tables";

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
  planning: "#64748B",
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
    : activeProjects.slice(0, 12);

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader
          color="bg-violet-500"
          title="Construction Timeline"
          count={activeProjects.length}
        />
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

      <div className="space-y-1">
        {displayProjects.map((project) => {
          const phaseIndex = PHASE_ORDER.indexOf(project.phase);
          const hasOverdue = project.overdue_tasks > 0;

          return (
            <div
              key={project.id}
              className="flex items-center gap-3 group py-0.5 hover:bg-white/[0.02] rounded-md px-1 -mx-1 transition-colors"
            >
              <div className="w-44 flex-shrink-0 text-[12px] truncate text-right pr-2 text-muted-foreground group-hover:text-foreground transition-colors">
                {project.address.split(",")[0]}
              </div>

              <div className="flex-1 h-7 bg-white/[0.03] rounded-md relative overflow-hidden">
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
                        opacity: i === phaseIndex ? 0.9 : 0.4,
                      }}
                    />
                  );
                })}

                {hasOverdue && (
                  <div
                    className="absolute top-0 right-0 bottom-0 w-full"
                    style={{
                      left: `${((phaseIndex + 1) / (PHASE_ORDER.length - 1)) * 100}%`,
                      background:
                        "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(239,68,68,0.06) 3px, rgba(239,68,68,0.06) 6px)",
                    }}
                  />
                )}

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                    {getPhaseLabel(project.phase)}
                  </span>
                </div>
              </div>

              <div className="w-20 flex-shrink-0 text-[11px] font-medium">
                {hasOverdue ? (
                  <span className="text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {project.overdue_tasks} late
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    On track
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeProjects.length > 12 && (
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
                <ChevronDown className="h-3.5 w-3.5" /> Show all{" "}
                {activeProjects.length} projects
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
