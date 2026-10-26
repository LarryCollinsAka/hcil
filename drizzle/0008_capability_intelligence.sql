-- HCIL capability intelligence foundation: identity-gated assessments, interview audit,
-- candidate claims, contextual gap analysis, and learning roadmaps.
-- Apply only after the existing 0007 migration has been applied.

CREATE TABLE IF NOT EXISTS identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending',
  method text NOT NULL,
  provider text,
  external_reference text,
  verified_at timestamptz,
  expires_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  decision_reason text,
  consented_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT identity_verifications_status_ck CHECK (status IN ('pending','verified','rejected','expired','revoked')),
  CONSTRAINT identity_verifications_method_ck CHECK (method IN ('provider','document_review','in_person','other')),
  CONSTRAINT identity_verifications_expiry_ck CHECK (expires_at IS NULL OR verified_at IS NULL OR expires_at > verified_at),
  CONSTRAINT identity_verifications_verified_ck CHECK (status <> 'verified' OR (verified_at IS NOT NULL AND consented_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS identity_verifications_profile_status_idx ON identity_verifications(profile_id, status, expires_at);

ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS avatar_path text;
ALTER TABLE assessment_attempts ADD COLUMN IF NOT EXISTS identity_verification_id uuid REFERENCES identity_verifications(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS assessment_attempts_identity_verification_idx ON assessment_attempts(identity_verification_id);

CREATE TABLE IF NOT EXISTS capability_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  capability_id uuid NOT NULL REFERENCES capabilities(id) ON DELETE RESTRICT,
  claimed_level integer,
  description text,
  evidence_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'self_reported',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT capability_claims_level_ck CHECK (claimed_level IS NULL OR claimed_level BETWEEN 0 AND 5),
  CONSTRAINT capability_claims_status_ck CHECK (status IN ('self_reported','evidence_assessed','verified','disputed','withdrawn'))
);
CREATE INDEX IF NOT EXISTS capability_claims_profile_idx ON capability_claims(profile_id, created_at);
CREATE INDEX IF NOT EXISTS capability_claims_capability_idx ON capability_claims(capability_id, status);

CREATE TABLE IF NOT EXISTS ai_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL UNIQUE REFERENCES assessment_attempts(id) ON DELETE RESTRICT,
  prompt_key text NOT NULL,
  prompt_version text NOT NULL,
  model_provider text,
  model_id text,
  status text NOT NULL DEFAULT 'created',
  language_code text NOT NULL DEFAULT 'en',
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  evaluation jsonb,
  review_status text NOT NULL DEFAULT 'not_required',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_interviews_status_ck CHECK (status IN ('created','in_progress','completed','interrupted','failed','voided')),
  CONSTRAINT ai_interviews_review_status_ck CHECK (review_status IN ('not_required','pending','approved','rejected','appealed')),
  CONSTRAINT ai_interviews_language_ck CHECK (language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$')
);

CREATE TABLE IF NOT EXISTS capability_gap_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  target_type text NOT NULL,
  target_key text NOT NULL,
  target_description text,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  analysis jsonb NOT NULL,
  prompt_version text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT capability_gap_analyses_target_type_ck CHECK (target_type IN ('role','work_package','learning_goal')),
  CONSTRAINT capability_gap_analyses_status_ck CHECK (status IN ('draft','ready','review_required','superseded'))
);
CREATE INDEX IF NOT EXISTS capability_gap_analyses_profile_idx ON capability_gap_analyses(profile_id, created_at);

CREATE TABLE IF NOT EXISTS learning_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  gap_analysis_id uuid NOT NULL REFERENCES capability_gap_analyses(id) ON DELETE RESTRICT,
  title text NOT NULL,
  summary text NOT NULL,
  target_date timestamptz,
  estimated_hours integer,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'proposed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learning_roadmaps_hours_ck CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
  CONSTRAINT learning_roadmaps_status_ck CHECK (status IN ('proposed','active','paused','completed','superseded'))
);
CREATE INDEX IF NOT EXISTS learning_roadmaps_profile_idx ON learning_roadmaps(profile_id, created_at);

-- A formal assessment cannot be started or submitted without an explicit, currently valid
-- identity verification belonging to the same candidate. Invited attempts may exist before that.
CREATE OR REPLACE FUNCTION hcil_guard_assessment_identity() RETURNS trigger AS $$
DECLARE verification identity_verifications%ROWTYPE;
BEGIN
  IF NEW.status IN ('in_progress','submitted','scored')
     AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('in_progress','submitted','scored')) THEN
    IF NEW.identity_verification_id IS NULL THEN
      RAISE EXCEPTION 'Identity verification is required before a formal capability assessment';
    END IF;
    SELECT * INTO verification
      FROM identity_verifications
      WHERE id = NEW.identity_verification_id
        AND profile_id = NEW.worker_id
      FOR SHARE;
    IF NOT FOUND OR verification.status <> 'verified'
       OR verification.verified_at IS NULL
       OR verification.consented_at IS NULL
       OR (verification.expires_at IS NOT NULL AND verification.expires_at <= now()) THEN
      RAISE EXCEPTION 'A valid identity verification for this candidate is required before assessment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS assessment_attempt_identity_guard ON assessment_attempts;
CREATE TRIGGER assessment_attempt_identity_guard
  BEFORE INSERT OR UPDATE OF status, worker_id, identity_verification_id ON assessment_attempts
  FOR EACH ROW EXECUTE FUNCTION hcil_guard_assessment_identity();

-- These records are accessed through the trusted server-side database connection.
-- No client-side policies are granted by this migration.
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_roadmaps ENABLE ROW LEVEL SECURITY;
