/** Server-only infrastructure environment validation. Never import into client components. */
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const infrastructureEnv = {
  qdrantUrl: () => required("QDRANT_URL"),
  qdrantApiKey: () => required("QDRANT_API_KEY"),
  qdrantCollection: () => process.env.QDRANT_COLLECTION?.trim() || "hcil_capabilities_v1",
  qdrantVectorSize: () => {
    const value = Number(required("QDRANT_VECTOR_SIZE"));
    if (!Number.isSafeInteger(value) || value < 1) throw new Error("QDRANT_VECTOR_SIZE must be a positive integer");
    return value;
  },
  redisUrl: () => required("REDIS_URL"),
  falkorUrl: () => required("FALKORDB_URL"),
  falkorGraph: () => process.env.FALKORDB_GRAPH?.trim() || "hcil",
  workerSecret: () => required("OUTBOX_WORKER_SECRET"),
};
