-- HCIL infrastructure projection outbox. PostgreSQL remains authoritative.
CREATE TABLE IF NOT EXISTS outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  schema_version integer NOT NULL DEFAULT 1,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  processed_at timestamptz,
  dead_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outbox_events_type_ck CHECK (type ~ '^[a-z_]+\.[a-z_]+$'),
  CONSTRAINT outbox_events_attempts_ck CHECK (attempts >= 0),
  CONSTRAINT outbox_events_final_state_ck CHECK (NOT (processed_at IS NOT NULL AND dead_at IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS outbox_events_pending_idx
  ON outbox_events (available_at) WHERE processed_at IS NULL AND dead_at IS NULL;
CREATE INDEX IF NOT EXISTS outbox_events_aggregate_idx ON outbox_events (aggregate_type, aggregate_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS processed_events (
  handler text NOT NULL,
  event_id uuid NOT NULL REFERENCES outbox_events(id) ON DELETE CASCADE,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (handler, event_id)
);
--> statement-breakpoint
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE processed_events ENABLE ROW LEVEL SECURITY;
-- No client-facing policies are added. The server's trusted database role performs worker operations.
