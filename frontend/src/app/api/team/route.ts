import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/clickup-server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchDashboardData();
    return NextResponse.json(data.team);
  } catch (err) {
    console.error("[API /team] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch team workload" },
      { status: 500 }
    );
  }
}
