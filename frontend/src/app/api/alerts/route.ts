import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/clickup-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchDashboardData();
    return NextResponse.json(data.alerts);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    console.error("[API /alerts] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
