// src/db/schema/index.ts
// Point drizzle.config.ts at this file (or the folder) via `schema`.
// Domain schemas are exported here so Drizzle can build a complete schema snapshot.

export * from "./reference";
export * from "./identity";
export * from "./content";
export * from "./community";
export * from "./platform";
export * from "./capability";
export * from "./work";
export * from "./access";

export * from "./identity-security";
export * from "./capability-intelligence";
