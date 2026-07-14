-- Birthday billiards tournament schema

create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$;

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.tournament (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'registration', 'active', 'finished', 'cancelled')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  check (started_at is null or started_at >= created_at),
  check (finished_at is null or started_at is not null),
  check (finished_at is null or finished_at >= started_at)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  round integer not null check (round > 0),
  bracket text not null check (bracket in ('winners', 'losers', 'final')),
  position integer not null check (position > 0),
  player1_id uuid references public.participants(id) on update cascade on delete restrict,
  player2_id uuid references public.participants(id) on update cascade on delete restrict,
  winner_id uuid references public.participants(id) on update cascade on delete restrict,
  loser_id uuid references public.participants(id) on update cascade on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'ready', 'in_progress', 'finished', 'cancelled')),
  check (player1_id is null or player2_id is null or player1_id <> player2_id),
  check (winner_id is null or winner_id in (player1_id, player2_id)),
  check (loser_id is null or loser_id in (player1_id, player2_id)),
  check (winner_id is null or loser_id is null or winner_id <> loser_id),
  unique (bracket, round, position)
);

create index participants_created_at_idx on public.participants (created_at);
create index tournament_status_idx on public.tournament (status);
create index tournament_created_at_idx on public.tournament (created_at);
create index matches_bracket_round_position_idx on public.matches (bracket, round, position);
create index matches_status_idx on public.matches (status);
create index matches_player1_id_idx on public.matches (player1_id);
create index matches_player2_id_idx on public.matches (player2_id);
create index matches_winner_id_idx on public.matches (winner_id);
create index matches_loser_id_idx on public.matches (loser_id);

alter table public.participants enable row level security;
alter table public.tournament enable row level security;
alter table public.matches enable row level security;

create policy "participants are readable as tournament bracket"
  on public.participants
  for select
  to anon, authenticated
  using (true);

create policy "users can register participants"
  on public.participants
  for insert
  to anon, authenticated
  with check (true);

create policy "admins can manage participants"
  on public.participants
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tournament is readable as bracket metadata"
  on public.tournament
  for select
  to anon, authenticated
  using (true);

create policy "admins can manage tournament"
  on public.tournament
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "matches are readable as tournament bracket"
  on public.matches
  for select
  to anon, authenticated
  using (true);

create policy "admins can manage matches"
  on public.matches
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create unique index participants_name_unique_ci_idx on public.participants (lower(trim(name)));

create or replace function public.is_tournament_locked()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tournament
    where status in ('active', 'finished')
  );
$$;

create or replace function public.prevent_participants_changes_after_draw()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_tournament_locked() then
    raise exception 'Participant editing is locked after the draw';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger lock_participants_after_draw
  before insert or update or delete on public.participants
  for each row execute function public.prevent_participants_changes_after_draw();

create or replace function public.reset_tournament()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.matches;
  update public.tournament
  set status = 'draft',
      started_at = null,
      finished_at = null;
  delete from public.participants;

  if not exists (select 1 from public.tournament) then
    insert into public.tournament (status) values ('draft');
  end if;
end;
$$;

grant execute on function public.reset_tournament() to anon, authenticated;

drop policy if exists "admins can manage participants" on public.participants;

create policy "participants can be managed before draw"
  on public.participants
  for all
  to anon, authenticated
  using (not public.is_tournament_locked())
  with check (not public.is_tournament_locked());

create policy "tournament draw can be started from app"
  on public.tournament
  for update
  to anon, authenticated
  using (true)
  with check (status in ('active', 'draft'));

insert into public.tournament (status)
select 'draft'
where not exists (select 1 from public.tournament);

do $$
begin
  alter publication supabase_realtime add table public.participants;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.tournament;
exception
  when duplicate_object then null;
end $$;
