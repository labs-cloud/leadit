import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// GET /api/alerts
router.get("/", async (req: Request, res: Response) => {
  try {
    let query = supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (req.query.unread === "true") {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Alerts list error:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// POST /api/alerts/:id/read
router.post("/:id/read", async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("alerts")
      .update({ is_read: true })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("Mark alert read error:", err);
    res.status(500).json({ error: "Failed to mark alert as read" });
  }
});

export default router;
