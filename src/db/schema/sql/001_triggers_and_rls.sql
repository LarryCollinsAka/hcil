-- Create with: npx drizzle-kit generate --custom --name=triggers_and_rls
-- then paste this file's contents into the generated empty migration.
-- It must run AFTER the migration that creates the tables.
-- Re-run the updated_at and RLS blocks whenever you add new tables (they are idempotent).

/* ------------------------------------------------------------------ */
/* 1. updated_at maintenance (covers dashboard / raw SQL edits)        */
/* ------------------------------------------------------------------ */

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

/* ------------------------------------------------------------------ */
/* 2. Taxonomy audit log                                               */
/* ------------------------------------------------------------------ */

-- actor_id is the Supabase user (auth.uid()); NULL when changed via SQL editor / service role.
-- entity_id is NULL for composite-key tables; before_data / after_data hold the full row.
create or replace function public.taxonomy_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_json jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.taxonomy_audit_log (actor_id, entity_type, entity_id, action, before_data, after_data)
  values (
    auth.uid(),
    tg_table_name,
    nullif(row_json ->> 'id', '')::uuid,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'languages',
    'language_aliases',
    'platform_locales',
    'capability_domains',
    'capability_domain_translations',
    'capabilities',
    'capability_aliases',
    'capability_translations'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_audit_' || t, t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function public.taxonomy_audit()',
      'trg_audit_' || t,
      t
    );
  end loop;
end;
$$;

/* ------------------------------------------------------------------ */
/* 3. Row Level Security: on everywhere, no policies yet               */
/* ------------------------------------------------------------------ */

-- With RLS enabled and no policies, the Supabase client API (anon / authenticated roles)
-- can read and write nothing. Server code using Drizzle over the database connection is
-- unaffected. Add explicit policies later when the browser needs direct access
-- (for example: public SELECT on published content translations).
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

/* ------------------------------------------------------------------ */
/* 4. Organization invariant: always keep at least one owner           */
/* ------------------------------------------------------------------ */

-- Blocks deleting or demoting the last owner of an organization that still exists.
-- When the whole organization is being deleted (cascade), the organization row is already gone,
-- so the check passes. Verify this on a scratch database before relying on it.
create or replace function public.protect_last_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner' or new.organization_id <> old.organization_id)
     and exists (select 1 from public.organizations o where o.id = old.organization_id)
     and not exists (
       select 1
       from public.organization_members m
       where m.organization_id = old.organization_id
         and m.role = 'owner'
         and m.profile_id <> old.profile_id
     )
  then
    raise exception 'organization % must keep at least one owner', old.organization_id
      using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_protect_last_owner on public.organization_members;
create trigger trg_protect_last_owner
  before update or delete on public.organization_members
  for each row execute function public.protect_last_owner();