import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { infrastructureEnv } from "@/lib/infrastructure/env";
import { drainOutbox } from "@/lib/infrastructure/outbox/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  let expected: string;
  try {
    expected = infrastructureEnv.workerSecret();
  } catch {
    return false;
  }
  const actual =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await drainOutbox(10);
    return NextResponse.json(
      { ok: true, ...result, ranAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[HCIL][outbox] drain invocation failed",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { ok: false, error: "Outbox drain failed" },
      { status: 500 },
    );
  }
}
