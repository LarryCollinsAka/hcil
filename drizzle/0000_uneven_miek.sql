CREATE TYPE "public"."org_member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('admin', 'editor', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."forum_post_status" AS ENUM('visible', 'hidden', 'removed');--> statement-breakpoint
CREATE TYPE "public"."forum_report_status" AS ENUM('open', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."forum_thread_status" AS ENUM('open', 'locked', 'hidden');--> statement-breakpoint
CREATE TABLE "capabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"replaced_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capabilities_slug_ck" CHECK ("capabilities"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "capabilities_status_ck" CHECK ("capabilities"."status" in ('draft', 'review', 'active', 'deprecated')),
	CONSTRAINT "capabilities_replaced_ck" CHECK ("capabilities"."replaced_by_id" is null or ("capabilities"."status" = 'deprecated' and "capabilities"."replaced_by_id" <> "capabilities"."id"))
);
--> statement-breakpoint
CREATE TABLE "capability_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capability_id" uuid NOT NULL,
	"language_id" uuid,
	"alias" text NOT NULL,
	"normalized_alias" text GENERATED ALWAYS AS (lower(btrim(alias))) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capability_domain_translations" (
	"domain_id" uuid NOT NULL,
	"locale_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_machine_translated" boolean DEFAULT false NOT NULL,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capability_domain_translations_domain_id_locale_id_pk" PRIMARY KEY("domain_id","locale_id"),
	CONSTRAINT "capability_domain_translations_status_ck" CHECK ("capability_domain_translations"."status" in ('draft', 'review', 'published'))
);
--> statement-breakpoint
CREATE TABLE "capability_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capability_domains_slug_ck" CHECK ("capability_domains"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "capability_domains_status_ck" CHECK ("capability_domains"."status" in ('draft', 'active', 'deprecated')),
	CONSTRAINT "capability_domains_parent_ck" CHECK ("capability_domains"."parent_id" is null or "capability_domains"."parent_id" <> "capability_domains"."id")
);
--> statement-breakpoint
CREATE TABLE "capability_translations" (
	"capability_id" uuid NOT NULL,
	"locale_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_machine_translated" boolean DEFAULT false NOT NULL,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capability_translations_capability_id_locale_id_pk" PRIMARY KEY("capability_id","locale_id"),
	CONSTRAINT "capability_translations_status_ck" CHECK ("capability_translations"."status" in ('draft', 'review', 'published'))
);
--> statement-breakpoint
CREATE TABLE "language_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"normalized_alias" text GENERATED ALWAYS AS (lower(btrim(alias))) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"iso_639_3" text NOT NULL,
	"iso_639_1" text,
	"name" text NOT NULL,
	"native_name" text,
	"family" text,
	"scope" text DEFAULT 'individual' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"replaced_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "languages_iso_639_3_ck" CHECK ("languages"."iso_639_3" ~ '^[a-z]{3}$'),
	CONSTRAINT "languages_iso_639_1_ck" CHECK ("languages"."iso_639_1" is null or "languages"."iso_639_1" ~ '^[a-z]{2}$'),
	CONSTRAINT "languages_scope_ck" CHECK ("languages"."scope" in ('individual', 'macrolanguage')),
	CONSTRAINT "languages_status_ck" CHECK ("languages"."status" in ('draft', 'active', 'deprecated')),
	CONSTRAINT "languages_replaced_ck" CHECK ("languages"."replaced_by_id" is null or ("languages"."status" = 'deprecated' and "languages"."replaced_by_id" <> "languages"."id"))
);
--> statement-breakpoint
CREATE TABLE "platform_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"tag" text NOT NULL,
	"normalized_tag" text GENERATED ALWAYS AS (lower(btrim(tag))) STORED,
	"label" text NOT NULL,
	"direction" text DEFAULT 'ltr' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"fallback_locale_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_locales_tag_ck" CHECK ("platform_locales"."tag" ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
	CONSTRAINT "platform_locales_direction_ck" CHECK ("platform_locales"."direction" in ('ltr', 'rtl')),
	CONSTRAINT "platform_locales_status_ck" CHECK ("platform_locales"."status" in ('draft', 'active', 'deprecated')),
	CONSTRAINT "platform_locales_default_active_ck" CHECK (not "platform_locales"."is_default" or "platform_locales"."status" = 'active'),
	CONSTRAINT "platform_locales_fallback_ck" CHECK ("platform_locales"."fallback_locale_id" is null or "platform_locales"."fallback_locale_id" <> "platform_locales"."id")
);
--> statement-breakpoint
CREATE TABLE "taxonomy_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"action" text NOT NULL,
	"before_data" jsonb,
	"after_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "taxonomy_audit_action_ck" CHECK ("taxonomy_audit_log"."action" in ('INSERT', 'UPDATE', 'DELETE'))
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"role" "org_member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_organization_id_profile_id_pk" PRIMARY KEY("organization_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"country_code" text DEFAULT 'CM' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_country_ck" CHECK ("organizations"."country_code" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"locale_id" uuid,
	"timezone" text,
	"anonymized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_phone_ck" CHECK ("profiles"."phone" is null or "profiles"."phone" ~ '^\+[1-9][0-9]{6,14}$')
);
--> statement-breakpoint
CREATE TABLE "staff_roles" (
	"profile_id" uuid NOT NULL,
	"role" "staff_role" NOT NULL,
	"granted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_roles_profile_id_role_pk" PRIMARY KEY("profile_id","role")
);
--> statement-breakpoint
CREATE TABLE "worker_profiles" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"headline" text,
	"bio" text,
	"country_code" text,
	"city" text,
	"available_hours_per_week" integer,
	"min_hourly_rate" integer,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worker_profiles_country_ck" CHECK ("worker_profiles"."country_code" is null or "worker_profiles"."country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "worker_profiles_hours_ck" CHECK ("worker_profiles"."available_hours_per_week" is null or "worker_profiles"."available_hours_per_week" between 0 and 168),
	CONSTRAINT "worker_profiles_rate_ck" CHECK ("worker_profiles"."min_hourly_rate" is null or "worker_profiles"."min_hourly_rate" >= 0)
);
--> statement-breakpoint
CREATE TABLE "page_translations" (
	"page_id" uuid NOT NULL,
	"locale_id" uuid NOT NULL,
	"path" text NOT NULL,
	"title" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blocks_version" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp with time zone,
	"updated_by" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_machine_translated" boolean DEFAULT false NOT NULL,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_translations_page_id_locale_id_pk" PRIMARY KEY("page_id","locale_id"),
	CONSTRAINT "page_translations_status_ck" CHECK ("page_translations"."status" in ('draft', 'review', 'published')),
	CONSTRAINT "page_translations_path_ck" CHECK ("page_translations"."path" like '/%'),
	CONSTRAINT "page_translations_published_ck" CHECK ("page_translations"."status" <> 'published' or "page_translations"."published_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"template" text DEFAULT 'default' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_key_ck" CHECK ("pages"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_categories_key_ck" CHECK ("post_categories"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "post_category_translations" (
	"category_id" uuid NOT NULL,
	"locale_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_machine_translated" boolean DEFAULT false NOT NULL,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_category_translations_category_id_locale_id_pk" PRIMARY KEY("category_id","locale_id"),
	CONSTRAINT "post_category_translations_slug_ck" CHECK ("post_category_translations"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "post_category_translations_status_ck" CHECK ("post_category_translations"."status" in ('draft', 'review', 'published'))
);
--> statement-breakpoint
CREATE TABLE "post_translations" (
	"post_id" uuid NOT NULL,
	"locale_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"body_markdown" text NOT NULL,
	"cover_alt" text,
	"meta_title" text,
	"meta_description" text,
	"published_at" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_machine_translated" boolean DEFAULT false NOT NULL,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_translations_post_id_locale_id_pk" PRIMARY KEY("post_id","locale_id"),
	CONSTRAINT "post_translations_slug_ck" CHECK ("post_translations"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "post_translations_status_ck" CHECK ("post_translations"."status" in ('draft', 'review', 'published')),
	CONSTRAINT "post_translations_published_ck" CHECK ("post_translations"."status" <> 'published' or "post_translations"."published_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid,
	"category_id" uuid,
	"source_locale_id" uuid NOT NULL,
	"cover_image_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_categories_key_ck" CHECK ("forum_categories"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "forum_category_translations" (
	"category_id" uuid NOT NULL,
	"locale_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_machine_translated" boolean DEFAULT false NOT NULL,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_category_translations_category_id_locale_id_pk" PRIMARY KEY("category_id","locale_id"),
	CONSTRAINT "forum_category_translations_slug_ck" CHECK ("forum_category_translations"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "forum_category_translations_status_ck" CHECK ("forum_category_translations"."status" in ('draft', 'review', 'published'))
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"author_id" uuid,
	"reply_to_post_id" uuid,
	"language_id" uuid NOT NULL,
	"body" text NOT NULL,
	"status" "forum_post_status" DEFAULT 'visible' NOT NULL,
	"edited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"reporter_id" uuid,
	"reason" text NOT NULL,
	"details" text,
	"status" "forum_report_status" DEFAULT 'open' NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_reports_reason_ck" CHECK ("forum_reports"."reason" in ('spam', 'abuse', 'off_topic', 'other'))
);
--> statement-breakpoint
CREATE TABLE "forum_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"author_id" uuid,
	"language_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "forum_thread_status" DEFAULT 'open' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"last_post_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_until" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"processed_at" timestamp with time zone,
	"dead_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outbox_events_type_ck" CHECK ("outbox_events"."type" ~ '^[a-z_]+\.[a-z_]+$'),
	CONSTRAINT "outbox_events_attempts_ck" CHECK ("outbox_events"."attempts" >= 0),
	CONSTRAINT "outbox_events_final_state_ck" CHECK (not ("outbox_events"."processed_at" is not null and "outbox_events"."dead_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "processed_events" (
	"handler" text NOT NULL,
	"event_id" uuid NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "processed_events_handler_event_id_pk" PRIMARY KEY("handler","event_id")
);
--> statement-breakpoint
ALTER TABLE "capabilities" ADD CONSTRAINT "capabilities_domain_id_capability_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."capability_domains"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capabilities" ADD CONSTRAINT "capabilities_replaced_by_id_capabilities_id_fk" FOREIGN KEY ("replaced_by_id") REFERENCES "public"."capabilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_aliases" ADD CONSTRAINT "capability_aliases_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_aliases" ADD CONSTRAINT "capability_aliases_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_domain_translations" ADD CONSTRAINT "capability_domain_translations_domain_id_capability_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."capability_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_domain_translations" ADD CONSTRAINT "capability_domain_translations_locale_id_platform_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_domains" ADD CONSTRAINT "capability_domains_parent_id_capability_domains_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."capability_domains"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_translations" ADD CONSTRAINT "capability_translations_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_translations" ADD CONSTRAINT "capability_translations_locale_id_platform_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_aliases" ADD CONSTRAINT "language_aliases_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "languages" ADD CONSTRAINT "languages_replaced_by_id_languages_id_fk" FOREIGN KEY ("replaced_by_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_locales" ADD CONSTRAINT "platform_locales_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_locales" ADD CONSTRAINT "platform_locales_fallback_locale_id_platform_locales_id_fk" FOREIGN KEY ("fallback_locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_locale_id_platform_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_roles" ADD CONSTRAINT "staff_roles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_roles" ADD CONSTRAINT "staff_roles_granted_by_profiles_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_locale_id_platform_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category_translations" ADD CONSTRAINT "post_category_translations_category_id_post_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category_translations" ADD CONSTRAINT "post_category_translations_locale_id_platform_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_locale_id_platform_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_post_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."post_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_source_locale_id_platform_locales_id_fk" FOREIGN KEY ("source_locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_category_translations" ADD CONSTRAINT "forum_category_translations_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_category_translations" ADD CONSTRAINT "forum_category_translations_locale_id_platform_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."platform_locales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_reply_to_post_id_forum_posts_id_fk" FOREIGN KEY ("reply_to_post_id") REFERENCES "public"."forum_posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_reporter_id_profiles_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_resolved_by_profiles_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_events" ADD CONSTRAINT "processed_events_event_id_outbox_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."outbox_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "capabilities_slug_uq" ON "capabilities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "capabilities_domain_idx" ON "capabilities" USING btree ("domain_id");--> statement-breakpoint
CREATE UNIQUE INDEX "capability_aliases_lang_norm_uq" ON "capability_aliases" USING btree ("language_id","normalized_alias");--> statement-breakpoint
CREATE UNIQUE INDEX "capability_aliases_neutral_norm_uq" ON "capability_aliases" USING btree ("normalized_alias") WHERE "capability_aliases"."language_id" is null;--> statement-breakpoint
CREATE INDEX "capability_aliases_cap_idx" ON "capability_aliases" USING btree ("capability_id");--> statement-breakpoint
CREATE UNIQUE INDEX "capability_domains_slug_uq" ON "capability_domains" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "capability_domains_parent_idx" ON "capability_domains" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "language_aliases_norm_lang_uq" ON "language_aliases" USING btree ("normalized_alias","language_id");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_iso_639_3_uq" ON "languages" USING btree ("iso_639_3");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_iso_639_1_uq" ON "languages" USING btree ("iso_639_1");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_locales_normalized_tag_uq" ON "platform_locales" USING btree ("normalized_tag");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_locales_one_default_uq" ON "platform_locales" USING btree ("is_default") WHERE "platform_locales"."is_default" = true;--> statement-breakpoint
CREATE INDEX "taxonomy_audit_entity_idx" ON "taxonomy_audit_log" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "organization_members_profile_idx" ON "organization_members" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_email_uq" ON "profiles" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_phone_uq" ON "profiles" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "page_translations_locale_path_uq" ON "page_translations" USING btree ("locale_id","path");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_key_uq" ON "pages" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "post_categories_key_uq" ON "post_categories" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "post_category_translations_locale_slug_uq" ON "post_category_translations" USING btree ("locale_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "post_translations_locale_slug_uq" ON "post_translations" USING btree ("locale_id","slug");--> statement-breakpoint
CREATE INDEX "post_translations_listing_idx" ON "post_translations" USING btree ("locale_id","status","published_at");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_categories_key_uq" ON "forum_categories" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_category_translations_locale_slug_uq" ON "forum_category_translations" USING btree ("locale_id","slug");--> statement-breakpoint
CREATE INDEX "forum_posts_thread_idx" ON "forum_posts" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "forum_posts_author_idx" ON "forum_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "forum_reports_status_idx" ON "forum_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "forum_threads_listing_idx" ON "forum_threads" USING btree ("category_id","last_post_at");--> statement-breakpoint
CREATE INDEX "forum_threads_language_idx" ON "forum_threads" USING btree ("language_id");--> statement-breakpoint
CREATE INDEX "forum_threads_author_idx" ON "forum_threads" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "outbox_events_pending_idx" ON "outbox_events" USING btree ("available_at") WHERE "outbox_events"."processed_at" is null and "outbox_events"."dead_at" is null;--> statement-breakpoint
CREATE INDEX "outbox_events_aggregate_idx" ON "outbox_events" USING btree ("aggregate_type","aggregate_id");