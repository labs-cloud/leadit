import { NextResponse } from "next/server";
import { fetchDashboardData, computeSummary } from "@/lib/clickup-server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchDashboardData();
    const unreadAlerts = data.alerts.filter((a) => !a.is_read).length;
    const summary = computeSummary(data.projects, unreadAlerts);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[API /dashboard/summary] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
