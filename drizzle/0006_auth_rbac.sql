-- HCIL AUTH + RBAC v1
-- Apply after the existing Drizzle migrations. This file is the reviewed SQL companion to
-- the Drizzle schema in src/db/schema/access.ts and the identity.ts organization additions.
-- It intentionally does NOT grant the first super-admin automatically.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS organization_type text NOT NULL DEFAULT 'employer';

DO $$ BEGIN
  ALTER TABLE public.organizations
    ADD CONSTRAINT organizations_type_ck
    CHECK (organization_type IN (
      'employer', 'staffing_agency', 'recruitment_agency', 'ngo',
      'public_sector', 'educational_institution', 'artisan_association',
      'cooperative', 'other'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.access_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  scope text NOT NULL,
  label text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_roles_role_key_uq UNIQUE (role_key),
  CONSTRAINT access_roles_scope_ck CHECK (scope IN ('platform', 'organization')),
  CONSTRAINT access_roles_key_ck CHECK (role_key ~ '^[a-z][a-z0-9_]*$')
);

CREATE TABLE IF NOT EXISTS public.access_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_permissions_permission_key_uq UNIQUE (permission_key),
  CONSTRAINT access_permissions_key_ck CHECK (permission_key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$')
);

CREATE TABLE IF NOT EXISTS public.access_role_permissions (
  role_id uuid NOT NULL REFERENCES public.access_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.access_permissions(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_role_permissions_pk PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  role_id uuid NOT NULL REFERENCES public.access_roles(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  revocation_reason text,
  CONSTRAINT user_role_assignments_expiry_ck CHECK (expires_at IS NULL OR expires_at > granted_at)
);

CREATE INDEX IF NOT EXISTS user_role_assignments_profile_idx
  ON public.user_role_assignments(profile_id, revoked_at);
CREATE INDEX IF NOT EXISTS user_role_assignments_org_idx
  ON public.user_role_assignments(organization_id, revoked_at);
CREATE UNIQUE INDEX IF NOT EXISTS user_role_assignments_platform_active_uq
  ON public.user_role_assignments(profile_id, role_id)
  WHERE organization_id IS NULL AND revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS user_role_assignments_org_active_uq
  ON public.user_role_assignments(profile_id, role_id, organization_id)
  WHERE organization_id IS NOT NULL AND revoked_at IS NULL;

-- A platform role has no organization scope. An organization role requires a current membership.
CREATE OR REPLACE FUNCTION public.hcil_validate_role_assignment_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_scope text;
  v_role_key text;
  v_org_type text;
BEGIN
  SELECT scope, role_key INTO v_scope, v_role_key
  FROM public.access_roles WHERE id = NEW.role_id;
  IF v_scope IS NULL THEN
    RAISE EXCEPTION 'Role does not exist';
  END IF;

  IF v_scope = 'platform' AND NEW.organization_id IS NOT NULL THEN
    RAISE EXCEPTION 'Platform roles cannot be scoped to an organization';
  ELSIF v_scope = 'organization' AND NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'Organization roles require an organization scope';
  END IF;

  IF v_scope = 'organization' THEN
    SELECT organization_type INTO v_org_type
    FROM public.organizations WHERE id = NEW.organization_id;

    IF v_role_key IN ('agency_owner', 'agency_admin', 'agency_manager', 'agency_finance', 'talent_coordinator', 'recruiter')
       AND v_org_type NOT IN ('staffing_agency', 'recruitment_agency') THEN
      RAISE EXCEPTION 'Agency roles require a staffing or recruitment agency organization';
    END IF;
    IF v_role_key IN ('org_owner', 'org_admin', 'org_manager', 'org_staff', 'org_viewer')
       AND v_org_type IN ('staffing_agency', 'recruitment_agency') THEN
      RAISE EXCEPTION 'Organization roles cannot be assigned to an agency organization';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = NEW.organization_id
        AND om.profile_id = NEW.profile_id
    ) THEN
      RAISE EXCEPTION 'Organization role requires a current organization membership';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hcil_role_assignment_scope_guard ON public.user_role_assignments;
CREATE TRIGGER hcil_role_assignment_scope_guard
BEFORE INSERT OR UPDATE OF role_id, organization_id, profile_id
ON public.user_role_assignments
FOR EACH ROW EXECUTE FUNCTION public.hcil_validate_role_assignment_scope();

-- Removing a member revokes role assignments scoped to that organization.
CREATE OR REPLACE FUNCTION public.hcil_revoke_removed_member_roles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_role_assignments
     SET revoked_at = COALESCE(revoked_at, now()),
         revocation_reason = COALESCE(revocation_reason, 'Organization membership removed')
   WHERE profile_id = OLD.profile_id
     AND organization_id = OLD.organization_id
     AND revoked_at IS NULL;
  RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS hcil_member_role_revoke ON public.organization_members;
CREATE TRIGGER hcil_member_role_revoke
AFTER DELETE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.hcil_revoke_removed_member_roles();

-- Agencies do not acquire representation rights from organization membership alone.
CREATE TABLE IF NOT EXISTS public.agency_representations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  talent_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending_consent',
  scopes text[] NOT NULL DEFAULT ARRAY[]::text[],
  requested_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  requested_at timestamptz NOT NULL DEFAULT now(),
  consented_by uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
  consented_at timestamptz,
  consent_expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agency_representations_status_ck CHECK (status IN ('pending_consent', 'active', 'suspended', 'revoked', 'expired')),
  CONSTRAINT agency_representations_scopes_ck CHECK (scopes <@ ARRAY['view_profile', 'view_private_evidence', 'manage_availability', 'submit_proposals', 'negotiate_terms', 'accept_assignments']::text[]),
  CONSTRAINT agency_representations_consent_ck CHECK (
    status <> 'active' OR (
      consented_by IS NOT NULL AND consented_by = talent_profile_id AND consented_at IS NOT NULL
      AND cardinality(scopes) > 0
      AND (consent_expires_at IS NULL OR consent_expires_at > consented_at)
    )
  ),
  CONSTRAINT agency_representations_revoked_ck CHECK (status <> 'revoked' OR revoked_at IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS agency_representations_open_uq
  ON public.agency_representations(agency_organization_id, talent_profile_id)
  WHERE status IN ('pending_consent', 'active', 'suspended');
CREATE INDEX IF NOT EXISTS agency_representations_talent_idx
  ON public.agency_representations(talent_profile_id, status);
CREATE INDEX IF NOT EXISTS agency_representations_agency_idx
  ON public.agency_representations(agency_organization_id, status);

CREATE OR REPLACE FUNCTION public.hcil_validate_agency_representation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = NEW.agency_organization_id
      AND o.organization_type IN ('staffing_agency', 'recruitment_agency')
  ) THEN
    RAISE EXCEPTION 'Only a staffing or recruitment agency can request talent representation';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.worker_profiles wp WHERE wp.profile_id = NEW.talent_profile_id
  ) THEN
    RAISE EXCEPTION 'Represented talent must have a worker profile';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = NEW.agency_organization_id AND om.profile_id = NEW.requested_by
  ) THEN
    RAISE EXCEPTION 'Representation must be requested by a member of the agency';
  END IF;
  IF NEW.status = 'active' AND NEW.consented_by IS DISTINCT FROM NEW.talent_profile_id THEN
    RAISE EXCEPTION 'Only the represented talent can grant representation consent';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS hcil_agency_representation_guard ON public.agency_representations;
CREATE TRIGGER hcil_agency_representation_guard
BEFORE INSERT OR UPDATE OF agency_organization_id, talent_profile_id, requested_by, status, consented_by, consented_at, scopes
ON public.agency_representations
FOR EACH ROW EXECUTE FUNCTION public.hcil_validate_agency_representation();

-- Seed permissions. Roles remain data-driven; adding a title is not enough to grant authority.
INSERT INTO public.access_permissions (permission_key, resource, action, description) VALUES
('platform.users.read', 'platform.users', 'read', 'Read platform user directory and support context'),
('platform.users.manage', 'platform.users', 'manage', 'Manage platform user states and support workflows'),
('platform.roles.assign_non_superadmin', 'platform.roles', 'assign_non_superadmin', 'Assign roles except super-admin'),
('platform.roles.manage', 'platform.roles', 'manage', 'Manage RBAC role and permission definitions'),
('platform.settings.manage', 'platform.settings', 'manage', 'Manage platform-wide settings'),
('content.manage', 'content', 'manage', 'Manage website and editorial content'),
('community.moderate', 'community', 'moderate', 'Moderate community content'),
('work.view_all', 'work', 'view_all', 'View platform-wide work records'),
('work.manage_all', 'work', 'manage_all', 'Manage platform-wide work operations'),
('work.view_assigned', 'work', 'view_assigned', 'View assigned work records'),
('work.assign', 'work', 'assign', 'Coordinate and assign work packages'),
('work.review', 'work', 'review', 'Review deliverables and acceptance records'),
('capability.review_all', 'capability', 'review_all', 'Review capability evidence platform-wide'),
('capability.review_assigned', 'capability', 'review_assigned', 'Review assigned capability evidence'),
('organizations.view_all', 'organizations', 'view_all', 'View organizations platform-wide'),
('organizations.manage_all', 'organizations', 'manage_all', 'Manage organizations platform-wide'),
('agency.representations.manage_all', 'agency.representations', 'manage_all', 'Manage agency representation records platform-wide'),
('agency.representations.manage_assigned', 'agency.representations', 'manage_assigned', 'Coordinate permitted agency representation records'),
('agency.representations.request', 'agency.representations', 'request', 'Request representation subject to talent consent'),
('agency.representations.review', 'agency.representations', 'review', 'Review representation operations within assigned scope'),
('agency.representations.view', 'agency.representations', 'view', 'View authorized representation records'),
('finance.view_all', 'finance', 'view_all', 'View platform-wide financial records'),
('finance.reconcile', 'finance', 'reconcile', 'Reconcile financial records'),
('reports.view_all', 'reports', 'view_all', 'View platform-wide operational reports'),
('audit.view', 'audit', 'view', 'View security and operational audit records'),
('organization.settings.manage', 'organization.settings', 'manage', 'Manage this organization settings'),
('organization.members.manage', 'organization.members', 'manage', 'Manage members of this organization'),
('organization.invite', 'organization.members', 'invite', 'Invite members to this organization'),
('work.create', 'work', 'create', 'Create work requests within this organization'),
('work.read', 'work', 'read', 'Read work records within this organization'),
('work.manage', 'work', 'manage', 'Manage work requests and packages within this organization'),
('work.accept', 'work', 'accept', 'Accept or request revision of deliverables within this organization'),
('finance.view', 'finance', 'view', 'View this organization financial records'),
('finance.manage', 'finance', 'manage', 'Manage this organization billing and finance operations')
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO public.access_roles (role_key, scope, label, description, is_system) VALUES
('super_admin', 'platform', 'Super administrator', 'Full platform authority, including RBAC and security configuration.', true),
('platform_admin', 'platform', 'Platform administrator', 'Platform operations with no authority to grant super-admin.', true),
('chief_operating_officer', 'platform', 'Chief operating officer', 'Cross-platform operational oversight; no automatic RBAC or security administration.', true),
('operations_manager', 'platform', 'Operations manager', 'Coordinates work operations and assigned agency workflows.', true),
('staff_coordinator', 'platform', 'Staff coordinator', 'Coordinates assigned work and evidence review.', true),
('support_agent', 'platform', 'Support agent', 'User support with limited, auditable read access.', true),
('content_editor', 'platform', 'Content editor', 'Manages editorial content.', true),
('community_moderator', 'platform', 'Community moderator', 'Moderates community content.', true),
('finance_manager', 'platform', 'Finance manager', 'Views and reconciles platform financial records.', true),
('org_owner', 'organization', 'Organization owner', 'Owns one employer or non-agency organization.', true),
('org_admin', 'organization', 'Organization administrator', 'Administers one organization without platform-wide privileges.', true),
('org_manager', 'organization', 'Organization manager', 'Manages organization work and invited staff.', true),
('org_staff', 'organization', 'Organization staff', 'Accesses work explicitly shared within the organization.', true),
('org_viewer', 'organization', 'Organization viewer', 'Read-only organization access where permitted.', true),
('agency_owner', 'organization', 'Agency owner', 'Owns one staffing or recruitment agency.', true),
('agency_admin', 'organization', 'Agency administrator', 'Administers one agency and its authorized representation workflows.', true),
('agency_manager', 'organization', 'Agency manager', 'Manages agency work and assigned representation workflows.', true),
('talent_coordinator', 'organization', 'Talent coordinator', 'Coordinates talent workflows, subject to individual representation consent.', true),
('recruiter', 'organization', 'Recruiter', 'Requests representation and coordinates suitable opportunities.', true),
('agency_finance', 'organization', 'Agency finance', 'Views and manages finance within one agency.', true)
ON CONFLICT (role_key) DO NOTHING;

-- Explicit platform mappings.
INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r CROSS JOIN public.access_permissions p
WHERE r.role_key = 'super_admin'
ON CONFLICT DO NOTHING;

-- The super-admin role represents the complete current permission set. Keep that invariant when
-- future migrations add new permission rows; the role itself still cannot be self-assigned in UI.
CREATE OR REPLACE FUNCTION public.hcil_grant_new_permission_to_superadmin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.access_role_permissions (role_id, permission_id)
  SELECT r.id, NEW.id FROM public.access_roles r WHERE r.role_key = 'super_admin'
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS hcil_superadmin_new_permission ON public.access_permissions;
CREATE TRIGGER hcil_superadmin_new_permission
AFTER INSERT ON public.access_permissions
FOR EACH ROW EXECUTE FUNCTION public.hcil_grant_new_permission_to_superadmin();

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN (
 'platform.users.read', 'platform.users.manage', 'platform.roles.assign_non_superadmin', 'platform.settings.manage',
 'content.manage', 'community.moderate', 'work.view_all', 'work.manage_all', 'work.assign', 'work.review',
 'capability.review_all', 'organizations.view_all', 'organizations.manage_all', 'agency.representations.manage_all',
 'finance.view_all', 'reports.view_all', 'audit.view'
)
WHERE r.role_key = 'platform_admin' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('work.view_all','work.manage_all','organizations.view_all','organizations.manage_all',
 'agency.representations.manage_all','finance.view_all','reports.view_all','audit.view')
WHERE r.role_key = 'chief_operating_officer' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('work.view_all','work.manage_all','work.view_assigned','work.assign','work.review',
 'organizations.view_all','agency.representations.manage_assigned','capability.review_assigned','reports.view_all')
WHERE r.role_key = 'operations_manager' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('work.view_assigned','work.assign','work.review','agency.representations.manage_assigned',
 'capability.review_assigned','platform.users.read')
WHERE r.role_key = 'staff_coordinator' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('platform.users.read')
WHERE r.role_key = 'support_agent' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('content.manage')
WHERE r.role_key = 'content_editor' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('community.moderate')
WHERE r.role_key = 'community_moderator' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('finance.view_all','finance.reconcile','reports.view_all')
WHERE r.role_key = 'finance_manager' ON CONFLICT DO NOTHING;

-- Organization role mappings. These permissions only apply inside the assigned organization.
INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('organization.settings.manage','organization.members.manage','organization.invite',
 'work.create','work.read','work.manage','work.accept','finance.view','finance.manage')
WHERE r.role_key = 'org_owner' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('organization.settings.manage','organization.members.manage','organization.invite',
 'work.create','work.read','work.manage','work.accept','finance.view','finance.manage',
 'agency.representations.request','agency.representations.review','agency.representations.view','agency.representations.manage_assigned')
WHERE r.role_key = 'agency_owner' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('organization.settings.manage','organization.members.manage','organization.invite',
 'work.create','work.read','work.manage','work.accept','finance.view')
WHERE r.role_key IN ('org_admin','agency_admin') ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('agency.representations.request','agency.representations.review',
 'agency.representations.view','agency.representations.manage_assigned')
WHERE r.role_key = 'agency_admin' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('organization.invite','work.create','work.read','work.manage','work.accept')
WHERE r.role_key = 'org_manager' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('work.read')
WHERE r.role_key IN ('org_staff','org_viewer') ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('organization.invite','work.create','work.read','work.manage','work.accept',
 'agency.representations.request','agency.representations.review','agency.representations.view',
 'agency.representations.manage_assigned','finance.view')
WHERE r.role_key = 'agency_manager' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('work.read','agency.representations.request','agency.representations.review',
 'agency.representations.view','agency.representations.manage_assigned')
WHERE r.role_key = 'talent_coordinator' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('work.create','work.read','agency.representations.request','agency.representations.view')
WHERE r.role_key = 'recruiter' ON CONFLICT DO NOTHING;

INSERT INTO public.access_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.access_roles r JOIN public.access_permissions p
ON p.permission_key IN ('finance.view','finance.manage')
WHERE r.role_key = 'agency_finance' ON CONFLICT DO NOTHING;

-- Backfill legacy staff roles and organization memberships into the new permission-bearing model.
-- Existing staff_roles.admin becomes platform_admin, never super_admin.
INSERT INTO public.user_role_assignments (profile_id, role_id, organization_id, granted_by, reason)
SELECT sr.profile_id, ar.id, NULL, sr.granted_by,
       'Migrated from legacy staff_roles: ' || sr.role::text
FROM public.staff_roles sr
JOIN public.access_roles ar ON ar.role_key = CASE sr.role::text
  WHEN 'admin' THEN 'platform_admin'
  WHEN 'editor' THEN 'content_editor'
  WHEN 'moderator' THEN 'community_moderator'
  ELSE NULL
END
ON CONFLICT DO NOTHING;

INSERT INTO public.user_role_assignments (profile_id, role_id, organization_id, granted_by, reason)
SELECT om.profile_id, ar.id, om.organization_id, NULL,
       'Migrated from legacy organization_members.role: ' || om.role::text
FROM public.organization_members om
JOIN public.organizations o ON o.id = om.organization_id
JOIN public.access_roles ar ON ar.role_key = CASE
  WHEN o.organization_type IN ('staffing_agency', 'recruitment_agency') AND om.role::text = 'owner' THEN 'agency_owner'
  WHEN o.organization_type IN ('staffing_agency', 'recruitment_agency') AND om.role::text = 'admin' THEN 'agency_admin'
  WHEN om.role::text = 'owner' THEN 'org_owner'
  WHEN om.role::text = 'admin' THEN 'org_admin'
  ELSE 'org_staff'
END
ON CONFLICT DO NOTHING;

-- Conservative default: no table in public is directly accessible through Supabase's Data API
-- until an explicit least-privilege policy is designed for it. The application server uses the
-- private Postgres connection plus explicit RBAC checks. Never put POSTGRES_URL/service-role keys
-- in browser code. RLS does not constrain database-owner/service-role connections, so app code
-- must still call its server-side authorization functions.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
