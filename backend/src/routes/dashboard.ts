import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// GET /api/dashboard/summary
router.get("/summary", async (_req: Request, res: Response) => {
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*");

    if (error) throw error;
    if (!projects || projects.length === 0) {
      return res.json({
        total_projects: 0,
        projects_by_phase: {},
        overall_health_score: 0,
        total_overdue_tasks: 0,
        total_open_violations: 0,
        total_budget: 0,
        total_spent: 0,
        unread_alerts: 0,
      });
    }

    const projectsByPhase: Record<string, number> = {};
    let totalHealth = 0;
    let totalOverdue = 0;
    let totalViolations = 0;
    let totalBudget = 0;
    let totalSpent = 0;

    for (const p of projects) {
      projectsByPhase[p.phase] = (projectsByPhase[p.phase] || 0) + 1;
      totalHealth += p.health_score || 0;
      totalOverdue += p.overdue_tasks || 0;
      totalViolations += p.open_violations || 0;
      totalBudget += Number(p.budget_total) || 0;
      totalSpent += Number(p.budget_spent) || 0;
    }

    const { count: unreadAlerts } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    res.json({
      total_projects: projects.length,
      projects_by_phase: projectsByPhase,
      overall_health_score: Math.round(totalHealth / projects.length),
      total_overdue_tasks: totalOverdue,
      total_open_violations: totalViolations,
      total_budget: totalBudget,
      total_spent: totalSpent,
      unread_alerts: unreadAlerts || 0,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

export default router;
