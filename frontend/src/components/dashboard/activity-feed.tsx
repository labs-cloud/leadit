"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivityLogEntry } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  CheckSquare,
  FileUp,
  MessageCircle,
  Zap,
} from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityLogEntry[];
}

function SourceIcon({ source }: { source: string }) {
  switch (source) {
    case "clickup":
      return (
        <div className="p-1.5 rounded-lg bg-purple-50">
          <CheckSquare className="h-3 w-3 text-purple-500" />
        </div>
      );
    case "onedrive":
      return (
        <div className="p-1.5 rounded-lg bg-blue-50">
          <FileUp className="h-3 w-3 text-blue-500" />
        </div>
      );
    case "whatsapp":
      return (
        <div className="p-1.5 rounded-lg bg-green-50">
          <MessageCircle className="h-3 w-3 text-green-500" />
        </div>
      );
    default:
      return (
        <div className="p-1.5 rounded-lg bg-slate-50">
          <Zap className="h-3 w-3 text-slate-500" />
        </div>
      );
  }
}

function ActivityItem({ activity }: { activity: ActivityLogEntry }) {
  return (
    <div className="flex gap-3 py-2.5 group">
      {/* Timeline line + icon */}
      <div className="relative flex flex-col items-center">
        <SourceIcon source={activity.source} />
        <div className="flex-1 w-px bg-slate-100 mt-1 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-2">
        <p className="text-sm leading-snug">{activity.action}</p>
        <div className="flex items-center gap-2 mt-1">
          {activity.user_name && (
            <span className="text-[11px] font-semibold text-foreground/70">
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
  );
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? activities
      : activities.filter((a) => a.source === activeTab);

  const sourceCounts = {
    clickup: activities.filter((a) => a.source === "clickup").length,
    onedrive: activities.filter((a) => a.source === "onedrive").length,
    whatsapp: activities.filter((a) => a.source === "whatsapp").length,
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
            <Activity className="h-4 w-4" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-slate-100/80 p-1 h-auto">
            <TabsTrigger
              value="all"
              className="flex-1 text-[11px] py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              All ({activities.length})
            </TabsTrigger>
            <TabsTrigger
              value="clickup"
              className="flex-1 text-[11px] py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Tasks ({sourceCounts.clickup})
            </TabsTrigger>
            <TabsTrigger
              value="onedrive"
              className="flex-1 text-[11px] py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Files ({sourceCounts.onedrive})
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="flex-1 text-[11px] py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Messages ({sourceCounts.whatsapp})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <ScrollArea className="h-72">
              <div className="pr-4 pt-2">
                {filtered.length > 0 ? (
                  filtered.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">
                      No activity to show
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
