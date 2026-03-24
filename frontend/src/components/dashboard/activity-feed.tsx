"use client";

import React, { useState } from "react";
import { ActivityLogEntry } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { SectionHeader } from "./overview-tables";
import {
  CheckSquare,
  FileUp,
  MessageCircle,
  Zap,
} from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityLogEntry[];
}

function SourceIcon({ source }: { source: string }) {
  const base = "h-3.5 w-3.5";
  switch (source) {
    case "clickup":
      return <CheckSquare className={`${base} text-violet-400`} />;
    case "onedrive":
      return <FileUp className={`${base} text-blue-400`} />;
    case "whatsapp":
      return <MessageCircle className={`${base} text-emerald-400`} />;
    default:
      return <Zap className={`${base} text-slate-400`} />;
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? activities
      : activities.filter((a) => a.source === activeTab);

  const tabs = [
    { key: "all", label: "All", count: activities.length },
    { key: "clickup", label: "Tasks", count: activities.filter((a) => a.source === "clickup").length },
    { key: "onedrive", label: "Files", count: activities.filter((a) => a.source === "onedrive").length },
    { key: "whatsapp", label: "Messages", count: activities.filter((a) => a.source === "whatsapp").length },
  ];

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-5 animate-slide-up">
      <SectionHeader color="bg-cyan-500" title="Recent Activity" count={activities.length} />

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-white/[0.03] rounded-lg p-1 border border-[hsl(var(--border))]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-[11px] font-medium py-1.5 px-3 rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab.label}
            <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="max-h-72 overflow-y-auto pr-1 space-y-0">
        {filtered.length > 0 ? (
          filtered.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 py-2.5 border-b border-[hsl(var(--border))]/50 last:border-0"
            >
              <div className="mt-0.5 p-1.5 rounded-md bg-white/[0.03] flex-shrink-0">
                <SourceIcon source={activity.source} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">
                  {activity.action}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.user_name && (
                    <span className="text-[11px] font-medium text-foreground/60">
                      {activity.user_name}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No activity to show</p>
          </div>
        )}
      </div>
    </div>
  );
}
