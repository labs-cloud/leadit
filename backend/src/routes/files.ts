import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// GET /api/files/recent
router.get("/recent", async (_req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("project_files")
      .select("*")
      .gte("uploaded_at", sevenDaysAgo)
      .order("uploaded_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Recent files error:", err);
    res.status(500).json({ error: "Failed to fetch recent files" });
  }
});

export default router;
