-- Create with: npx drizzle-kit generate --custom --name=work_integrity
-- then paste this file's contents into the generated empty migration.
-- Run AFTER the migration that creates the work tables, and after 0001 and 0002 (it reuses
-- public.forbid_mutation(), public.require_active_capability() and public.require_active_language()).
--
-- Statuses that count against a milestone budget: offered, accepted, active, completed.
-- Terminal assignment statuses: completed, declined, withdrawn, terminated.

/* ------------------------------------------------------------------ */
/* 1. Requirements only use ACTIVE capabilities / languages            */
/* ------------------------------------------------------------------ */

drop trigger if exists trg_active_capability on public.work_package_capabilities;
create trigger trg_active_capability
  before insert on public.work_package_capabilities
  for each row execute function public.require_active_capability();

drop trigger if exists trg_active_language on public.work_package_languages;
create trigger trg_active_language
  before insert on public.work_package_languages
  for each row execute function public.require_active_language();

/* ------------------------------------------------------------------ */
/* 2. Package structure: leaves only                                   */
/* ------------------------------------------------------------------ */

-- Leaf-ness is derived: a package with no children. These rules keep container packages free of
-- execution state, and make a leaf carry acceptance criteria once it is past draft / proposed.
create or replace function public.guard_package_structure()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_parent_changed boolean;
  v_milestone_changed boolean;
  v_is_leaf boolean;
begin
  if tg_op = 'INSERT' then
    v_parent_changed := new.parent_id is not null;
    v_milestone_changed := false;
  else
    v_parent_changed := new.parent_id is distinct from old.parent_id and new.parent_id is not null;
    v_milestone_changed := new.milestone_id is distinct from old.milestone_id;
  end if;

  -- Giving a package its first child turns it into a container.
  if v_parent_changed then
    if exists (select 1 from public.assignments a where a.work_package_id = new.parent_id) then
      raise exception 'package % has assignments and cannot become a container', new.parent_id
        using errcode = '23514';
    end if;
    if exists (select 1 from public.work_package_capabilities r where r.work_package_id = new.parent_id)
       or exists (select 1 from public.work_package_languages r where r.work_package_id = new.parent_id) then
      raise exception 'package % has requirements; move them to its children first', new.parent_id
        using errcode = '23514';
    end if;
    if exists (select 1 from public.work_packages p where p.id = new.parent_id and p.milestone_id is not null) then
      raise exception 'package % belongs to a milestone; assign the milestone to its children instead', new.parent_id
        using errcode = '23514';
    end if;
  end if;

  v_is_leaf := not exists (select 1 from public.work_packages c where c.parent_id = new.id);

  -- Milestones group leaves only, and a leaf cannot move milestones while money is committed to it.
  if new.milestone_id is not null and not v_is_leaf then
    raise exception 'container package % cannot belong to a milestone', new.id using errcode = '23514';
  end if;
  if v_milestone_changed
     and exists (
       select 1 from public.assignments a
       where a.work_package_id = new.id and a.status in ('offered', 'accepted', 'active', 'completed')
     ) then
    raise exception 'package % has committed assignments; its milestone cannot change', new.id
      using errcode = '23514';
  end if;

  -- A leaf that leaves draft / proposed must say what makes a submission acceptable.
  if v_is_leaf
     and new.status in ('confirmed', 'in_progress', 'completed')
     and (new.acceptance_criteria is null or btrim(new.acceptance_criteria) = '') then
    raise exception 'leaf package % needs acceptance criteria before it is %', new.id, new.status
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_package_structure on public.work_packages;
create trigger trg_guard_package_structure
  before insert or update on public.work_packages
  for each row execute function public.guard_package_structure();

-- Requirements attach to leaves only.
create or replace function public.require_leaf_package()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.work_packages c where c.parent_id = new.work_package_id) then
    raise exception 'package % is a container; requirements attach to leaf packages only', new.work_package_id
      using errcode = '23514';
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['work_package_capabilities', 'work_package_languages']
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_leaf_only_' || t, t);
    execute format(
      'create trigger %I before insert on public.%I for each row execute function public.require_leaf_package()',
      'trg_leaf_only_' || t,
      t
    );
  end loop;
end;
$$;

/* ------------------------------------------------------------------ */
/* 3. Assignments                                                      */
/* ------------------------------------------------------------------ */

create or replace function public.guard_assignment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_milestone uuid;
  v_pkg_status text;
  v_budget bigint;
  v_currency text;
  v_committed bigint;
begin
  if tg_op = 'UPDATE' then
    if old.status in ('completed', 'declined', 'withdrawn', 'terminated') then
      raise exception 'assignment % is % and cannot change', old.id, old.status using errcode = '23514';
    end if;
    if new.work_package_id <> old.work_package_id or new.worker_id <> old.worker_id then
      raise exception 'the package and worker of assignment % cannot change', old.id using errcode = '23514';
    end if;
  end if;

  select p.milestone_id, p.status into v_milestone, v_pkg_status
  from public.work_packages p
  where p.id = new.work_package_id;

  if tg_op = 'INSERT' then
    if exists (select 1 from public.work_packages c where c.parent_id = new.work_package_id) then
      raise exception 'package % is a container; only leaf packages can be assigned', new.work_package_id
        using errcode = '23514';
    end if;
    if v_pkg_status not in ('confirmed', 'in_progress') then
      raise exception 'package % is %; it must be confirmed before it can be assigned', new.work_package_id, v_pkg_status
        using errcode = '23514';
    end if;
    if v_milestone is null then
      raise exception 'package % must belong to a milestone before it can be assigned', new.work_package_id
        using errcode = '23514';
    end if;
  end if;

  -- Keep committed amounts within the milestone budget. The milestone row is locked so two
  -- concurrent offers cannot both fit into the same remaining budget.
  if new.status in ('offered', 'accepted', 'active', 'completed')
     and (tg_op = 'INSERT' or new.agreed_amount is distinct from old.agreed_amount) then
    select m.budget_amount, m.currency into v_budget, v_currency
    from public.milestones m
    where m.id = v_milestone
    for update;

    if new.currency <> v_currency then
      raise exception 'assignment currency % does not match milestone currency %', new.currency, v_currency
        using errcode = '23514';
    end if;

    select coalesce(sum(a.agreed_amount), 0) into v_committed
    from public.assignments a
    join public.work_packages p on p.id = a.work_package_id
    where p.milestone_id = v_milestone
      and a.id <> new.id
      and a.status in ('offered', 'accepted', 'active', 'completed');

    if v_committed + new.agreed_amount > v_budget then
      raise exception 'milestone budget exceeded: % committed + % requested > % budget',
        v_committed, new.agreed_amount, v_budget
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_assignment on public.assignments;
create trigger trg_guard_assignment
  before insert or update on public.assignments
  for each row execute function public.guard_assignment();

-- Lowering a milestone budget (or changing its currency) must not strand committed assignments.
create or replace function public.guard_milestone_budget()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_committed bigint;
begin
  select coalesce(sum(a.agreed_amount), 0) into v_committed
  from public.assignments a
  join public.work_packages p on p.id = a.work_package_id
  where p.milestone_id = new.id
    and a.status in ('offered', 'accepted', 'active', 'completed');

  if new.currency is distinct from old.currency and v_committed > 0 then
    raise exception 'milestone % currency cannot change once assignments are committed', new.id
      using errcode = '23514';
  end if;
  if new.budget_amount < v_committed then
    raise exception 'milestone % budget % is below the % already committed', new.id, new.budget_amount, v_committed
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_milestone_budget on public.milestones;
create trigger trg_guard_milestone_budget
  before update of budget_amount, currency on public.milestones
  for each row execute function public.guard_milestone_budget();

/* ------------------------------------------------------------------ */
/* 4. Submissions and acceptances                                      */
/* ------------------------------------------------------------------ */

create or replace function public.guard_submission()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_status text;
  v_prior integer;
  v_unreviewed integer;
begin
  select a.status into v_status
  from public.assignments a
  where a.id = new.assignment_id
  for update;

  if v_status is distinct from 'active' then
    raise exception 'assignment % is %; submissions require an active assignment', new.assignment_id, v_status
      using errcode = '23514';
  end if;

  select count(*) into v_prior from public.submissions s where s.assignment_id = new.assignment_id;
  if new.version <> v_prior + 1 then
    raise exception 'the next submission version for assignment % must be %', new.assignment_id, v_prior + 1
      using errcode = '23514';
  end if;

  select count(*) into v_unreviewed
  from public.submissions s
  where s.assignment_id = new.assignment_id
    and not exists (select 1 from public.acceptances ac where ac.submission_id = s.id);
  if v_unreviewed > 0 then
    raise exception 'assignment % has a submission still awaiting review', new.assignment_id
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_submission on public.submissions;
create trigger trg_guard_submission
  before insert on public.submissions
  for each row execute function public.guard_submission();

create or replace function public.guard_acceptance()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_assignment uuid;
  v_status text;
  v_org uuid;
begin
  select s.assignment_id into v_assignment from public.submissions s where s.id = new.submission_id;

  select a.status into v_status
  from public.assignments a
  where a.id = v_assignment
  for update;

  if v_status is distinct from 'active' then
    raise exception 'assignment % is %; only an active assignment can receive a decision', v_assignment, v_status
      using errcode = '23514';
  end if;

  if new.decision = 'accepted'
     and exists (
       select 1
       from public.acceptances ac
       join public.submissions s on s.id = ac.submission_id
       where s.assignment_id = v_assignment and ac.decision = 'accepted'
     ) then
    raise exception 'assignment % already has an accepted submission', v_assignment using errcode = '23514';
  end if;

  -- Only a member of the organization that owns the request may decide (null = system decision).
  if new.decided_by is not null then
    select r.organization_id into v_org
    from public.assignments a
    join public.work_packages p on p.id = a.work_package_id
    join public.work_requests r on r.id = p.work_request_id
    where a.id = v_assignment;

    if not exists (
      select 1 from public.organization_members m
      where m.organization_id = v_org and m.profile_id = new.decided_by
    ) then
      raise exception 'profile % is not a member of the organization that owns this work', new.decided_by
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_acceptance on public.acceptances;
create trigger trg_guard_acceptance
  before insert on public.acceptances
  for each row execute function public.guard_acceptance();

do $$
declare
  t text;
begin
  foreach t in array array['submissions', 'acceptances']
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
/* 5. Re-apply the idempotent blocks to the new tables                 */
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