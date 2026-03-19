import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// GET /api/projects
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("health_score", { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Projects list error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Project not found" });

    res.json(data);
  } catch (err) {
    console.error("Project detail error:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

export default router;
