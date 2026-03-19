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
    return (
      <div className="p-1.5 rounded-lg bg-purple-50">
        <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
      </div>
    );
  }
  switch (type) {
    case "critical":
      return (
        <div className="p-1.5 rounded-lg bg-red-50">
          <AlertCircle className="h-3.5 w-3.5 text-red-600" />
        </div>
      );
    case "warning":
      return (
        <div className="p-1.5 rounded-lg bg-amber-50">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
        </div>
      );
    default:
      return (
        <div className="p-1.5 rounded-lg bg-blue-50">
          <Info className="h-3.5 w-3.5 text-blue-600" />
        </div>
      );
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
      className={`p-3 rounded-xl border-l-[3px] transition-all hover:shadow-sm ${getAlertColor(alert.type)} ${
        !alert.is_read ? "" : "opacity-60"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <AlertIcon type={alert.type} source={alert.source} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-sm leading-tight ${!alert.is_read ? "font-semibold" : ""}`}>
              {alert.title}
            </p>
            {!alert.is_read && (
              <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500 animate-pulse-soft" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(alert.created_at), {
                addSuffix: true,
              })}
            </p>
            <span className="text-muted-foreground/30">|</span>
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 capitalize font-normal">
              {alert.source}
            </Badge>
          </div>

          {expanded && alert.description && (
            <p className="text-xs mt-2 leading-relaxed text-muted-foreground bg-white/50 rounded-lg p-2">
              {alert.description}
            </p>
          )}

          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-0.5" /> Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-0.5" /> Details
                </>
              )}
            </Button>

            {alert.link && (
              <a
                href={alert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline font-medium"
              >
                <ExternalLink className="h-3 w-3" /> Open
              </a>
            )}

            {!alert.is_read && onMarkRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] ml-auto text-muted-foreground hover:text-emerald-600"
                onClick={() => onMarkRead(alert.id)}
              >
                <Check className="h-3 w-3 mr-0.5" /> Done
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
  const criticalCount = alerts.filter(
    (a) => a.type === "critical" && !a.is_read
  ).length;

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    const priority = { critical: 0, warning: 1, info: 2 };
    const pDiff =
      (priority[a.type as keyof typeof priority] ?? 2) -
      (priority[b.type as keyof typeof priority] ?? 2);
    if (pDiff !== 0) return pDiff;
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  return (
    <Card className="h-full border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <span>Alerts</span>
          </div>
          <div className="flex gap-1.5">
            {criticalCount > 0 && (
              <Badge
                variant="destructive"
                className="text-[10px] animate-pulse-soft"
              >
                {criticalCount} critical
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-220px)] px-4 pb-4">
          <div className="space-y-2">
            {sortedAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onMarkRead={onMarkRead}
              />
            ))}
            {sortedAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No alerts</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
