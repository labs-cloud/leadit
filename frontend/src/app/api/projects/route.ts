import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/clickup-server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // ISR: regenerate every 5 minutes

export async function GET() {
  try {
    const data = await fetchDashboardData();
    return NextResponse.json(data.projects);
  } catch (err) {
    console.error("[API /projects] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch projects from ClickUp" },
      { status: 500 }
    );
  }
}
