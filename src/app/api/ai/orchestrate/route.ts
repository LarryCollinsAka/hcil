import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasPermission } from "@/modules/identity/application/authorization";
import { orchestrateHcilTask } from "@/ai/orchestration/controller";
import { HCIL_TASK_TYPES, type HcilLanguage } from "@/ai/orchestration/types";
import { HCIL_AI_EVENT_TYPES, isHcilAiEventType } from "@/ai/events/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.id || !data.user.email) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const profile = await db.select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, data.user.id))
      .limit(1);
    if (!profile.length) return NextResponse.json({ error: "PROFILE_NOT_READY" }, { status: 403 });

    // This permission must be seeded and granted to approved roles before enabling the endpoint.
    const permitted = await hasPermission(data.user.id, "ai.orchestration.use");
    if (!permitted) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    const body: unknown = await request.json();
    if (!isRecord(body) || typeof body.taskType !== "string" || !HCIL_TASK_TYPES.includes(body.taskType as (typeof HCIL_TASK_TYPES)[number])) {
      return NextResponse.json({ error: "INVALID_TASK_TYPE" }, { status: 400 });
    }
    if (body.eventType !== undefined && (typeof body.eventType !== "string" || !isHcilAiEventType(body.eventType))) {
      return NextResponse.json({ error: "INVALID_EVENT_TYPE", allowed: HCIL_AI_EVENT_TYPES }, { status: 400 });
    }
    if (!("input" in body)) return NextResponse.json({ error: "INPUT_REQUIRED" }, { status: 400 });
    if (body.language !== undefined && body.language !== "en" && body.language !== "fr") {
      return NextResponse.json({ error: "INVALID_LANGUAGE" }, { status: 400 });
    }
    if (body.useFallback !== undefined && typeof body.useFallback !== "boolean") {
      return NextResponse.json({ error: "INVALID_FALLBACK_SETTING" }, { status: 400 });
    }

    const result = await orchestrateHcilTask({
      taskType: body.taskType as (typeof HCIL_TASK_TYPES)[number],
      eventType: body.eventType as import("@/ai/events/catalog").HcilAiEventType | undefined,
      input: body.input,
      language: body.language as HcilLanguage | undefined,
      useFallback: body.useFallback === true,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_REQUEST_FAILED";
    const mapped: Record<string, { status: number; message: string }> = {
      AI_PROVIDER_NOT_CONFIGURED: { status: 503, message: "AI provider is not configured." },
      AI_MODEL_DISABLED: { status: 503, message: "No eligible model is configured for this task." },
      AI_INPUT_TOO_LARGE: { status: 413, message: "Input exceeds the configured size limit." },
      AI_TASK_NOT_ALLOWED: { status: 400, message: "Task type is not allowed." },
      AI_EVENT_TASK_MISMATCH: { status: 400, message: "The selected event is not compatible with the task type." },
      AI_PROVIDER_RATE_LIMITED: { status: 429, message: "AI provider rate limit reached." },
      AI_PROVIDER_TIMEOUT: { status: 504, message: "AI provider timed out." },
      AI_PROVIDER_UNAVAILABLE: { status: 502, message: "AI provider is temporarily unavailable." },
    };
    const known = mapped[code];
    if (known) return NextResponse.json({ error: known.message, code }, { status: known.status });
    // Log only a stable code, never API keys, prompts, or provider response bodies.
    console.error("HCIL orchestration request failed", { code });
    return NextResponse.json({ error: "AI_REQUEST_FAILED", code: "AI_REQUEST_FAILED" }, { status: 500 });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
