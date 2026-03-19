import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// GET /api/team/workload
// Aggregates task assignments from ClickUp data
router.get("/workload", async (_req: Request, res: Response) => {
  try {
    // In production, this would aggregate from a team_members table
    // populated by the ClickUp sync. For now, return placeholder structure.
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*");

    if (error) throw error;

    // Since we don't have individual task assignment data yet,
    // return an aggregated view
    res.json(projects || []);
  } catch (err) {
    console.error("Team workload error:", err);
    res.status(500).json({ error: "Failed to fetch team workload" });
  }
});

export default router;
