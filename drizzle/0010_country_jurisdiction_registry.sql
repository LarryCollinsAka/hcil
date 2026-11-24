
CREATE TABLE "countries" (
    "code" char(2) PRIMARY KEY NOT NULL,
    "alpha_3" char(3),
    "numeric_code" char(3),
    "name" text NOT NULL,
    "native_name" text,
    "status" text DEFAULT 'active' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT "countries_code_ck"
        CHECK ("code" ~ '^[A-Z]{2}$'),
    CONSTRAINT "countries_alpha3_ck"
        CHECK ("alpha_3" IS NULL OR "alpha_3" ~ '^[A-Z]{3}$'),
    CONSTRAINT "countries_numeric_code_ck"
        CHECK ("numeric_code" IS NULL OR "numeric_code" ~ '^[0-9]{3}$'),
    CONSTRAINT "countries_status_ck"
        CHECK ("status" IN ('active', 'inactive'))
);
--> statement-breakpoint

ALTER TABLE "countries" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE TABLE "country_onboarding_schemas" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "country_code" char(2) NOT NULL,
    "version" integer NOT NULL,
    "schema_key" text NOT NULL,
    "name" text NOT NULL,
    "definition" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "status" text DEFAULT 'draft' NOT NULL,
    "effective_from" timestamp with time zone,
    "effective_to" timestamp with time zone,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT "country_onboarding_schemas_version_ck"
        CHECK ("version" > 0),

    CONSTRAINT "country_onboarding_schemas_definition_object_ck"
        CHECK (jsonb_typeof("definition") = 'object'),

    CONSTRAINT "country_onboarding_schemas_effective_range_ck"
        CHECK (
            "effective_to" IS NULL
            OR (
                "effective_from" IS NOT NULL
                AND "effective_to" > "effective_from"
            )
        ),

    CONSTRAINT "country_onboarding_schemas_published_ck"
        CHECK (
            "status" <> 'published'
            OR (
                "published_at" IS NOT NULL
                AND "effective_from" IS NOT NULL
            )
        ),

    CONSTRAINT "country_onboarding_schemas_status_ck"
        CHECK ("status" IN ('draft', 'review', 'published', 'retired'))
);
--> statement-breakpoint

ALTER TABLE "country_onboarding_schemas" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE TABLE "jurisdictions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "country_code" char(2) NOT NULL,
    "parent_id" uuid,
    "code" text NOT NULL,
    "name" text NOT NULL,
    "jurisdiction_type" text NOT NULL,
    "timezone" text,
    "status" text DEFAULT 'active' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT "jurisdictions_code_ck"
        CHECK ("code" ~ '^[A-Z0-9]+([_-][A-Z0-9]+)*$'),

    CONSTRAINT "jurisdictions_parent_ck"
        CHECK (
            "parent_id" IS NULL
            OR "parent_id" <> "id"
        ),

    CONSTRAINT "jurisdictions_type_ck"
        CHECK (
            "jurisdiction_type"
            IN (
                'national',
                'regional',
                'state',
                'provincial',
                'county',
                'municipal',
                'local',
                'special'
            )
        ),

    CONSTRAINT "jurisdictions_status_ck"
        CHECK ("status" IN ('active', 'inactive'))
);
--> statement-breakpoint

ALTER TABLE "jurisdictions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Country references
ALTER TABLE "country_onboarding_schemas"
ADD CONSTRAINT "country_onboarding_schemas_country_code_countries_code_fk"
FOREIGN KEY ("country_code")
REFERENCES "public"."countries" ("code")
ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint

ALTER TABLE "jurisdictions"
ADD CONSTRAINT "jurisdictions_country_code_countries_code_fk"
FOREIGN KEY ("country_code")
REFERENCES "public"."countries" ("code")
ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint

-- Country-scoped jurisdiction identity
CREATE UNIQUE INDEX "jurisdictions_country_id_uq"
ON "jurisdictions" USING btree ("country_code", "id");
--> statement-breakpoint

-- A jurisdiction parent must belong to the same country.
-- NULL parent_id is valid for top-level jurisdictions.
ALTER TABLE "jurisdictions"
ADD CONSTRAINT "jurisdictions_parent_same_country_fk"
FOREIGN KEY ("country_code", "parent_id")
REFERENCES "public"."jurisdictions" ("country_code", "id")
ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint

-- Country identifiers
CREATE UNIQUE INDEX "countries_alpha3_uq"
ON "countries" USING btree ("alpha_3");
--> statement-breakpoint

CREATE UNIQUE INDEX "countries_numeric_code_uq"
ON "countries" USING btree ("numeric_code");
--> statement-breakpoint

-- A schema version is unique within its country and schema key.
CREATE UNIQUE INDEX "country_onboarding_schemas_country_key_version_uq"
ON "country_onboarding_schemas"
USING btree ("country_code", "schema_key", "version");
--> statement-breakpoint

CREATE INDEX "country_onboarding_schemas_country_status_idx"
ON "country_onboarding_schemas"
USING btree ("country_code", "status");
--> statement-breakpoint

-- Jurisdiction indexes
CREATE UNIQUE INDEX "jurisdictions_country_code_uq"
ON "jurisdictions" USING btree ("country_code", "code");
--> statement-breakpoint

CREATE INDEX "jurisdictions_country_type_idx"
ON "jurisdictions"
USING btree ("country_code", "jurisdiction_type");
--> statement-breakpoint

CREATE INDEX "jurisdictions_parent_idx"
ON "jurisdictions"
USING btree ("parent_id");
--> statement-breakpoint

-- Required for the published-period exclusion constraint.
-- Supabase's extensions schema is already present in the search path.
CREATE EXTENSION IF NOT EXISTS btree_gist
WITH SCHEMA extensions;
--> statement-breakpoint

-- Prevent overlapping published periods for the same country and schema key.
-- [start, end) permits adjacent periods to meet at the boundary.
-- A NULL effective_to represents an open-ended period.
ALTER TABLE "country_onboarding_schemas"
ADD CONSTRAINT "country_onboarding_schemas_published_period_excl"
EXCLUDE USING gist (
    "country_code" WITH =,
    "schema_key" WITH =,
    tstzrange("effective_from", "effective_to", '[)') WITH &&
)
WHERE ("status" = 'published');
