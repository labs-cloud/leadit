import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardData, computeSummary } from "@/lib/clickup-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "true";
    const data = await fetchDashboardData(forceRefresh);
    const unreadAlerts = data.alerts.filter((a) => !a.is_read).length;
    const summary = computeSummary(data.projects, unreadAlerts);
    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API /dashboard/summary] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
