import { and, eq, isNull, or, gt } from "drizzle-orm";
import { db } from "@/db";
import { identityVerifications } from "@/db/schema/identity-security";

export class AssessmentIdentityRequiredError extends Error {
  readonly code = "ASSESSMENT_IDENTITY_REQUIRED";
  constructor(message = "A current identity verification and candidate consent are required before formal capability assessment.") {
    super(message);
    this.name = "AssessmentIdentityRequiredError";
  }
}

/** Call before moving an invited attempt into in_progress. The database trigger is the final guard. */
export async function assertAssessmentIdentity(profileId: string, verificationId: string): Promise<void> {
  const now = new Date();
  const rows = await db.select({ id: identityVerifications.id })
    .from(identityVerifications)
    .where(and(
      eq(identityVerifications.id, verificationId),
      eq(identityVerifications.profileId, profileId),
      eq(identityVerifications.status, "verified"),
      or(isNull(identityVerifications.expiresAt), gt(identityVerifications.expiresAt, now)),
    ))
    .limit(1);
  if (!rows.length) throw new AssessmentIdentityRequiredError();
}
