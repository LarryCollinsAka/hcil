-- HCIL WORK domain guards.
-- Cross-row / relational invariants live here rather than in simple CHECKs.

create or replace function public.work_is_leaf(p_package_id uuid)
returns boolean
language sql
stable
as $$
  select not exists (
    select 1
    from public.work_packages child
    where child.parent_id = p_package_id
  );
$$;

create or replace function public.work_package_has_execution_records(p_package_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.assignments a where a.work_package_id = p_package_id
  )
  or exists (
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where a.work_package_id = p_package_id
  );
$$;

create or replace function public.work_guard_package_hierarchy()
returns trigger
language plpgsql
as $$
begin
  -- A package cannot become its own parent.
  if new.parent_id is not null and new.parent_id = new.id then
    raise exception 'work package cannot be its own parent';
  end if;

  -- Adding a child to a package that has already entered execution would
  -- change the meaning of an existing leaf and invalidate assignments.
  if new.parent_id is not null then
    if public.work_package_has_execution_records(new.parent_id) then
      raise exception 'cannot add children to work package % after execution has started', new.parent_id;
    end if;

    if exists (
      select 1
      from public.milestone_packages mp
      where mp.work_package_id = new.parent_id
    ) then
      raise exception 'cannot add children to work package % after milestone membership', new.parent_id;
    end if;

    -- A parent must belong to the same work request.
    if exists (
      select 1
      from public.work_packages parent_pkg
      where parent_pkg.id = new.parent_id
        and parent_pkg.work_request_id <> new.work_request_id
    ) then
      raise exception 'work package parent must belong to the same work request';
    end if;

    -- Prevent ancestor cycles such as A -> B -> A.
    if tg_op = 'UPDATE' and exists (
      with recursive ancestors as (
        select wp.id, wp.parent_id
        from public.work_packages wp
        where wp.id = new.parent_id

        union all

        select wp.id, wp.parent_id
        from public.work_packages wp
        join ancestors a on wp.id = a.parent_id
      )
      select 1 from ancestors where id = new.id
    ) then
      raise exception 'work package hierarchy cannot contain cycles';
    end if;
  end if;

  -- Moving an existing package under a new parent also cannot convert an
  -- already executable/executed leaf into a container.
  if tg_op = 'UPDATE' and new.parent_id is distinct from old.parent_id then
    if public.work_package_has_execution_records(old.id)
       or exists (
         select 1 from public.milestone_packages mp where mp.work_package_id = old.id
       ) then
      raise exception 'cannot re-parent work package % after execution or milestone membership', old.id;
    end if;
  end if;

  return new;
end;
$$;

create trigger work_package_hierarchy_guard
before insert or update of parent_id on public.work_packages
for each row execute function public.work_guard_package_hierarchy();

create or replace function public.work_guard_milestone_package()
returns trigger
language plpgsql
as $$
begin
  if not public.work_is_leaf(new.work_package_id) then
    raise exception 'only leaf work packages may belong to a milestone';
  end if;

  if exists (
    select 1
    from public.work_packages wp
    where wp.id = new.work_package_id
      and public.work_package_has_execution_records(wp.id)
  ) then
    raise exception 'a work package with execution records cannot be added to a milestone';
  end if;

  return new;
end;
$$;

create trigger work_milestone_package_guard
before insert or update on public.milestone_packages
for each row execute function public.work_guard_milestone_package();

create or replace function public.work_guard_assignment()
returns trigger
language plpgsql
as $$
declare
  v_criteria jsonb;
  v_status text;
begin
  select wp.acceptance_criteria, wp.status
    into v_criteria, v_status
  from public.work_packages wp
  where wp.id = new.work_package_id;

  if not public.work_is_leaf(new.work_package_id) then
    raise exception 'assignments may only attach to leaf work packages';
  end if;

  if v_status not in ('confirmed', 'matching', 'in_progress') then
    raise exception 'work package % is not assignable in status %', new.work_package_id, v_status;
  end if;

  if v_criteria is null or jsonb_array_length(v_criteria) = 0 then
    raise exception 'leaf work package % must have acceptance criteria before assignment', new.work_package_id;
  end if;

  if new.agreed_amount <= 0 then
    raise exception 'assignment agreed amount must be greater than zero';
  end if;

  return new;
end;
$$;

create trigger work_assignment_guard
before insert or update of work_package_id, agreed_amount on public.assignments
for each row execute function public.work_guard_assignment();

create or replace function public.work_guard_milestone_budget(p_milestone_id uuid)
returns void
language plpgsql
as $$
declare
  v_budget numeric;
  v_committed numeric;
begin
  select budget_amount into v_budget
  from public.milestones
  where id = p_milestone_id;

  if v_budget is null then
    return;
  end if;

  select coalesce(sum(a.agreed_amount), 0)
    into v_committed
  from public.assignments a
  join public.milestone_packages mp on mp.work_package_id = a.work_package_id
  where mp.milestone_id = p_milestone_id
    and a.status in ('offered', 'accepted', 'active', 'completed');

  if v_committed > v_budget then
    raise exception
      'milestone % budget % is below committed assignment amount %',
      p_milestone_id, v_budget, v_committed;
  end if;
end;
$$;

create or replace function public.work_check_milestone_budget_from_milestone()
returns trigger
language plpgsql
as $$
begin
  perform public.work_guard_milestone_budget(new.id);
  return new;
end;
$$;

create constraint trigger work_milestone_budget_guard
after insert or update of budget_amount on public.milestones
deferrable initially deferred
for each row execute function public.work_check_milestone_budget_from_milestone();

create or replace function public.work_check_milestone_budget_from_package_link()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.work_guard_milestone_budget(old.milestone_id);
  else
    perform public.work_guard_milestone_budget(new.milestone_id);
    if tg_op = 'UPDATE' and new.milestone_id is distinct from old.milestone_id then
      perform public.work_guard_milestone_budget(old.milestone_id);
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create constraint trigger work_milestone_package_budget_guard
after insert or update or delete on public.milestone_packages
deferrable initially deferred
for each row execute function public.work_check_milestone_budget_from_package_link();

create or replace function public.work_check_milestone_budget_from_assignment()
returns trigger
language plpgsql
as $$
declare
  v_package_id uuid;
begin
  if tg_op = 'DELETE' then
    v_package_id := old.work_package_id;
  else
    v_package_id := new.work_package_id;
  end if;

  perform public.work_guard_milestone_budget(mp.milestone_id)
  from public.milestone_packages mp
  where mp.work_package_id = v_package_id;

  if tg_op = 'UPDATE' and new.work_package_id is distinct from old.work_package_id then
    perform public.work_guard_milestone_budget(mp.milestone_id)
    from public.milestone_packages mp
    where mp.work_package_id = old.work_package_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create constraint trigger work_assignment_budget_guard
after insert or update of work_package_id, agreed_amount, status or delete on public.assignments
 deferrable initially deferred
for each row execute function public.work_check_milestone_budget_from_assignment();

-- A submission is tied to an assignment and therefore to a leaf package. This
-- trigger also prevents a submission against a non-executable or non-active
-- assignment.
create or replace function public.work_guard_submission()
returns trigger
language plpgsql
as $$
declare
  v_package_id uuid;
  v_status text;
begin
  select a.work_package_id, a.status
    into v_package_id, v_status
  from public.assignments a
  where a.id = new.assignment_id;

  if v_package_id is null then
    raise exception 'submission requires a valid assignment';
  end if;

  if not public.work_is_leaf(v_package_id) then
    raise exception 'submissions may only attach to leaf work packages';
  end if;

  if v_status not in ('accepted', 'active') then
    raise exception 'submissions require an accepted or active assignment, got %', v_status;
  end if;

  return new;
end;
$$;

create trigger work_submission_guard
before insert on public.submissions
for each row execute function public.work_guard_submission();

-- Submissions are append-only historical records. A new attempt creates a new
-- version instead of mutating or deleting an existing submission.
create or replace function public.work_guard_submission_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'submissions are immutable; create a new version instead';
end;
$$;

create trigger work_submission_immutable_guard
before update or delete on public.submissions
for each row execute function public.work_guard_submission_immutable();

-- Acceptance decisions are also append-only. A later review is another row.
create or replace function public.work_guard_acceptance_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'acceptance decisions are immutable; create a new decision instead';
end;
$$;

create trigger work_acceptance_immutable_guard
before update or delete on public.acceptances
for each row execute function public.work_guard_acceptance_immutable();

-- Currency should be consistent across a milestone and its assignment
-- commitments. Payments remains the money owner, but Work owns this agreement.
create or replace function public.work_guard_assignment_currency()
returns trigger
language plpgsql
as $$
declare
  v_milestone_currency text;
begin
  select m.currency
    into v_milestone_currency
  from public.milestones m
  join public.milestone_packages mp on mp.milestone_id = m.id
  where mp.work_package_id = new.work_package_id
  limit 1;

  if v_milestone_currency is not null and upper(v_milestone_currency) <> upper(new.currency) then
    raise exception 'assignment currency % does not match milestone currency %', new.currency, v_milestone_currency;
  end if;

  return new;
end;
$$;

create trigger work_assignment_currency_guard
before insert or update of work_package_id, currency on public.assignments
for each row execute function public.work_guard_assignment_currency();

-- Work receives this event from Payments and updates the operational milestone
-- state through an application handler. No direct FK dependency is created.
