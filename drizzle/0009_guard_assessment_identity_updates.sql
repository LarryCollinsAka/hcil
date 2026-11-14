-- Revalidate identity verification whenever an assessment is
-- inserted or updated while in a protected assessment state.
--
-- This covers:
--   - INSERT directly into a protected state
--   - in_progress -> submitted
--   - submitted -> scored
--   - changes to worker_id or identity_verification_id
--     while the assessment is in a protected state.

CREATE OR REPLACE FUNCTION hcil_guard_assessment_identity()
RETURNS trigger AS $$
DECLARE
  verification identity_verifications%ROWTYPE;
BEGIN
  IF NEW.status IN ('in_progress', 'submitted', 'scored') THEN

    IF NEW.identity_verification_id IS NULL THEN
      RAISE EXCEPTION
        'Identity verification is required before a formal capability assessment';
    END IF;

    SELECT *
      INTO verification
      FROM identity_verifications
      WHERE id = NEW.identity_verification_id
        AND profile_id = NEW.worker_id
      FOR SHARE;

    IF NOT FOUND
       OR verification.status <> 'verified'
       OR verification.verified_at IS NULL
       OR verification.consented_at IS NULL
       OR (
         verification.expires_at IS NOT NULL
         AND verification.expires_at <= now()
       )
    THEN
      RAISE EXCEPTION
        'A valid identity verification for this candidate is required before assessment';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;