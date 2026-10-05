-- Create with: npx drizzle-kit generate --custom --name=capability_integrity
-- then paste this file's contents into the generated empty migration.
-- Run AFTER the migration that creates the capability tables, and after 0001 (it reuses
-- public.touch_updated_at()).

/* ------------------------------------------------------------------ */
/* 1. Append-only history                                              */
/* ------------------------------------------------------------------ */

create or replace function public.forbid_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only (% not allowed)', tg_table_name, tg_op
    using errcode = '23514';
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'evidence',
    'evidence_capabilities',
    'evidence_languages',
    'evidence_retractions',
    'assessment_results',
    'assessment_lang_results'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_append_only_' || t, t);
    execute format(
      'create trigger %I before update or delete on public.%I for each row execute function public.forbid_mutation()',
      'trg_append_only_' || t,
      t
    );
  end loop;
end;
$$;

/* ------------------------------------------------------------------ */
/* 2. Evidence may only attach to ACTIVE capabilities / languages      */
/* ------------------------------------------------------------------ */

create or replace function public.require_active_capability()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.capabilities c where c.id = new.capability_id and c.status = 'active'
  ) then
    raise exception 'capability % is not active; evidence cannot attach to it', new.capability_id
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function public.require_active_language()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.languages l where l.id = new.language_id and l.status = 'active'
  ) then
    raise exception 'language % is not active; evidence cannot attach to it', new.language_id
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_active_capability on public.evidence_capabilities;
create trigger trg_active_capability
  before insert on public.evidence_capabilities
  for each row execute function public.require_active_capability();

drop trigger if exists trg_active_language on public.evidence_languages;
create trigger trg_active_language
  before insert on public.evidence_languages
  for each row execute function public.require_active_language();

/* ------------------------------------------------------------------ */
/* 3. Published assessment versions are frozen                         */
/* ------------------------------------------------------------------ */

-- A published version may only move to 'retired'; nothing else about it changes.
create or replace function public.freeze_published_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'assessment version % is % and cannot be deleted', old.id, old.status
        using errcode = '23514';
    end if;
    return old;
  end if;

  if old.status <> 'draft' then
    if new.status is distinct from old.status and not (old.status = 'published' and new.status = 'retired') then
      raise exception 'assessment version % cannot move from % to %', old.id, old.status, new.status
        using errcode = '23514';
    end if;
    if new.content is distinct from old.content
       or new.assessment_id is distinct from old.assessment_id
       or new.version is distinct from old.version
       or new.duration_minutes is distinct from old.duration_minutes
       or new.published_at is distinct from old.published_at then
      raise exception 'assessment version % is % and its definition is frozen', old.id, old.status
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_freeze_version on public.assessment_versions;
create trigger trg_freeze_version
  before update or delete on public.assessment_versions
  for each row execute function public.freeze_published_version();

-- Link tables can only change while their version is still a draft.
create or replace function public.require_draft_version()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_status text;
begin
  select status into v_status
  from public.assessment_versions
  where id = coalesce(new.version_id, old.version_id);

  if v_status is distinct from 'draft' then
    raise exception 'assessment version is % and its targets are frozen', v_status
      using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['assessment_capabilities', 'assessment_lang_targets']
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_draft_only_' || t, t);
    execute format(
      'create trigger %I before insert or update or delete on public.%I for each row execute function public.require_draft_version()',
      'trg_draft_only_' || t,
      t
    );
  end loop;
end;
$$;

/* ------------------------------------------------------------------ */
/* 4. A scored attempt can only be voided                              */
/* ------------------------------------------------------------------ */

-- Voiding a scored attempt (for example, cheating) must be accompanied by a retraction of its
-- evidence; the application does both in one transaction.
create or replace function public.protect_scored_attempt()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'scored' then
      raise exception 'scored attempt % cannot be deleted', old.id using errcode = '23514';
    end if;
    return old;
  end if;

  if old.status = 'scored' and new.status <> 'voided' then
    raise exception 'scored attempt % can only change to voided', old.id using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_scored_attempt on public.assessment_attempts;
create trigger trg_protect_scored_attempt
  before update or delete on public.assessment_attempts
  for each row execute function public.protect_scored_attempt();

/* ------------------------------------------------------------------ */
/* 5. Re-apply the idempotent blocks from 0001 to the new tables       */
/* ------------------------------------------------------------------ */

do $$
declare
  r record;
begin
  for r in
    select table_name
    from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_touch_' || r.table_name, r.table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_updated_at()',
      'trg_touch_' || r.table_name,
      r.table_name
    );
  end loop;
end;
$$;

do $$
declare
  r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end;
$$;