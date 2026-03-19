"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivityLogEntry } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  CheckSquare,
  FileUp,
  MessageCircle,
  FileText,
  Zap,
} from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityLogEntry[];
}

function SourceIcon({ source }: { source: string }) {
  switch (source) {
    case "clickup":
      return <CheckSquare className="h-3.5 w-3.5 text-purple-500" />;
    case "onedrive":
      return <FileUp className="h-3.5 w-3.5 text-blue-500" />;
    case "whatsapp":
      return <MessageCircle className="h-3.5 w-3.5 text-green-500" />;
    default:
      return <Zap className="h-3.5 w-3.5 text-gray-500" />;
  }
}

function ActivityItem({ activity }: { activity: ActivityLogEntry }) {
  return (
    <div className="flex gap-3 py-2 border-b last:border-0">
      <div className="mt-0.5">
        <SourceIcon source={activity.source} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight">{activity.action}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {activity.user_name && (
            <span className="text-xs font-medium text-muted-foreground">
              {activity.user_name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1 text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="clickup" className="flex-1 text-xs">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="onedrive" className="flex-1 text-xs">
              Files
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex-1 text-xs">
              Messages
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <ScrollArea className="h-64">
              <div className="pr-4">
                {filtered.length > 0 ? (
                  filtered.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity to show.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
