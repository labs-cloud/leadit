"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

interface FinancialSummaryProps {
  projects: Project[];
}

export function FinancialSummary({ projects }: FinancialSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const totalBudget = projects.reduce((sum, p) => sum + p.budget_total, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.budget_spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const overBudgetProjects = projects
    .filter((p) => p.budget_spent > p.budget_total)
    .sort((a, b) => (b.budget_spent - b.budget_total) - (a.budget_spent - a.budget_total));

  const underBudgetProjects = projects
    .filter((p) => p.budget_spent <= p.budget_total && p.budget_total > 0)
    .sort((a, b) => {
      const aRatio = a.budget_spent / a.budget_total;
      const bRatio = b.budget_spent / b.budget_total;
      return bRatio - aRatio;
    });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overview */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-600 mb-1">Total Budget</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 border border-green-100">
            <p className="text-xs text-green-600 mb-1">Total Spent</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalSpent)}</p>
          </div>
          <div
            className={`p-3 rounded-lg ${
              totalRemaining >= 0
                ? "bg-gray-50 border border-gray-100"
                : "bg-red-50 border border-red-100"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                totalRemaining >= 0 ? "text-gray-600" : "text-red-600"
              }`}
            >
              {totalRemaining >= 0 ? "Remaining" : "Over Budget"}
            </p>
            <p
              className={`text-xl font-bold ${
                totalRemaining >= 0 ? "text-gray-700" : "text-red-700"
              }`}
            >
              {formatCurrency(Math.abs(totalRemaining))}
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Portfolio Budget Usage</span>
            <span className="font-medium">{overallPercent}%</span>
          </div>
          <Progress
            value={Math.min(overallPercent, 100)}
            indicatorClassName={
              overallPercent > 100
                ? "bg-red-500"
                : overallPercent > 90
                  ? "bg-orange-500"
                  : "bg-blue-500"
            }
          />
        </div>

        {expanded && (
          <>
            {/* Over budget projects */}
            {overBudgetProjects.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Over Budget ({overBudgetProjects.length})
                </h4>
                <div className="space-y-2">
                  {overBudgetProjects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded bg-red-50">
                      <span className="truncate flex-1">{p.address}</span>
                      <span className="text-red-600 font-medium ml-2">
                        +{formatCurrency(p.budget_spent - p.budget_total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top spending projects */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                Budget Usage by Project
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {underBudgetProjects.slice(0, 10).map((p) => {
                  const pct = p.budget_total > 0 ? Math.round((p.budget_spent / p.budget_total) * 100) : 0;
                  return (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <span className="w-40 truncate">{p.address.split(",")[0]}</span>
                      <div className="flex-1">
                        <Progress
                          value={pct}
                          className="h-1.5"
                          indicatorClassName={
                            pct > 90 ? "bg-orange-500" : pct > 75 ? "bg-yellow-500" : "bg-green-500"
                          }
                        />
                      </div>
                      <span className="w-12 text-right text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
