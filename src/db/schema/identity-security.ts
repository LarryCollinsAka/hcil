// Identity assurance for formal capability assessments.
// Identity verification records contain references and decisions, not raw identity documents.
import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./_shared";
import { profiles } from "./identity";

export const identityVerifications = pgTable(
  "identity_verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("pending"), // pending | verified | rejected | expired | revoked
    method: text("method").notNull(), // provider | document_review | in_person | other approved method
    provider: text("provider"),
    externalReference: text("external_reference"), // opaque provider reference; never store document numbers here
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id, { onDelete: "restrict" }),
    decisionReason: text("decision_reason"),
    consentedAt: timestamp("consented_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("identity_verifications_profile_status_idx").on(t.profileId, t.status, t.expiresAt),
    check("identity_verifications_status_ck", sql`${t.status} in ('pending','verified','rejected','expired','revoked')`),
    check("identity_verifications_method_ck", sql`${t.method} in ('provider','document_review','in_person','other')`),
    check("identity_verifications_expiry_ck", sql`${t.expiresAt} is null or ${t.verifiedAt} is null or ${t.expiresAt} > ${t.verifiedAt}`),
    check("identity_verifications_verified_ck", sql`${t.status} <> 'verified' or (${t.verifiedAt} is not null and ${t.consentedAt} is not null)`),
  ],
).enableRLS();
