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
  Wallet,
  PiggyBank,
  Receipt,
} from "lucide-react";

interface FinancialSummaryProps {
  projects: Project[];
}

export function FinancialSummary({ projects }: FinancialSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const totalBudget = projects.reduce((sum, p) => sum + p.budget_total, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.budget_spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercent =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const overBudgetProjects = projects
    .filter((p) => p.budget_spent > p.budget_total)
    .sort(
      (a, b) =>
        b.budget_spent - b.budget_total - (a.budget_spent - a.budget_total)
    );

  const underBudgetProjects = projects
    .filter((p) => p.budget_spent <= p.budget_total && p.budget_total > 0)
    .sort((a, b) => {
      const aRatio = a.budget_spent / a.budget_total;
      const bRatio = b.budget_spent / b.budget_total;
      return bRatio - aRatio;
    });

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
              Financial Summary
            </CardTitle>
            {overBudgetProjects.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                {overBudgetProjects.length} over budget
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground"
          >
            {expanded ? (
              <>
                Less <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Details <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-blue-500" />
              <p className="text-[11px] font-medium text-blue-600">
                Total Budget
              </p>
            </div>
            <p className="text-xl font-bold text-blue-700">
              {formatCurrency(totalBudget)}
            </p>
            <p className="text-[11px] text-blue-500 mt-0.5">
              {projects.length} projects
            </p>
          </div>

          <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-emerald-500" />
              <p className="text-[11px] font-medium text-emerald-600">
                Total Spent
              </p>
            </div>
            <p className="text-xl font-bold text-emerald-700">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-[11px] text-emerald-500 mt-0.5">
              {overallPercent}% utilized
            </p>
          </div>

          <div
            className={`relative overflow-hidden p-4 rounded-xl border ${
              totalRemaining >= 0
                ? "bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-100"
                : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {totalRemaining >= 0 ? (
                <TrendingDown className="h-4 w-4 text-slate-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
              <p
                className={`text-[11px] font-medium ${
                  totalRemaining >= 0 ? "text-slate-600" : "text-red-600"
                }`}
              >
                {totalRemaining >= 0 ? "Remaining" : "Over Budget"}
              </p>
            </div>
            <p
              className={`text-xl font-bold ${
                totalRemaining >= 0 ? "text-slate-700" : "text-red-700"
              }`}
            >
              {formatCurrency(Math.abs(totalRemaining))}
            </p>
            <p
              className={`text-[11px] mt-0.5 ${
                totalRemaining >= 0 ? "text-slate-500" : "text-red-500"
              }`}
            >
              {totalRemaining >= 0
                ? `${100 - overallPercent}% available`
                : `${overallPercent - 100}% exceeded`}
            </p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground font-medium">
              Portfolio Budget Usage
            </span>
            <span className="font-semibold">{overallPercent}%</span>
          </div>
          <Progress
            value={Math.min(overallPercent, 100)}
            className="h-2.5"
            indicatorClassName={
              overallPercent > 100
                ? "bg-gradient-to-r from-red-400 to-red-500"
                : overallPercent > 90
                  ? "bg-gradient-to-r from-orange-400 to-orange-500"
                  : "bg-gradient-to-r from-blue-400 to-blue-500"
            }
          />
        </div>

        {expanded && (
          <div className="mt-5 space-y-5">
            {/* Over budget projects */}
            {overBudgetProjects.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-3 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Over Budget ({overBudgetProjects.length})
                </h4>
                <div className="space-y-2">
                  {overBudgetProjects.map((p) => {
                    const overage = p.budget_spent - p.budget_total;
                    const pct = Math.round(
                      (p.budget_spent / p.budget_total) * 100
                    );
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-sm p-3 rounded-xl bg-red-50/80 border border-red-100"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="truncate block text-sm font-medium">
                            {p.address.split(",")[0]}
                          </span>
                          <span className="text-[11px] text-red-500">
                            {pct}% of budget used
                          </span>
                        </div>
                        <span className="text-red-600 font-bold ml-2 text-sm">
                          +{formatCurrency(overage)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Budget usage by project */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Budget Usage by Project
              </h4>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {underBudgetProjects.slice(0, 10).map((p) => {
                  const pct =
                    p.budget_total > 0
                      ? Math.round((p.budget_spent / p.budget_total) * 100)
                      : 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3 text-xs">
                      <span className="w-40 truncate text-muted-foreground">
                        {p.address.split(",")[0]}
                      </span>
                      <div className="flex-1">
                        <Progress
                          value={pct}
                          className="h-2"
                          indicatorClassName={
                            pct > 90
                              ? "bg-gradient-to-r from-orange-400 to-orange-500"
                              : pct > 75
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                          }
                        />
                      </div>
                      <span className="w-14 text-right font-semibold text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
