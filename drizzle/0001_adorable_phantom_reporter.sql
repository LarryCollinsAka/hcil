CREATE TABLE "assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"worker_id" uuid NOT NULL,
	"delivery_language_id" uuid NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"context_type" text,
	"context_id" uuid,
	"started_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"scored_at" timestamp with time zone,
	"scored_by" text,
	"raw_score" numeric(5, 4),
	"evaluation" jsonb,
	"evidence_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_attempts_status_ck" CHECK ("assessment_attempts"."status" in ('invited', 'in_progress', 'submitted', 'scored', 'expired', 'voided')),
	CONSTRAINT "assessment_attempts_context_ck" CHECK (("assessment_attempts"."context_type" is null) = ("assessment_attempts"."context_id" is null)),
	CONSTRAINT "assessment_attempts_scored_ck" CHECK ("assessment_attempts"."status" <> 'scored' or ("assessment_attempts"."scored_at" is not null and "assessment_attempts"."evidence_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "assessment_capabilities" (
	"version_id" uuid NOT NULL,
	"capability_id" uuid NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"weight" numeric(4, 3) DEFAULT 1 NOT NULL,
	"context_level" smallint NOT NULL,
	"cut_scores" jsonb NOT NULL,
	CONSTRAINT "assessment_capabilities_version_id_capability_id_pk" PRIMARY KEY("version_id","capability_id"),
	CONSTRAINT "assessment_capabilities_context_ck" CHECK ("assessment_capabilities"."context_level" between 1 and 5),
	CONSTRAINT "assessment_capabilities_weight_ck" CHECK ("assessment_capabilities"."weight" > 0)
);
--> statement-breakpoint
CREATE TABLE "assessment_lang_results" (
	"attempt_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"modality" text NOT NULL,
	"raw_score" numeric(5, 4) NOT NULL,
	"demonstrated_level" smallint NOT NULL,
	"passed" boolean NOT NULL,
	"evaluation" jsonb,
	CONSTRAINT "assessment_lang_results_attempt_id_language_id_modality_pk" PRIMARY KEY("attempt_id","language_id","modality"),
	CONSTRAINT "assessment_lang_results_modality_ck" CHECK ("assessment_lang_results"."modality" in ('reading', 'writing', 'listening', 'speaking')),
	CONSTRAINT "assessment_lang_results_score_ck" CHECK ("assessment_lang_results"."raw_score" between 0 and 1),
	CONSTRAINT "assessment_lang_results_level_ck" CHECK ("assessment_lang_results"."demonstrated_level" between 0 and 6)
);
--> statement-breakpoint
CREATE TABLE "assessment_lang_targets" (
	"version_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"modality" text NOT NULL,
	"weight" numeric(4, 3) DEFAULT 1 NOT NULL,
	"context_level" smallint NOT NULL,
	"cut_scores" jsonb NOT NULL,
	CONSTRAINT "assessment_lang_targets_version_id_language_id_modality_pk" PRIMARY KEY("version_id","language_id","modality"),
	CONSTRAINT "assessment_lang_targets_modality_ck" CHECK ("assessment_lang_targets"."modality" in ('reading', 'writing', 'listening', 'speaking')),
	CONSTRAINT "assessment_lang_targets_context_ck" CHECK ("assessment_lang_targets"."context_level" between 1 and 6),
	CONSTRAINT "assessment_lang_targets_weight_ck" CHECK ("assessment_lang_targets"."weight" > 0)
);
--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"attempt_id" uuid NOT NULL,
	"capability_id" uuid NOT NULL,
	"raw_score" numeric(5, 4) NOT NULL,
	"demonstrated_level" smallint NOT NULL,
	"passed" boolean NOT NULL,
	"evaluation" jsonb,
	CONSTRAINT "assessment_results_attempt_id_capability_id_pk" PRIMARY KEY("attempt_id","capability_id"),
	CONSTRAINT "assessment_results_score_ck" CHECK ("assessment_results"."raw_score" between 0 and 1),
	CONSTRAINT "assessment_results_level_ck" CHECK ("assessment_results"."demonstrated_level" between 0 and 5)
);
--> statement-breakpoint
CREATE TABLE "assessment_translations" (
	"version_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"title" text NOT NULL,
	"instructions" text,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_machine_translated" boolean DEFAULT false NOT NULL,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_translations_version_id_language_id_pk" PRIMARY KEY("version_id","language_id"),
	CONSTRAINT "assessment_translations_status_ck" CHECK ("assessment_translations"."status" in ('draft', 'review', 'published'))
);
--> statement-breakpoint
CREATE TABLE "assessment_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"duration_minutes" integer,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_versions_version_ck" CHECK ("assessment_versions"."version" >= 1),
	CONSTRAINT "assessment_versions_status_ck" CHECK ("assessment_versions"."status" in ('draft', 'published', 'retired')),
	CONSTRAINT "assessment_versions_published_ck" CHECK ("assessment_versions"."status" = 'draft' or "assessment_versions"."published_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessments_key_ck" CHECK ("assessments"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "assessments_kind_ck" CHECK ("assessments"."kind" in ('knowledge_quiz', 'practical_task', 'work_sample', 'interview', 'cognitive', 'language_test')),
	CONSTRAINT "assessments_status_ck" CHECK ("assessments"."status" in ('active', 'retired'))
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"context_type" text,
	"context_id" uuid,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"recorded_by" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_kind_ck" CHECK ("evidence"."kind" in ('assessment_result', 'work_outcome', 'certification', 'education', 'experience', 'portfolio', 'peer_review', 'client_review', 'self_declared', 'admin_adjustment')),
	CONSTRAINT "evidence_context_ck" CHECK (("evidence"."context_type" is null) = ("evidence"."context_id" is null)),
	CONSTRAINT "evidence_expiry_ck" CHECK ("evidence"."expires_at" is null or "evidence"."expires_at" > "evidence"."issued_at"),
	CONSTRAINT "evidence_admin_ck" CHECK ("evidence"."kind" <> 'admin_adjustment' or "evidence"."description" is not null)
);
--> statement-breakpoint
CREATE TABLE "evidence_capabilities" (
	"evidence_id" uuid NOT NULL,
	"capability_id" uuid NOT NULL,
	"context_level" smallint,
	"demonstrated_level" smallint NOT NULL,
	"quality" numeric(3, 2),
	"weight" numeric(4, 3) DEFAULT 1 NOT NULL,
	"notes" text,
	CONSTRAINT "evidence_capabilities_evidence_id_capability_id_pk" PRIMARY KEY("evidence_id","capability_id"),
	CONSTRAINT "evidence_capabilities_demonstrated_ck" CHECK ("evidence_capabilities"."demonstrated_level" between 0 and 5),
	CONSTRAINT "evidence_capabilities_context_ck" CHECK ("evidence_capabilities"."context_level" is null or "evidence_capabilities"."context_level" between 0 and 5),
	CONSTRAINT "evidence_capabilities_within_context_ck" CHECK ("evidence_capabilities"."context_level" is null or "evidence_capabilities"."demonstrated_level" <= "evidence_capabilities"."context_level"),
	CONSTRAINT "evidence_capabilities_quality_ck" CHECK ("evidence_capabilities"."quality" is null or "evidence_capabilities"."quality" between 0 and 1),
	CONSTRAINT "evidence_capabilities_weight_ck" CHECK ("evidence_capabilities"."weight" > 0 and "evidence_capabilities"."weight" <= 1)
);
--> statement-breakpoint
CREATE TABLE "evidence_languages" (
	"evidence_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"modality" text NOT NULL,
	"context_level" smallint,
	"demonstrated_level" smallint NOT NULL,
	"weight" numeric(4, 3) DEFAULT 1 NOT NULL,
	"notes" text,
	CONSTRAINT "evidence_languages_evidence_id_language_id_modality_pk" PRIMARY KEY("evidence_id","language_id","modality"),
	CONSTRAINT "evidence_languages_modality_ck" CHECK ("evidence_languages"."modality" in ('reading', 'writing', 'listening', 'speaking')),
	CONSTRAINT "evidence_languages_demonstrated_ck" CHECK ("evidence_languages"."demonstrated_level" between 0 and 6),
	CONSTRAINT "evidence_languages_context_ck" CHECK ("evidence_languages"."context_level" is null or "evidence_languages"."context_level" between 0 and 6),
	CONSTRAINT "evidence_languages_within_context_ck" CHECK ("evidence_languages"."context_level" is null or "evidence_languages"."demonstrated_level" <= "evidence_languages"."context_level"),
	CONSTRAINT "evidence_languages_weight_ck" CHECK ("evidence_languages"."weight" > 0 and "evidence_languages"."weight" <= 1)
);
--> statement-breakpoint
CREATE TABLE "evidence_retractions" (
	"evidence_id" uuid PRIMARY KEY NOT NULL,
	"reason" text NOT NULL,
	"retracted_by" uuid,
	"retracted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_capabilities" (
	"worker_id" uuid NOT NULL,
	"capability_id" uuid NOT NULL,
	"level" numeric(3, 2) NOT NULL,
	"confidence" numeric(3, 2) NOT NULL,
	"evidence_count" integer NOT NULL,
	"last_evidence_at" timestamp with time zone NOT NULL,
	"projection_version" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worker_capabilities_worker_id_capability_id_pk" PRIMARY KEY("worker_id","capability_id"),
	CONSTRAINT "worker_capabilities_level_ck" CHECK ("worker_capabilities"."level" between 0 and 5),
	CONSTRAINT "worker_capabilities_confidence_ck" CHECK ("worker_capabilities"."confidence" between 0 and 1),
	CONSTRAINT "worker_capabilities_count_ck" CHECK ("worker_capabilities"."evidence_count" >= 1)
);
--> statement-breakpoint
CREATE TABLE "worker_language_proficiency" (
	"worker_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"modality" text NOT NULL,
	"level" numeric(3, 2) NOT NULL,
	"confidence" numeric(3, 2) NOT NULL,
	"evidence_count" integer NOT NULL,
	"last_evidence_at" timestamp with time zone NOT NULL,
	"projection_version" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worker_language_proficiency_worker_id_language_id_modality_pk" PRIMARY KEY("worker_id","language_id","modality"),
	CONSTRAINT "worker_language_proficiency_modality_ck" CHECK ("worker_language_proficiency"."modality" in ('reading', 'writing', 'listening', 'speaking')),
	CONSTRAINT "worker_language_proficiency_level_ck" CHECK ("worker_language_proficiency"."level" between 0 and 6),
	CONSTRAINT "worker_language_proficiency_confidence_ck" CHECK ("worker_language_proficiency"."confidence" between 0 and 1),
	CONSTRAINT "worker_language_proficiency_count_ck" CHECK ("worker_language_proficiency"."evidence_count" >= 1)
);
--> statement-breakpoint
CREATE TABLE "worker_languages" (
	"worker_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"acquisition" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worker_languages_worker_id_language_id_pk" PRIMARY KEY("worker_id","language_id"),
	CONSTRAINT "worker_languages_acquisition_ck" CHECK ("worker_languages"."acquisition" in ('native', 'learned'))
);
--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_version_id_assessment_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_worker_id_profiles_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_delivery_language_id_languages_id_fk" FOREIGN KEY ("delivery_language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_capabilities" ADD CONSTRAINT "assessment_capabilities_version_id_assessment_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_capabilities" ADD CONSTRAINT "assessment_capabilities_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_lang_results" ADD CONSTRAINT "assessment_lang_results_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_lang_results" ADD CONSTRAINT "assessment_lang_results_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_lang_targets" ADD CONSTRAINT "assessment_lang_targets_version_id_assessment_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_lang_targets" ADD CONSTRAINT "assessment_lang_targets_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_translations" ADD CONSTRAINT "assessment_translations_version_id_assessment_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_translations" ADD CONSTRAINT "assessment_translations_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_versions" ADD CONSTRAINT "assessment_versions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_versions" ADD CONSTRAINT "assessment_versions_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_worker_id_profiles_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_recorded_by_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_capabilities" ADD CONSTRAINT "evidence_capabilities_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_capabilities" ADD CONSTRAINT "evidence_capabilities_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_languages" ADD CONSTRAINT "evidence_languages_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_languages" ADD CONSTRAINT "evidence_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_retractions" ADD CONSTRAINT "evidence_retractions_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_retractions" ADD CONSTRAINT "evidence_retractions_retracted_by_profiles_id_fk" FOREIGN KEY ("retracted_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_capabilities" ADD CONSTRAINT "worker_capabilities_worker_id_profiles_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_capabilities" ADD CONSTRAINT "worker_capabilities_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_language_proficiency" ADD CONSTRAINT "wlp_worker_language_fk" FOREIGN KEY ("worker_id","language_id") REFERENCES "public"."worker_languages"("worker_id","language_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_languages" ADD CONSTRAINT "worker_languages_worker_id_profiles_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_languages" ADD CONSTRAINT "worker_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessment_attempts_worker_idx" ON "assessment_attempts" USING btree ("worker_id","created_at");--> statement-breakpoint
CREATE INDEX "assessment_attempts_version_idx" ON "assessment_attempts" USING btree ("version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_attempts_evidence_uq" ON "assessment_attempts" USING btree ("evidence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_versions_uq" ON "assessment_versions" USING btree ("assessment_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "assessments_key_uq" ON "assessments" USING btree ("key");--> statement-breakpoint
CREATE INDEX "evidence_worker_idx" ON "evidence" USING btree ("worker_id","issued_at");--> statement-breakpoint
CREATE INDEX "evidence_context_idx" ON "evidence" USING btree ("context_type","context_id");--> statement-breakpoint
CREATE INDEX "evidence_capabilities_capability_idx" ON "evidence_capabilities" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "evidence_languages_language_idx" ON "evidence_languages" USING btree ("language_id","modality");--> statement-breakpoint
CREATE INDEX "worker_capabilities_lookup_idx" ON "worker_capabilities" USING btree ("capability_id","level");--> statement-breakpoint
CREATE INDEX "worker_language_proficiency_lookup_idx" ON "worker_language_proficiency" USING btree ("language_id","modality","level");--> statement-breakpoint
CREATE UNIQUE INDEX "worker_languages_one_primary_uq" ON "worker_languages" USING btree ("worker_id") WHERE "worker_languages"."is_primary" = true;