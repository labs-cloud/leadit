"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/lib/types";
import { getAlertColor } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  MessageCircle,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AlertsSidebarProps {
  alerts: Alert[];
  onMarkRead?: (id: string) => void;
}

function AlertIcon({ type, source }: { type: string; source: string }) {
  if (source === "whatsapp") {
    return <MessageCircle className="h-4 w-4 text-purple-600" />;
  }
  switch (type) {
    case "critical":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default:
      return <Info className="h-4 w-4 text-blue-600" />;
  }
}

function AlertItem({
  alert,
  onMarkRead,
}: {
  alert: Alert;
  onMarkRead?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)} ${
        !alert.is_read ? "font-medium" : "opacity-75"
      }`}
    >
      <div className="flex items-start gap-2">
        <AlertIcon type={alert.type} source={alert.source} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm leading-tight">{alert.title}</p>
            {!alert.is_read && (
              <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-600" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
            {" · "}
            <span className="capitalize">{alert.source}</span>
          </p>

          {expanded && alert.description && (
            <p className="text-xs mt-2 leading-relaxed">{alert.description}</p>
          )}

          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" /> Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" /> More
                </>
              )}
            </Button>

            {alert.link && (
              <a
                href={alert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Open
              </a>
            )}

            {!alert.is_read && onMarkRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs ml-auto"
                onClick={() => onMarkRead(alert.id)}
              >
                <Check className="h-3 w-3 mr-1" /> Read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertsSidebar({ alerts, onMarkRead }: AlertsSidebarProps) {
  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const criticalCount = alerts.filter((a) => a.type === "critical" && !a.is_read).length;

  const sortedAlerts = [...alerts].sort((a, b) => {
    // Unread first
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    // Critical first
    const priority = { critical: 0, warning: 1, info: 2 };
    const pDiff =
      (priority[a.type as keyof typeof priority] ?? 2) -
      (priority[b.type as keyof typeof priority] ?? 2);
    if (pDiff !== 0) return pDiff;
    // Newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts
          </div>
          <div className="flex gap-1.5">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} critical
              </Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-220px)] px-4 pb-4">
          <div className="space-y-2">
            {sortedAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onMarkRead={onMarkRead} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
