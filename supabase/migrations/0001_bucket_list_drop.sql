-- Bucket List Drop: run with Supabase CLI or the SQL editor.
create extension if not exists pgcrypto;

create table public.bucket_lists (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique check (public_id ~ '^BL-[A-HJ-NP-Z2-9]{8}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bucket_lists_public_id_idx on public.bucket_lists (public_id);

create table public.bucket_list_items (
  id uuid primary key default gen_random_uuid(),
  bucket_list_id uuid not null references public.bucket_lists(id) on delete cascade,
  item_text text not null check (char_length(trim(item_text)) between 1 and 500),
  position smallint not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (bucket_list_id, position)
);
create index bucket_list_items_list_position_idx on public.bucket_list_items (bucket_list_id, position);

create table public.global_stats (
  id smallint primary key default 1 check (id = 1),
  total_bucket_lists bigint not null default 0 check (total_bucket_lists >= 0),
  total_items bigint not null default 0 check (total_items >= 0),
  updated_at timestamptz not null default now()
);
insert into public.global_stats (id) values (1) on conflict do nothing;

-- No direct table access for anonymous callers. The API service role invokes narrowly-scoped functions.
alter table public.bucket_lists enable row level security;
alter table public.bucket_list_items enable row level security;
alter table public.global_stats enable row level security;
create policy "Public can view global aggregate only" on public.global_stats for select to anon, authenticated using (id = 1);
-- Permit realtime for this one harmless aggregate table; never add bucket lists/items to this publication.
alter publication supabase_realtime add table public.global_stats;

create or replace function public.new_bucket_public_id() returns text language plpgsql volatile as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; result text := 'BL-'; i int;
begin
  for i in 1..8 loop result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
  return result;
end $$;

-- A single transaction prevents lost counter increments under concurrent submissions.
create or replace function public.create_bucket_list(submitted_items text[])
returns table(public_id text, total_bucket_lists bigint, total_items bigint)
language plpgsql security definer set search_path = public as $$
declare list_id uuid; id_candidate text; item_count int; attempt int := 0;
begin
  item_count := cardinality(submitted_items);
  if item_count is null or item_count < 1 or item_count > 50 then raise exception 'Invalid item count'; end if;
  foreach id_candidate in array submitted_items loop
    if char_length(trim(id_candidate)) < 1 or char_length(id_candidate) > 500 then raise exception 'Invalid item'; end if;
  end loop;
  loop
    id_candidate := public.new_bucket_public_id();
    begin insert into public.bucket_lists (public_id) values (id_candidate) returning id into list_id; exit;
    exception when unique_violation then attempt := attempt + 1; if attempt > 10 then raise; end if; end;
  end loop;
  insert into public.bucket_list_items (bucket_list_id, item_text, position)
  select list_id, trim(value), ordinal::smallint from unnest(submitted_items) with ordinality as t(value, ordinal);
  update public.global_stats set total_bucket_lists = total_bucket_lists + 1, total_items = total_items + item_count, updated_at = now() where id = 1
  returning global_stats.total_bucket_lists, global_stats.total_items into total_bucket_lists, total_items;
  public_id := id_candidate; return next;
end $$;

create or replace function public.get_bucket_list_by_public_id(requested_public_id text)
returns table(public_id text, created_at timestamptz, items jsonb)
language sql security definer set search_path = public stable as $$
  select b.public_id, b.created_at, coalesce(jsonb_agg(jsonb_build_object('text', i.item_text, 'position', i.position) order by i.position), '[]'::jsonb)
  from bucket_lists b join bucket_list_items i on i.bucket_list_id = b.id
  where b.public_id = upper(trim(requested_public_id)) group by b.id;
$$;

revoke all on public.bucket_lists, public.bucket_list_items, public.global_stats from anon, authenticated;
revoke all on function public.create_bucket_list(text[]), public.get_bucket_list_by_public_id(text) from public;
grant execute on function public.create_bucket_list(text[]), public.get_bucket_list_by_public_id(text) to service_role;
