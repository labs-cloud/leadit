import express from "express";
import cors from "cors";
import cron from "node-cron";
import dotenv from "dotenv";

import dashboardRoutes from "./routes/dashboard";
import projectRoutes from "./routes/projects";
import alertRoutes from "./routes/alerts";
import activityRoutes from "./routes/activity";
import teamRoutes from "./routes/team";
import fileRoutes from "./routes/files";
import { handleWhatsAppWebhook } from "./services/whatsapp-handler";
import { syncClickUp } from "./services/clickup-sync";
import { syncOneDrive } from "./services/onedrive-sync";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/files", fileRoutes);

// Webhook endpoints
app.post("/webhook/whatsapp", handleWhatsAppWebhook);

// Cron jobs (only in production when APIs are configured)
if (process.env.CLICKUP_API_TOKEN) {
  // ClickUp sync every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    console.log("[Cron] Running ClickUp sync...");
    syncClickUp().catch(console.error);
  });
  console.log("[Cron] ClickUp sync scheduled (every 5 minutes)");
}

if (process.env.AZURE_CLIENT_ID) {
  // OneDrive sync every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    console.log("[Cron] Running OneDrive sync...");
    syncOneDrive().catch(console.error);
  });
  console.log("[Cron] OneDrive sync scheduled (every 15 minutes)");
}

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Lead It Builders API running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});

export default app;
