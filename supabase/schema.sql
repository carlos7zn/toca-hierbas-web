-- Toca Hierbas community. Run on a dedicated Supabase project.
-- Access expires unless a member reconnects Discord within 24 hours.

create table if not exists public.discord_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  discord_id text not null unique,
  checked_at timestamptz not null default now(),
  checked_until timestamptz not null
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 32),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 3000),
  media_path text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now(),
  constraint post_has_content check (char_length(btrim(body)) > 0 or media_path is not null),
  constraint post_media_pair check ((media_path is null) = (media_type is null))
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post_id_created_idx on public.post_comments (post_id, created_at);

alter table public.discord_links enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

create policy "Read own Discord link" on public.discord_links
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Read member profiles" on public.profiles
  for select to authenticated using (
    exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Create own member profile" on public.profiles
  for insert to authenticated with check (
    id = (select auth.uid()) and exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Read member posts" on public.posts
  for select to authenticated using (
    exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Create member post" on public.posts
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and (media_path is null or media_path like ((select auth.uid())::text || '/%'))
    and exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Delete own post" on public.posts
  for delete to authenticated using (author_id = (select auth.uid()));

create policy "Read member likes" on public.post_likes
  for select to authenticated using (exists (
    select 1 from public.discord_links d
    where d.user_id = (select auth.uid()) and d.checked_until > now()
  ));
create policy "Like as member" on public.post_likes
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Unlike own post" on public.post_likes
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Read member comments" on public.post_comments
  for select to authenticated using (
    exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Comment as member" on public.post_comments
  for insert to authenticated with check (
    author_id = (select auth.uid()) and exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Delete own comment" on public.post_comments
  for delete to authenticated using (author_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media', 'post-media', false, 26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Members read media" on storage.objects
  for select to authenticated using (
    bucket_id = 'post-media' and exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Members upload own media" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.discord_links d
      where d.user_id = (select auth.uid()) and d.checked_until > now()
    )
  );
create policy "Owners delete media" on storage.objects
  for delete to authenticated using (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

grant select on public.discord_links to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.posts to authenticated;
grant select, insert, delete on public.post_likes to authenticated;
grant select, insert, delete on public.post_comments to authenticated;
