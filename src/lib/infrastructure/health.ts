import "server-only";
import { getQdrantClient } from "./qdrant/client";
import { redisPing } from "./redis/client";
import { falkorPing } from "./falkordb/client";

export type DependencyHealth = { status: "ok" | "error" | "not_configured"; latencyMs?: number };
async function check(name: string, fn: () => Promise<unknown>): Promise<DependencyHealth> {
  const start = Date.now();
  try { await fn(); return { status: "ok", latencyMs: Date.now() - start }; }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("Missing required environment variable:")) return { status: "not_configured" };
    console.error(`[HCIL][health][${name}]`, message);
    return { status: "error", latencyMs: Date.now() - start };
  }
}
export async function checkInfrastructure() {
  const [qdrant, redis, falkordb] = await Promise.all([
    check("qdrant", async () => { await getQdrantClient().getCollections(); }),
    check("redis", async () => { const result = await redisPing(); if (result !== "PONG") throw new Error("Unexpected Redis ping response"); }),
    check("falkordb", falkorPing),
  ]);
  const configured = [qdrant, redis, falkordb].every((item) => item.status !== "not_configured");
  const healthy = [qdrant, redis, falkordb].every((item) => item.status === "ok");
  return { status: healthy ? "ok" : configured ? "degraded" : "not_configured", dependencies: { qdrant, redis, falkordb }, checkedAt: new Date().toISOString() };
}
