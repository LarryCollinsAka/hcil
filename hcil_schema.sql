-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.capabilities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'active'::text, 'deprecated'::text])),
  replaced_by_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT capabilities_pkey PRIMARY KEY (id),
  CONSTRAINT capabilities_replaced_by_id_capabilities_id_fk FOREIGN KEY (replaced_by_id) REFERENCES public.capabilities(id),
  CONSTRAINT capabilities_domain_id_capability_domains_id_fk FOREIGN KEY (domain_id) REFERENCES public.capability_domains(id)
);
CREATE TABLE public.capability_aliases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  capability_id uuid NOT NULL,
  language_id uuid,
  alias text NOT NULL,
  normalized_alias text DEFAULT lower(btrim(alias)),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT capability_aliases_pkey PRIMARY KEY (id),
  CONSTRAINT capability_aliases_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id),
  CONSTRAINT capability_aliases_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.capability_domain_translations (
  domain_id uuid NOT NULL,
  locale_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  is_machine_translated boolean NOT NULL DEFAULT false,
  source_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT capability_domain_translations_pkey PRIMARY KEY (domain_id, locale_id),
  CONSTRAINT capability_domain_translations_locale_id_platform_locales_id_fk FOREIGN KEY (locale_id) REFERENCES public.platform_locales(id),
  CONSTRAINT capability_domain_translations_domain_id_capability_domains_id_ FOREIGN KEY (domain_id) REFERENCES public.capability_domains(id)
);
CREATE TABLE public.capability_domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'deprecated'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT capability_domains_pkey PRIMARY KEY (id),
  CONSTRAINT capability_domains_parent_id_capability_domains_id_fk FOREIGN KEY (parent_id) REFERENCES public.capability_domains(id)
);
CREATE TABLE public.capability_translations (
  capability_id uuid NOT NULL,
  locale_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  is_machine_translated boolean NOT NULL DEFAULT false,
  source_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT capability_translations_pkey PRIMARY KEY (capability_id, locale_id),
  CONSTRAINT capability_translations_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id),
  CONSTRAINT capability_translations_locale_id_platform_locales_id_fk FOREIGN KEY (locale_id) REFERENCES public.platform_locales(id)
);
CREATE TABLE public.language_aliases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL,
  alias text NOT NULL,
  normalized_alias text DEFAULT lower(btrim(alias)),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT language_aliases_pkey PRIMARY KEY (id),
  CONSTRAINT language_aliases_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.languages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  iso_639_3 text NOT NULL CHECK (iso_639_3 ~ '^[a-z]{3}$'::text),
  iso_639_1 text CHECK (iso_639_1 IS NULL OR iso_639_1 ~ '^[a-z]{2}$'::text),
  name text NOT NULL,
  native_name text,
  family text,
  scope text NOT NULL DEFAULT 'individual'::text CHECK (scope = ANY (ARRAY['individual'::text, 'macrolanguage'::text])),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'deprecated'::text])),
  replaced_by_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT languages_pkey PRIMARY KEY (id),
  CONSTRAINT languages_replaced_by_id_languages_id_fk FOREIGN KEY (replaced_by_id) REFERENCES public.languages(id)
);
CREATE TABLE public.platform_locales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL,
  tag text NOT NULL CHECK (tag ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'::text),
  normalized_tag text DEFAULT lower(btrim(tag)),
  label text NOT NULL,
  direction text NOT NULL DEFAULT 'ltr'::text CHECK (direction = ANY (ARRAY['ltr'::text, 'rtl'::text])),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'deprecated'::text])),
  is_default boolean NOT NULL DEFAULT false,
  fallback_locale_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT platform_locales_pkey PRIMARY KEY (id),
  CONSTRAINT platform_locales_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id),
  CONSTRAINT platform_locales_fallback_locale_id_platform_locales_id_fk FOREIGN KEY (fallback_locale_id) REFERENCES public.platform_locales(id)
);
CREATE TABLE public.taxonomy_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL CHECK (action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])),
  before_data jsonb,
  after_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT taxonomy_audit_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organization_members (
  organization_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'member'::org_member_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (organization_id, profile_id),
  CONSTRAINT organization_members_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_members_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  country_code text NOT NULL DEFAULT 'CM'::text CHECK (country_code ~ '^[A-Z]{2}$'::text),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_type text NOT NULL DEFAULT 'employer'::text CHECK (organization_type = ANY (ARRAY['employer'::text, 'staffing_agency'::text, 'recruitment_agency'::text, 'ngo'::text, 'public_sector'::text, 'educational_institution'::text, 'artisan_association'::text, 'cooperative'::text, 'other'::text])),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{6,14}$'::text),
  locale_id uuid,
  timezone text,
  anonymized_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_locale_id_platform_locales_id_fk FOREIGN KEY (locale_id) REFERENCES public.platform_locales(id)
);
CREATE TABLE public.staff_roles (
  profile_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT staff_roles_pkey PRIMARY KEY (profile_id, role),
  CONSTRAINT staff_roles_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT staff_roles_granted_by_profiles_id_fk FOREIGN KEY (granted_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.worker_profiles (
  profile_id uuid NOT NULL,
  headline text,
  bio text,
  country_code text CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'::text),
  city text,
  available_hours_per_week integer CHECK (available_hours_per_week IS NULL OR available_hours_per_week >= 0 AND available_hours_per_week <= 168),
  min_hourly_rate integer CHECK (min_hourly_rate IS NULL OR min_hourly_rate >= 0),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar_path text,
  CONSTRAINT worker_profiles_pkey PRIMARY KEY (profile_id),
  CONSTRAINT worker_profiles_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.page_translations (
  page_id uuid NOT NULL,
  locale_id uuid NOT NULL,
  path text NOT NULL CHECK (path ~~ '/%'::text),
  title text NOT NULL,
  meta_title text,
  meta_description text,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  blocks_version integer NOT NULL DEFAULT 1,
  published_at timestamp with time zone,
  updated_by uuid,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  is_machine_translated boolean NOT NULL DEFAULT false,
  source_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT page_translations_pkey PRIMARY KEY (page_id, locale_id),
  CONSTRAINT page_translations_page_id_pages_id_fk FOREIGN KEY (page_id) REFERENCES public.pages(id),
  CONSTRAINT page_translations_locale_id_platform_locales_id_fk FOREIGN KEY (locale_id) REFERENCES public.platform_locales(id),
  CONSTRAINT page_translations_updated_by_profiles_id_fk FOREIGN KEY (updated_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL CHECK (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  template text NOT NULL DEFAULT 'default'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.post_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL CHECK (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.post_category_translations (
  category_id uuid NOT NULL,
  locale_id uuid NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  is_machine_translated boolean NOT NULL DEFAULT false,
  source_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_category_translations_pkey PRIMARY KEY (category_id, locale_id),
  CONSTRAINT post_category_translations_category_id_post_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.post_categories(id),
  CONSTRAINT post_category_translations_locale_id_platform_locales_id_fk FOREIGN KEY (locale_id) REFERENCES public.platform_locales(id)
);
CREATE TABLE public.post_translations (
  post_id uuid NOT NULL,
  locale_id uuid NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  title text NOT NULL,
  excerpt text,
  body_markdown text NOT NULL,
  cover_alt text,
  meta_title text,
  meta_description text,
  published_at timestamp with time zone,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  is_machine_translated boolean NOT NULL DEFAULT false,
  source_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_translations_pkey PRIMARY KEY (post_id, locale_id),
  CONSTRAINT post_translations_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_translations_locale_id_platform_locales_id_fk FOREIGN KEY (locale_id) REFERENCES public.platform_locales(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid,
  category_id uuid,
  source_locale_id uuid NOT NULL,
  cover_image_url text,
  is_featured boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_author_id_profiles_id_fk FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT posts_category_id_post_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.post_categories(id),
  CONSTRAINT posts_source_locale_id_platform_locales_id_fk FOREIGN KEY (source_locale_id) REFERENCES public.platform_locales(id)
);
CREATE TABLE public.forum_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL CHECK (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  sort_order integer NOT NULL DEFAULT 0,
  is_locked boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.forum_category_translations (
  category_id uuid NOT NULL,
  locale_id uuid NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  is_machine_translated boolean NOT NULL DEFAULT false,
  source_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_category_translations_pkey PRIMARY KEY (category_id, locale_id),
  CONSTRAINT forum_category_translations_category_id_forum_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.forum_categories(id),
  CONSTRAINT forum_category_translations_locale_id_platform_locales_id_fk FOREIGN KEY (locale_id) REFERENCES public.platform_locales(id)
);
CREATE TABLE public.forum_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  author_id uuid,
  reply_to_post_id uuid,
  language_id uuid NOT NULL,
  body text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'visible'::forum_post_status,
  edited_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
  CONSTRAINT forum_posts_thread_id_forum_threads_id_fk FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_posts_author_id_profiles_id_fk FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_posts_reply_to_post_id_forum_posts_id_fk FOREIGN KEY (reply_to_post_id) REFERENCES public.forum_posts(id),
  CONSTRAINT forum_posts_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.forum_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  reporter_id uuid,
  reason text NOT NULL CHECK (reason = ANY (ARRAY['spam'::text, 'abuse'::text, 'off_topic'::text, 'other'::text])),
  details text,
  status USER-DEFINED NOT NULL DEFAULT 'open'::forum_report_status,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_reports_pkey PRIMARY KEY (id),
  CONSTRAINT forum_reports_post_id_forum_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.forum_posts(id),
  CONSTRAINT forum_reports_reporter_id_profiles_id_fk FOREIGN KEY (reporter_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_reports_resolved_by_profiles_id_fk FOREIGN KEY (resolved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.forum_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  author_id uuid,
  language_id uuid NOT NULL,
  title text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'open'::forum_thread_status,
  is_pinned boolean NOT NULL DEFAULT false,
  reply_count integer NOT NULL DEFAULT 0,
  last_post_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_threads_pkey PRIMARY KEY (id),
  CONSTRAINT forum_threads_category_id_forum_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.forum_categories(id),
  CONSTRAINT forum_threads_author_id_profiles_id_fk FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_threads_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.outbox_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type ~ '^[a-z_]+\.[a-z_]+$'::text),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  schema_version integer NOT NULL DEFAULT 1,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  available_at timestamp with time zone NOT NULL DEFAULT now(),
  locked_until timestamp with time zone,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  processed_at timestamp with time zone,
  dead_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT outbox_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.processed_events (
  handler text NOT NULL,
  event_id uuid NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT processed_events_pkey PRIMARY KEY (handler, event_id),
  CONSTRAINT processed_events_event_id_outbox_events_id_fk FOREIGN KEY (event_id) REFERENCES public.outbox_events(id)
);
CREATE TABLE public.assessment_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL,
  worker_id uuid NOT NULL,
  delivery_language_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'invited'::text CHECK (status = ANY (ARRAY['invited'::text, 'in_progress'::text, 'submitted'::text, 'scored'::text, 'expired'::text, 'voided'::text])),
  context_type text,
  context_id uuid,
  started_at timestamp with time zone,
  submitted_at timestamp with time zone,
  scored_at timestamp with time zone,
  scored_by text,
  raw_score numeric,
  evaluation jsonb,
  evidence_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  identity_verification_id uuid,
  CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_attempts_worker_id_profiles_id_fk FOREIGN KEY (worker_id) REFERENCES public.profiles(id),
  CONSTRAINT assessment_attempts_delivery_language_id_languages_id_fk FOREIGN KEY (delivery_language_id) REFERENCES public.languages(id),
  CONSTRAINT assessment_attempts_evidence_id_evidence_id_fk FOREIGN KEY (evidence_id) REFERENCES public.evidence(id),
  CONSTRAINT assessment_attempts_version_id_assessment_versions_id_fk FOREIGN KEY (version_id) REFERENCES public.assessment_versions(id)
);
CREATE TABLE public.assessment_capabilities (
  version_id uuid NOT NULL,
  capability_id uuid NOT NULL,
  required boolean NOT NULL DEFAULT true,
  weight numeric NOT NULL DEFAULT 1 CHECK (weight > 0::numeric),
  context_level smallint NOT NULL CHECK (context_level >= 1 AND context_level <= 5),
  cut_scores jsonb NOT NULL,
  CONSTRAINT assessment_capabilities_pkey PRIMARY KEY (version_id, capability_id),
  CONSTRAINT assessment_capabilities_version_id_assessment_versions_id_fk FOREIGN KEY (version_id) REFERENCES public.assessment_versions(id),
  CONSTRAINT assessment_capabilities_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id)
);
CREATE TABLE public.assessment_lang_results (
  attempt_id uuid NOT NULL,
  language_id uuid NOT NULL,
  modality text NOT NULL CHECK (modality = ANY (ARRAY['reading'::text, 'writing'::text, 'listening'::text, 'speaking'::text])),
  raw_score numeric NOT NULL CHECK (raw_score >= 0::numeric AND raw_score <= 1::numeric),
  demonstrated_level smallint NOT NULL CHECK (demonstrated_level >= 0 AND demonstrated_level <= 6),
  passed boolean NOT NULL,
  evaluation jsonb,
  CONSTRAINT assessment_lang_results_pkey PRIMARY KEY (attempt_id, language_id, modality),
  CONSTRAINT assessment_lang_results_attempt_id_assessment_attempts_id_fk FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id),
  CONSTRAINT assessment_lang_results_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.assessment_lang_targets (
  version_id uuid NOT NULL,
  language_id uuid NOT NULL,
  modality text NOT NULL CHECK (modality = ANY (ARRAY['reading'::text, 'writing'::text, 'listening'::text, 'speaking'::text])),
  weight numeric NOT NULL DEFAULT 1 CHECK (weight > 0::numeric),
  context_level smallint NOT NULL CHECK (context_level >= 1 AND context_level <= 6),
  cut_scores jsonb NOT NULL,
  CONSTRAINT assessment_lang_targets_pkey PRIMARY KEY (version_id, language_id, modality),
  CONSTRAINT assessment_lang_targets_version_id_assessment_versions_id_fk FOREIGN KEY (version_id) REFERENCES public.assessment_versions(id),
  CONSTRAINT assessment_lang_targets_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.assessment_results (
  attempt_id uuid NOT NULL,
  capability_id uuid NOT NULL,
  raw_score numeric NOT NULL CHECK (raw_score >= 0::numeric AND raw_score <= 1::numeric),
  demonstrated_level smallint NOT NULL CHECK (demonstrated_level >= 0 AND demonstrated_level <= 5),
  passed boolean NOT NULL,
  evaluation jsonb,
  CONSTRAINT assessment_results_pkey PRIMARY KEY (attempt_id, capability_id),
  CONSTRAINT assessment_results_attempt_id_assessment_attempts_id_fk FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id),
  CONSTRAINT assessment_results_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id)
);
CREATE TABLE public.assessment_translations (
  version_id uuid NOT NULL,
  language_id uuid NOT NULL,
  title text NOT NULL,
  instructions text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  is_machine_translated boolean NOT NULL DEFAULT false,
  source_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assessment_translations_pkey PRIMARY KEY (version_id, language_id),
  CONSTRAINT assessment_translations_version_id_assessment_versions_id_fk FOREIGN KEY (version_id) REFERENCES public.assessment_versions(id),
  CONSTRAINT assessment_translations_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.assessment_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  version integer NOT NULL CHECK (version >= 1),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'retired'::text])),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration_minutes integer,
  published_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assessment_versions_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_versions_assessment_id_assessments_id_fk FOREIGN KEY (assessment_id) REFERENCES public.assessments(id),
  CONSTRAINT assessment_versions_created_by_profiles_id_fk FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL CHECK (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind = ANY (ARRAY['knowledge_quiz'::text, 'practical_task'::text, 'work_sample'::text, 'interview'::text, 'cognitive'::text, 'language_test'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'retired'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assessments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.evidence (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind = ANY (ARRAY['assessment_result'::text, 'work_outcome'::text, 'certification'::text, 'education'::text, 'experience'::text, 'portfolio'::text, 'peer_review'::text, 'client_review'::text, 'self_declared'::text, 'admin_adjustment'::text])),
  title text NOT NULL,
  description text,
  context_type text,
  context_id uuid,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  recorded_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT evidence_pkey PRIMARY KEY (id),
  CONSTRAINT evidence_worker_id_profiles_id_fk FOREIGN KEY (worker_id) REFERENCES public.profiles(id),
  CONSTRAINT evidence_recorded_by_profiles_id_fk FOREIGN KEY (recorded_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.evidence_capabilities (
  evidence_id uuid NOT NULL,
  capability_id uuid NOT NULL,
  context_level smallint CHECK (context_level IS NULL OR context_level >= 0 AND context_level <= 5),
  demonstrated_level smallint NOT NULL CHECK (demonstrated_level >= 0 AND demonstrated_level <= 5),
  quality numeric CHECK (quality IS NULL OR quality >= 0::numeric AND quality <= 1::numeric),
  weight numeric NOT NULL DEFAULT 1 CHECK (weight > 0::numeric AND weight <= 1::numeric),
  notes text,
  CONSTRAINT evidence_capabilities_pkey PRIMARY KEY (evidence_id, capability_id),
  CONSTRAINT evidence_capabilities_evidence_id_evidence_id_fk FOREIGN KEY (evidence_id) REFERENCES public.evidence(id),
  CONSTRAINT evidence_capabilities_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id)
);
CREATE TABLE public.evidence_languages (
  evidence_id uuid NOT NULL,
  language_id uuid NOT NULL,
  modality text NOT NULL CHECK (modality = ANY (ARRAY['reading'::text, 'writing'::text, 'listening'::text, 'speaking'::text])),
  context_level smallint CHECK (context_level IS NULL OR context_level >= 0 AND context_level <= 6),
  demonstrated_level smallint NOT NULL CHECK (demonstrated_level >= 0 AND demonstrated_level <= 6),
  weight numeric NOT NULL DEFAULT 1 CHECK (weight > 0::numeric AND weight <= 1::numeric),
  notes text,
  CONSTRAINT evidence_languages_pkey PRIMARY KEY (evidence_id, language_id, modality),
  CONSTRAINT evidence_languages_evidence_id_evidence_id_fk FOREIGN KEY (evidence_id) REFERENCES public.evidence(id),
  CONSTRAINT evidence_languages_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.evidence_retractions (
  evidence_id uuid NOT NULL,
  reason text NOT NULL,
  retracted_by uuid,
  retracted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT evidence_retractions_pkey PRIMARY KEY (evidence_id),
  CONSTRAINT evidence_retractions_evidence_id_evidence_id_fk FOREIGN KEY (evidence_id) REFERENCES public.evidence(id),
  CONSTRAINT evidence_retractions_retracted_by_profiles_id_fk FOREIGN KEY (retracted_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.worker_capabilities (
  worker_id uuid NOT NULL,
  capability_id uuid NOT NULL,
  level numeric NOT NULL CHECK (level >= 0::numeric AND level <= 5::numeric),
  confidence numeric NOT NULL CHECK (confidence >= 0::numeric AND confidence <= 1::numeric),
  evidence_count integer NOT NULL CHECK (evidence_count >= 1),
  last_evidence_at timestamp with time zone NOT NULL,
  projection_version integer NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT worker_capabilities_pkey PRIMARY KEY (worker_id, capability_id),
  CONSTRAINT worker_capabilities_worker_id_profiles_id_fk FOREIGN KEY (worker_id) REFERENCES public.profiles(id),
  CONSTRAINT worker_capabilities_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id)
);
CREATE TABLE public.worker_language_proficiency (
  worker_id uuid NOT NULL,
  language_id uuid NOT NULL,
  modality text NOT NULL CHECK (modality = ANY (ARRAY['reading'::text, 'writing'::text, 'listening'::text, 'speaking'::text])),
  level numeric NOT NULL CHECK (level >= 0::numeric AND level <= 6::numeric),
  confidence numeric NOT NULL CHECK (confidence >= 0::numeric AND confidence <= 1::numeric),
  evidence_count integer NOT NULL CHECK (evidence_count >= 1),
  last_evidence_at timestamp with time zone NOT NULL,
  projection_version integer NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT worker_language_proficiency_pkey PRIMARY KEY (worker_id, language_id, modality),
  CONSTRAINT wlp_worker_language_fk FOREIGN KEY (worker_id) REFERENCES public.worker_languages(worker_id),
  CONSTRAINT wlp_worker_language_fk FOREIGN KEY (language_id) REFERENCES public.worker_languages(language_id)
);
CREATE TABLE public.worker_languages (
  worker_id uuid NOT NULL,
  language_id uuid NOT NULL,
  acquisition text NOT NULL CHECK (acquisition = ANY (ARRAY['native'::text, 'learned'::text])),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT worker_languages_pkey PRIMARY KEY (worker_id, language_id),
  CONSTRAINT worker_languages_worker_id_profiles_id_fk FOREIGN KEY (worker_id) REFERENCES public.profiles(id),
  CONSTRAINT worker_languages_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.acceptances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  decision text NOT NULL CHECK (decision = ANY (ARRAY['accepted'::text, 'rejected'::text, 'revision_requested'::text])),
  quality numeric CHECK (quality IS NULL OR quality >= 0::numeric AND quality <= 1::numeric),
  feedback text,
  decided_by uuid,
  decided_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT acceptances_pkey PRIMARY KEY (id),
  CONSTRAINT acceptances_submission_id_submissions_id_fk FOREIGN KEY (submission_id) REFERENCES public.submissions(id),
  CONSTRAINT acceptances_decided_by_profiles_id_fk FOREIGN KEY (decided_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_package_id uuid NOT NULL,
  worker_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'offered'::text CHECK (status = ANY (ARRAY['offered'::text, 'accepted'::text, 'active'::text, 'completed'::text, 'declined'::text, 'withdrawn'::text, 'terminated'::text])),
  agreed_amount bigint NOT NULL CHECK (agreed_amount >= 0),
  currency text NOT NULL DEFAULT 'XAF'::text CHECK (currency ~ '^[A-Z]{3}$'::text),
  agreed_hours integer CHECK (agreed_hours IS NULL OR agreed_hours >= 0),
  due_at timestamp with time zone,
  source_match_id uuid,
  offered_by uuid,
  offered_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assignments_work_package_id_work_packages_id_fk FOREIGN KEY (work_package_id) REFERENCES public.work_packages(id),
  CONSTRAINT assignments_worker_id_worker_profiles_profile_id_fk FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(profile_id),
  CONSTRAINT assignments_offered_by_profiles_id_fk FOREIGN KEY (offered_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_request_id uuid NOT NULL,
  sequence integer NOT NULL CHECK (sequence >= 1),
  title text NOT NULL,
  description text,
  acceptance_criteria text,
  due_at timestamp with time zone,
  budget_amount bigint NOT NULL CHECK (budget_amount >= 0),
  currency text NOT NULL DEFAULT 'XAF'::text CHECK (currency ~ '^[A-Z]{3}$'::text),
  status text NOT NULL DEFAULT 'planned'::text CHECK (status = ANY (ARRAY['planned'::text, 'funded'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT milestones_pkey PRIMARY KEY (id),
  CONSTRAINT milestones_work_request_id_work_requests_id_fk FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id)
);
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  version integer NOT NULL CHECK (version >= 1),
  summary text,
  storage_path text,
  external_url text CHECK (external_url IS NULL OR external_url ~ '^https?://'::text),
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_assignment_id_assignments_id_fk FOREIGN KEY (assignment_id) REFERENCES public.assignments(id)
);
CREATE TABLE public.work_package_capabilities (
  work_package_id uuid NOT NULL,
  capability_id uuid NOT NULL,
  minimum_level smallint NOT NULL CHECK (minimum_level >= 1 AND minimum_level <= 5),
  weight numeric NOT NULL DEFAULT 1 CHECK (weight > 0::numeric AND weight <= 1::numeric),
  is_critical boolean NOT NULL DEFAULT false,
  required_confidence numeric CHECK (required_confidence IS NULL OR required_confidence >= 0::numeric AND required_confidence <= 1::numeric),
  notes text,
  CONSTRAINT work_package_capabilities_pkey PRIMARY KEY (work_package_id, capability_id),
  CONSTRAINT work_package_capabilities_work_package_id_work_packages_id_fk FOREIGN KEY (work_package_id) REFERENCES public.work_packages(id),
  CONSTRAINT work_package_capabilities_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id)
);
CREATE TABLE public.work_package_languages (
  work_package_id uuid NOT NULL,
  language_id uuid NOT NULL,
  modality text NOT NULL CHECK (modality = ANY (ARRAY['reading'::text, 'writing'::text, 'listening'::text, 'speaking'::text])),
  minimum_level smallint NOT NULL CHECK (minimum_level >= 1 AND minimum_level <= 6),
  weight numeric NOT NULL DEFAULT 1 CHECK (weight > 0::numeric AND weight <= 1::numeric),
  is_critical boolean NOT NULL DEFAULT false,
  CONSTRAINT work_package_languages_pkey PRIMARY KEY (work_package_id, language_id, modality),
  CONSTRAINT work_package_languages_work_package_id_work_packages_id_fk FOREIGN KEY (work_package_id) REFERENCES public.work_packages(id),
  CONSTRAINT work_package_languages_language_id_languages_id_fk FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.work_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_request_id uuid NOT NULL,
  parent_id uuid,
  milestone_id uuid,
  title text NOT NULL,
  description text NOT NULL,
  acceptance_criteria text,
  sequence integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'proposed'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  origin text NOT NULL DEFAULT 'human'::text CHECK (origin = ANY (ARRAY['human'::text, 'ai'::text])),
  created_by uuid,
  estimated_hours integer CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
  starts_at timestamp with time zone,
  due_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT work_packages_pkey PRIMARY KEY (id),
  CONSTRAINT work_packages_work_request_id_work_requests_id_fk FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id),
  CONSTRAINT work_packages_created_by_profiles_id_fk FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT work_packages_milestone_fk FOREIGN KEY (milestone_id) REFERENCES public.milestones(id),
  CONSTRAINT work_packages_milestone_fk FOREIGN KEY (work_request_id) REFERENCES public.milestones(work_request_id),
  CONSTRAINT work_packages_parent_fk FOREIGN KEY (parent_id) REFERENCES public.work_packages(id),
  CONSTRAINT work_packages_parent_fk FOREIGN KEY (work_request_id) REFERENCES public.work_packages(work_request_id)
);
CREATE TABLE public.work_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  problem_statement text NOT NULL,
  desired_outcome text,
  source_language_id uuid,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'decomposing'::text, 'structured'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT work_requests_pkey PRIMARY KEY (id),
  CONSTRAINT work_requests_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT work_requests_created_by_profiles_id_fk FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT work_requests_source_language_id_languages_id_fk FOREIGN KEY (source_language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.access_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_key text NOT NULL CHECK (role_key ~ '^[a-z][a-z0-9_]*$'::text),
  scope text NOT NULL CHECK (scope = ANY (ARRAY['platform'::text, 'organization'::text])),
  label text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT access_roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.access_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  permission_key text NOT NULL CHECK (permission_key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'::text),
  resource text NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT access_permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.access_role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT access_role_permissions_pkey PRIMARY KEY (role_id, permission_id),
  CONSTRAINT access_role_permissions_role_id_access_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.access_roles(id),
  CONSTRAINT access_role_permissions_permission_id_access_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES public.access_permissions(id)
);
CREATE TABLE public.user_role_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  role_id uuid NOT NULL,
  organization_id uuid,
  granted_by uuid,
  reason text,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  revoked_by uuid,
  revocation_reason text,
  CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT user_role_assignments_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT user_role_assignments_role_id_access_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.access_roles(id),
  CONSTRAINT user_role_assignments_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT user_role_assignments_granted_by_profiles_id_fk FOREIGN KEY (granted_by) REFERENCES public.profiles(id),
  CONSTRAINT user_role_assignments_revoked_by_profiles_id_fk FOREIGN KEY (revoked_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.agency_representations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agency_organization_id uuid NOT NULL,
  talent_profile_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending_consent'::text CHECK (status = ANY (ARRAY['pending_consent'::text, 'active'::text, 'suspended'::text, 'revoked'::text, 'expired'::text])),
  scopes ARRAY NOT NULL DEFAULT ARRAY[]::text[] CHECK (scopes <@ ARRAY['view_profile'::text, 'view_private_evidence'::text, 'manage_availability'::text, 'submit_proposals'::text, 'negotiate_terms'::text, 'accept_assignments'::text]),
  requested_by uuid NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  consented_by uuid,
  consented_at timestamp with time zone,
  consent_expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT agency_representations_pkey PRIMARY KEY (id),
  CONSTRAINT agency_representations_talent_profile_id_profiles_id_fk FOREIGN KEY (talent_profile_id) REFERENCES public.profiles(id),
  CONSTRAINT agency_representations_requested_by_profiles_id_fk FOREIGN KEY (requested_by) REFERENCES public.profiles(id),
  CONSTRAINT agency_representations_consented_by_profiles_id_fk FOREIGN KEY (consented_by) REFERENCES public.profiles(id),
  CONSTRAINT agency_representations_agency_organization_id_organizations_id_ FOREIGN KEY (agency_organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.identity_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'expired'::text, 'revoked'::text])),
  method text NOT NULL CHECK (method = ANY (ARRAY['provider'::text, 'document_review'::text, 'in_person'::text, 'other'::text])),
  provider text,
  external_reference text,
  verified_at timestamp with time zone,
  expires_at timestamp with time zone,
  reviewed_by uuid,
  decision_reason text,
  consented_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT identity_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT identity_verifications_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT identity_verifications_reviewed_by_profiles_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.ai_interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  prompt_key text NOT NULL,
  prompt_version text NOT NULL,
  model_provider text,
  model_id text,
  status text NOT NULL DEFAULT 'created'::text CHECK (status = ANY (ARRAY['created'::text, 'in_progress'::text, 'completed'::text, 'interrupted'::text, 'failed'::text, 'voided'::text])),
  language_code text NOT NULL DEFAULT 'en'::text CHECK (language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'::text),
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  evaluation jsonb,
  review_status text NOT NULL DEFAULT 'not_required'::text CHECK (review_status = ANY (ARRAY['not_required'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'appealed'::text])),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_interviews_pkey PRIMARY KEY (id),
  CONSTRAINT ai_interviews_attempt_id_assessment_attempts_id_fk FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id)
);
CREATE TABLE public.capability_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  capability_id uuid NOT NULL,
  claimed_level integer CHECK (claimed_level IS NULL OR claimed_level >= 0 AND claimed_level <= 5),
  description text,
  evidence_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'self_reported'::text CHECK (status = ANY (ARRAY['self_reported'::text, 'evidence_assessed'::text, 'verified'::text, 'disputed'::text, 'withdrawn'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT capability_claims_pkey PRIMARY KEY (id),
  CONSTRAINT capability_claims_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT capability_claims_capability_id_capabilities_id_fk FOREIGN KEY (capability_id) REFERENCES public.capabilities(id)
);
CREATE TABLE public.capability_gap_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['role'::text, 'work_package'::text, 'learning_goal'::text])),
  target_key text NOT NULL,
  target_description text,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  analysis jsonb NOT NULL,
  prompt_version text NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'ready'::text, 'review_required'::text, 'superseded'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT capability_gap_analyses_pkey PRIMARY KEY (id),
  CONSTRAINT capability_gap_analyses_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.learning_roadmaps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  gap_analysis_id uuid NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  target_date timestamp with time zone,
  estimated_hours integer CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'proposed'::text CHECK (status = ANY (ARRAY['proposed'::text, 'active'::text, 'paused'::text, 'completed'::text, 'superseded'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT learning_roadmaps_pkey PRIMARY KEY (id),
  CONSTRAINT learning_roadmaps_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT learning_roadmaps_gap_analysis_id_capability_gap_analyses_id_fk FOREIGN KEY (gap_analysis_id) REFERENCES public.capability_gap_analyses(id)
);