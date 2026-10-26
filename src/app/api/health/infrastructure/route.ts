import { NextResponse } from "next/server";
import { checkInfrastructure } from "@/lib/infrastructure/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const health = await checkInfrastructure();
  return NextResponse.json(health, { status: health.status === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
