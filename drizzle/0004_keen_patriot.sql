CREATE TABLE "acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"decision" text NOT NULL,
	"quality" numeric(3, 2),
	"feedback" text,
	"decided_by" uuid,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "acceptances_decision_ck" CHECK ("acceptances"."decision" in ('accepted', 'rejected', 'revision_requested')),
	CONSTRAINT "acceptances_quality_ck" CHECK ("acceptances"."quality" is null or "acceptances"."quality" between 0 and 1)
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_package_id" uuid NOT NULL,
	"worker_id" uuid NOT NULL,
	"status" text DEFAULT 'offered' NOT NULL,
	"agreed_amount" bigint NOT NULL,
	"currency" text DEFAULT 'XAF' NOT NULL,
	"agreed_hours" integer,
	"due_at" timestamp with time zone,
	"source_match_id" uuid,
	"offered_by" uuid,
	"offered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignments_status_ck" CHECK ("assignments"."status" in ('offered', 'accepted', 'active', 'completed', 'declined', 'withdrawn', 'terminated')),
	CONSTRAINT "assignments_amount_ck" CHECK ("assignments"."agreed_amount" >= 0),
	CONSTRAINT "assignments_currency_ck" CHECK ("assignments"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "assignments_hours_ck" CHECK ("assignments"."agreed_hours" is null or "assignments"."agreed_hours" >= 0),
	CONSTRAINT "assignments_ended_ck" CHECK ("assignments"."status" in ('offered', 'accepted', 'active') or "assignments"."ended_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_request_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"acceptance_criteria" text,
	"due_at" timestamp with time zone,
	"budget_amount" bigint NOT NULL,
	"currency" text DEFAULT 'XAF' NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestones_id_request_uq" UNIQUE("id","work_request_id"),
	CONSTRAINT "milestones_sequence_ck" CHECK ("milestones"."sequence" >= 1),
	CONSTRAINT "milestones_budget_ck" CHECK ("milestones"."budget_amount" >= 0),
	CONSTRAINT "milestones_currency_ck" CHECK ("milestones"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "milestones_status_ck" CHECK ("milestones"."status" in ('planned', 'funded', 'in_progress', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"summary" text,
	"storage_path" text,
	"external_url" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_version_ck" CHECK ("submissions"."version" >= 1),
	CONSTRAINT "submissions_deliverable_ck" CHECK ("submissions"."summary" is not null or "submissions"."storage_path" is not null or "submissions"."external_url" is not null),
	CONSTRAINT "submissions_url_ck" CHECK ("submissions"."external_url" is null or "submissions"."external_url" ~ '^https?://')
);
--> statement-breakpoint
CREATE TABLE "work_package_capabilities" (
	"work_package_id" uuid NOT NULL,
	"capability_id" uuid NOT NULL,
	"minimum_level" smallint NOT NULL,
	"weight" numeric(4, 3) DEFAULT 1 NOT NULL,
	"is_critical" boolean DEFAULT false NOT NULL,
	"required_confidence" numeric(3, 2),
	"notes" text,
	CONSTRAINT "work_package_capabilities_work_package_id_capability_id_pk" PRIMARY KEY("work_package_id","capability_id"),
	CONSTRAINT "work_package_capabilities_level_ck" CHECK ("work_package_capabilities"."minimum_level" between 1 and 5),
	CONSTRAINT "work_package_capabilities_weight_ck" CHECK ("work_package_capabilities"."weight" > 0 and "work_package_capabilities"."weight" <= 1),
	CONSTRAINT "work_package_capabilities_confidence_ck" CHECK ("work_package_capabilities"."required_confidence" is null or "work_package_capabilities"."required_confidence" between 0 and 1)
);
--> statement-breakpoint
CREATE TABLE "work_package_languages" (
	"work_package_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"modality" text NOT NULL,
	"minimum_level" smallint NOT NULL,
	"weight" numeric(4, 3) DEFAULT 1 NOT NULL,
	"is_critical" boolean DEFAULT false NOT NULL,
	CONSTRAINT "work_package_languages_work_package_id_language_id_modality_pk" PRIMARY KEY("work_package_id","language_id","modality"),
	CONSTRAINT "work_package_languages_modality_ck" CHECK ("work_package_languages"."modality" in ('reading', 'writing', 'listening', 'speaking')),
	CONSTRAINT "work_package_languages_level_ck" CHECK ("work_package_languages"."minimum_level" between 1 and 6),
	CONSTRAINT "work_package_languages_weight_ck" CHECK ("work_package_languages"."weight" > 0 and "work_package_languages"."weight" <= 1)
);
--> statement-breakpoint
CREATE TABLE "work_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_request_id" uuid NOT NULL,
	"parent_id" uuid,
	"milestone_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"acceptance_criteria" text,
	"sequence" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"origin" text DEFAULT 'human' NOT NULL,
	"created_by" uuid,
	"estimated_hours" integer,
	"starts_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_packages_id_request_uq" UNIQUE("id","work_request_id"),
	CONSTRAINT "work_packages_not_own_parent_ck" CHECK ("work_packages"."parent_id" is null or "work_packages"."parent_id" <> "work_packages"."id"),
	CONSTRAINT "work_packages_hours_ck" CHECK ("work_packages"."estimated_hours" is null or "work_packages"."estimated_hours" >= 0),
	CONSTRAINT "work_packages_dates_ck" CHECK ("work_packages"."starts_at" is null or "work_packages"."due_at" is null or "work_packages"."due_at" >= "work_packages"."starts_at"),
	CONSTRAINT "work_packages_status_ck" CHECK ("work_packages"."status" in ('draft', 'proposed', 'confirmed', 'in_progress', 'completed', 'cancelled')),
	CONSTRAINT "work_packages_origin_ck" CHECK ("work_packages"."origin" in ('human', 'ai'))
);
--> statement-breakpoint
CREATE TABLE "work_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"title" text NOT NULL,
	"problem_statement" text NOT NULL,
	"desired_outcome" text,
	"source_language_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_requests_status_ck" CHECK ("work_requests"."status" in ('draft', 'submitted', 'decomposing', 'structured', 'cancelled'))
);
--> statement-breakpoint
ALTER TABLE "acceptances" ADD CONSTRAINT "acceptances_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acceptances" ADD CONSTRAINT "acceptances_decided_by_profiles_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_work_package_id_work_packages_id_fk" FOREIGN KEY ("work_package_id") REFERENCES "public"."work_packages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_worker_id_worker_profiles_profile_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."worker_profiles"("profile_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_offered_by_profiles_id_fk" FOREIGN KEY ("offered_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_work_request_id_work_requests_id_fk" FOREIGN KEY ("work_request_id") REFERENCES "public"."work_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_package_capabilities" ADD CONSTRAINT "work_package_capabilities_work_package_id_work_packages_id_fk" FOREIGN KEY ("work_package_id") REFERENCES "public"."work_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_package_capabilities" ADD CONSTRAINT "work_package_capabilities_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_package_languages" ADD CONSTRAINT "work_package_languages_work_package_id_work_packages_id_fk" FOREIGN KEY ("work_package_id") REFERENCES "public"."work_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_package_languages" ADD CONSTRAINT "work_package_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_work_request_id_work_requests_id_fk" FOREIGN KEY ("work_request_id") REFERENCES "public"."work_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_parent_fk" FOREIGN KEY ("parent_id","work_request_id") REFERENCES "public"."work_packages"("id","work_request_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_milestone_fk" FOREIGN KEY ("milestone_id","work_request_id") REFERENCES "public"."milestones"("id","work_request_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_requests" ADD CONSTRAINT "work_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_requests" ADD CONSTRAINT "work_requests_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_requests" ADD CONSTRAINT "work_requests_source_language_id_languages_id_fk" FOREIGN KEY ("source_language_id") REFERENCES "public"."languages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "acceptances_one_per_submission_uq" ON "acceptances" USING btree ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_one_open_per_package_uq" ON "assignments" USING btree ("work_package_id") WHERE "assignments"."status" in ('offered', 'accepted', 'active', 'completed');--> statement-breakpoint
CREATE INDEX "assignments_worker_idx" ON "assignments" USING btree ("worker_id","status");--> statement-breakpoint
CREATE INDEX "assignments_package_idx" ON "assignments" USING btree ("work_package_id");--> statement-breakpoint
CREATE UNIQUE INDEX "milestones_request_sequence_uq" ON "milestones" USING btree ("work_request_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "submissions_assignment_version_uq" ON "submissions" USING btree ("assignment_id","version");--> statement-breakpoint
CREATE INDEX "work_package_capabilities_lookup_idx" ON "work_package_capabilities" USING btree ("capability_id","minimum_level");--> statement-breakpoint
CREATE INDEX "work_package_languages_lookup_idx" ON "work_package_languages" USING btree ("language_id","modality","minimum_level");--> statement-breakpoint
CREATE INDEX "work_packages_tree_idx" ON "work_packages" USING btree ("work_request_id","parent_id","sequence");--> statement-breakpoint
CREATE INDEX "work_packages_parent_idx" ON "work_packages" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "work_packages_milestone_idx" ON "work_packages" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "work_packages_matchable_idx" ON "work_packages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "work_requests_org_idx" ON "work_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "work_requests_creator_idx" ON "work_requests" USING btree ("created_by");