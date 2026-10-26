import "server-only";
import { QdrantClient } from "@qdrant/js-client-rest";
import { infrastructureEnv } from "../env";

let singleton: QdrantClient | undefined;
export function getQdrantClient(): QdrantClient {
  if (!singleton)
    singleton = new QdrantClient({
      url: infrastructureEnv.qdrantUrl(),
      apiKey: infrastructureEnv.qdrantApiKey(),
    });
  return singleton;
}

export async function ensureQdrantCollection(): Promise<void> {
  const client = getQdrantClient();
  const name = infrastructureEnv.qdrantCollection();
  try {
    await client.getCollection(name);
  } catch (error) {
    // Only create when the collection is genuinely absent; surface auth/network failures.
    const message = error instanceof Error ? error.message : String(error);
    if (!/404|Not found|doesn't exist|not exist/i.test(message)) throw error;
    await client.createCollection(name, {
      vectors: {
        size: infrastructureEnv.qdrantVectorSize(),
        distance: "Cosine",
      },
    });
  }
}

export type VectorRecord = {
  id: string | number;
  vector: number[];
  payload: Record<string, unknown>;
};
export async function upsertVectors(records: VectorRecord[]): Promise<void> {
  if (!records.length) return;
  const size = infrastructureEnv.qdrantVectorSize();
  for (const record of records) {
    if (
      record.vector.length !== size ||
      record.vector.some((n) => !Number.isFinite(n))
    )
      throw new Error(
        `Vector ${record.id} does not match configured vector size ${size}`,
      );
  }
  await ensureQdrantCollection();
  await getQdrantClient().upsert(infrastructureEnv.qdrantCollection(), {
    wait: true,
    points: records.map((record) => ({
      id: record.id,
      vector: record.vector,
      payload: record.payload,
    })),
  });
}

export async function searchVectors(
  vector: number[],
  limit = 10,
  filter?: Record<string, unknown>,
) {
  if (vector.length !== infrastructureEnv.qdrantVectorSize())
    throw new Error(
      "Search vector dimension does not match QDRANT_VECTOR_SIZE",
    );
  await ensureQdrantCollection();
  return getQdrantClient().query(infrastructureEnv.qdrantCollection(), {
    query: vector,
    limit: Math.max(1, Math.min(limit, 100)),
    filter: filter as never,
    with_payload: true,
  });
}

export async function deleteVectorPoints(
  ids: Array<string | number>,
): Promise<void> {
  if (!ids.length) return;
  await getQdrantClient().delete(infrastructureEnv.qdrantCollection(), {
    wait: true,
    points: ids,
  });
}
