import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/clickup-server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchDashboardData();
    return NextResponse.json(data.alerts);
  } catch (err) {
    console.error("[API /alerts] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
