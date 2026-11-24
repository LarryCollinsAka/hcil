import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const meta = path.join(root, "drizzle", "meta");
const baselineDir = path.join(root, ".drizzle-baseline");
const baselineSnapshotPath = path.join(baselineDir, "meta", "0000_snapshot.json");
const snapshot7Path = path.join(meta, "0007_snapshot.json");
const snapshot9Path = path.join(meta, "0009_snapshot.json");
const snapshot8Path = path.join(meta, "0008_snapshot.json");

for (const p of [snapshot7Path, snapshot9Path]) {
  if (!existsSync(p)) throw new Error(`Required migration snapshot not found: ${p}`);
}
if (existsSync(snapshot8Path)) throw new Error("0008_snapshot.json already exists; refusing to overwrite it.");
if (existsSync(baselineDir)) rmSync(baselineDir, { recursive: true, force: true });

const isWindows = process.platform === "win32";
const command = isWindows ? "npx.cmd" : "npx";
execFileSync(command, [
  "drizzle-kit", "generate", "--config=drizzle.baseline.config.ts", "--name=baseline_snapshot",
], { cwd: root, stdio: "inherit", shell: isWindows });

if (!existsSync(baselineSnapshotPath)) {
  throw new Error(`Drizzle did not produce the expected snapshot: ${baselineSnapshotPath}`);
}
const snapshot7 = JSON.parse(readFileSync(snapshot7Path, "utf8"));
const generated = JSON.parse(readFileSync(baselineSnapshotPath, "utf8"));
const expectedNewTables = [
  "identity_verifications",
  "capability_claims",
  "ai_interviews",
  "capability_gap_analyses",
  "learning_roadmaps",
];
const oldNames = new Set(Object.keys(snapshot7.tables ?? {}).map((key) => key.split(".").at(-1)));
const generatedNames = new Set(Object.keys(generated.tables ?? {}).map((key) => key.split(".").at(-1)));
const additions = [...generatedNames].filter((name) => !oldNames.has(name)).sort();
const missing = expectedNewTables.filter((name) => !generatedNames.has(name));
const unexpected = additions.filter((name) => !expectedNewTables.includes(name));
if (missing.length || unexpected.length) {
  throw new Error(
    `Snapshot reconciliation stopped. Missing expected 0008 tables: ${missing.join(", ") || "none"}. ` +
    `Unexpected additions vs 0007: ${unexpected.join(", ") || "none"}. No migration snapshots were changed.`,
  );
}

mkdirSync(meta, { recursive: true });
const id8 = randomUUID();
const id9 = randomUUID();
const snapshot8 = { ...generated, id: id8, prevId: snapshot7.id };
const snapshot9 = { ...generated, id: id9, prevId: id8 };
const backup9Path = path.join(meta, "0009_snapshot.json.before-reconcile");
renameSync(snapshot9Path, backup9Path);
try {
  writeFileSync(snapshot8Path, `${JSON.stringify(snapshot8, null, 2)}\n`);
  writeFileSync(snapshot9Path, `${JSON.stringify(snapshot9, null, 2)}\n`);
} catch (error) {
  if (existsSync(snapshot9Path)) rmSync(snapshot9Path);
  renameSync(backup9Path, snapshot9Path);
  if (existsSync(snapshot8Path)) rmSync(snapshot8Path);
  throw error;
}

console.log("Snapshot reconciliation complete.");
console.log("- Added drizzle/meta/0008_snapshot.json for the five tables created by migration 0008.");
console.log("- Rebuilt 0009_snapshot.json with the same schema state (0009 changes only a trigger function).");
console.log(`- Preserved the original 0009 snapshot at ${path.relative(root, backup9Path)}.`);
console.log("- No database connection or database write was used.");
