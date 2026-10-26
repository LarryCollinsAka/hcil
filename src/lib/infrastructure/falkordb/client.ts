import "server-only";
import Redis from "ioredis";
import { infrastructureEnv } from "../env";

let singleton: Redis | undefined;
export function getFalkorClient(): Redis {
  if (!singleton) {
    singleton = new Redis(infrastructureEnv.falkorUrl(), {
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 8000,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => attempt > 3 ? null : Math.min(attempt * 250, 1000),
    });
    singleton.on("error", (error) => console.error("[HCIL][FalkorDB] client error", error.message));
  }
  return singleton;
}

async function readyClient(): Promise<Redis> {
  const client = getFalkorClient();
  if (client.status === "wait" || client.status === "end") await client.connect();
  return client;
}

/** Execute a read/query against the configured graph. Do not concatenate user input into Cypher. */
export async function queryGraph<T = unknown>(query: string, params: Record<string, string | number | boolean | null> = {}): Promise<T> {
  if (!query.trim()) throw new Error("Graph query cannot be empty");
  // FalkorDB's GRAPH.QUERY command accepts a graph name, Cypher, and optional compact result flag.
  // FalkorDB/RedisGraph accepts parameters in a CYPHER name=value prefix. Values are serialized
  // as Cypher literals, while query text itself must be application-authored, never user input.
  const client = await readyClient();
  const literal = (value: string | number | boolean | null) => {
    if (value === null) return "null";
    if (typeof value === "number") { if (!Number.isFinite(value)) throw new Error("Cypher numeric parameter must be finite"); return String(value); }
    if (typeof value === "boolean") return value ? "true" : "false";
    return JSON.stringify(value);
  };
  const prefix = Object.entries(params).map(([key, value]) => {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) throw new Error(`Invalid Cypher parameter name: ${key}`);
    return `${key}=${literal(value)}`;
  }).join(" ");
  const cypher = prefix ? `CYPHER ${prefix} ${query}` : query;
  const result = await client.call("GRAPH.QUERY", infrastructureEnv.falkorGraph(), cypher, "--compact");
  return result as T;
}

export async function falkorPing(): Promise<void> {
  const client = await readyClient();
  // No writes: a read-only probe that confirms the graph module is reachable.
  await client.call("GRAPH.QUERY", infrastructureEnv.falkorGraph(), "RETURN 1 AS hcil_health", "--compact");
}
