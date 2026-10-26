# HCIL Capability Intelligence — Implementation Patch v1

This patch adds a first implementation foundation for the agreed workflow:

- Mandatory, current identity verification before a formal assessment attempt enters `in_progress` (database trigger is the final guard).
- Candidate capability claims remain `self_reported` unless an authorized workflow changes their status.
- Versioned structured AI interviewer and candidate capability intelligence prompts.
- Interview transcript/evaluation metadata, contextual gap analysis records, and learning roadmap records.
- `worker_profiles.avatar_path` for a storage object path (not image bytes or a public identity-document URL).
- Runtime validation for structured interviewer output.

## Included

- `src/db/schema/identity-security.ts`
- `src/db/schema/capability-intelligence.ts`
- updated `src/db/schema/index.ts`, `identity.ts`, `capability.ts`
- `drizzle/0008_capability_intelligence.sql` and updated migration journal
- `src/ai/prompts/capability-interviewer.ts`
- `src/modules/capability/application/assessment-identity-guard.ts`
- `tests-capability-intelligence.json`

## Apply carefully

1. Back up the database and commit the current working tree.
2. Copy the included `src/` files into the repository, preserving paths. The included `identity.ts` and `capability.ts` are based on the supplied `hcil(2).zip` snapshot; if you have made later edits locally, merge the added `avatarPath` and `identityVerificationId` fields instead of overwriting newer work.
3. Copy `drizzle/0008_capability_intelligence.sql` into the repo's `drizzle/` folder and merge the new entry in `drizzle/meta/_journal.json`. Do not replace a newer journal; append index 8 only if 0007 is still the latest migration.
4. Review the SQL and schema diff. Then run `npm run db:migrate` against a staging database first. This migration includes a trigger that rejects formal assessment attempts without a currently verified, consented identity record for the same profile.
5. Run `npx.cmd tsc --noEmit`, `npm run lint`, and `npm run build`. These commands have NOT been run as part of generating this patch.

## Important implementation boundaries

- The database trigger guards assessment attempts entering a formal active/scored state. The application must still call `assertAssessmentIdentity(profileId, verificationId)` before starting an attempt and must pass the selected verification ID into the attempt record.
- The current verification table stores decision metadata and an opaque provider reference, not raw document images or document numbers. Actual document intake/review provider integration is not included.
- The prompt registry constants are implemented, but a live NVIDIA/provider request adapter, streaming interview UI, and authenticated API endpoints are not included in this first patch. They should be wired through the existing AI orchestration/provider adapter, not by putting API keys in client code.
- `ai_interviews.transcript` may contain personal data. Add access controls, retention/deletion policy, and consent UX before collecting real transcripts. RLS is enabled and no client policies are added; access should be through the trusted server-side connection and permission-checked service layer.
- Gap analysis and roadmap tables store outputs, but do not themselves verify skills. An authorized workflow must validate results and create evidence/projections using the existing capability evidence model.
- Avatar paths must reference an access-controlled Supabase Storage bucket with appropriate upload constraints. Do not store identity document paths in public profile fields.

## Prompt and evaluation policy

Prompt versions are immutable once used for an interview. Increment the version when changing behavior. Store the prompt key/version and model provider/model identifier on each interview. The model's recommendation is advisory; application rules and authorized review govern official results.
