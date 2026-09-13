-- Upskill MVP core schema.
-- Supabase Auth owns auth.users; application profile data lives in public.profiles.

create type public.roadmap_status as enum ('draft', 'published');
create type public.roadmap_level as enum ('beginner', 'intermediate', 'advanced');
create type public.resource_type as enum (
  'article', 'video', 'course', 'documentation', 'practice', 'repository', 'other'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 30),
  constraint profiles_username_format check (username ~ '^[a-zA-Z0-9_]+$'),
  constraint profiles_full_name_length check (full_name is null or char_length(full_name) <= 100),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500),
  constraint profiles_avatar_url_protocol check (avatar_url is null or avatar_url ~* '^https?://')
);

create unique index profiles_username_lower_key on public.profiles (lower(username));

create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  slug text not null,
  description text not null,
  cover_image_url text,
  status public.roadmap_status not null default 'draft',
  level public.roadmap_level,
  estimated_duration_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint roadmaps_title_length check (char_length(title) between 3 and 160),
  constraint roadmaps_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint roadmaps_description_length check (char_length(description) between 10 and 5000),
  constraint roadmaps_estimated_duration check (estimated_duration_minutes is null or estimated_duration_minutes > 0),
  constraint roadmaps_cover_image_url_protocol check (cover_image_url is null or cover_image_url ~* '^https?://'),
  constraint roadmaps_published_at check (
    (status = 'draft' and published_at is null) or
    (status = 'published' and published_at is not null)
  )
);

create unique index roadmaps_slug_key on public.roadmaps (slug);
create index roadmaps_creator_id_idx on public.roadmaps (creator_id);
create index roadmaps_published_created_at_idx on public.roadmaps (created_at desc) where status = 'published';

create table public.roadmap_sections (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  title text not null,
  description text,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roadmap_sections_title_length check (char_length(title) between 1 and 160),
  constraint roadmap_sections_position check (position >= 0),
  unique (roadmap_id, position) deferrable initially deferred
);

create index roadmap_sections_roadmap_id_idx on public.roadmap_sections (roadmap_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.roadmap_sections (id) on delete cascade,
  title text not null,
  description text,
  position integer not null,
  estimated_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_length check (char_length(title) between 1 and 200),
  constraint tasks_position check (position >= 0),
  constraint tasks_estimated_minutes check (estimated_minutes is null or estimated_minutes > 0),
  unique (section_id, position) deferrable initially deferred
);

create index tasks_section_id_idx on public.tasks (section_id);

create table public.task_resources (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  title text not null,
  url text not null,
  resource_type public.resource_type not null default 'other',
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_resources_title_length check (char_length(title) between 1 and 200),
  constraint task_resources_url_protocol check (url ~* '^https?://'),
  constraint task_resources_position check (position >= 0),
  unique (task_id, position) deferrable initially deferred
);

create index task_resources_task_id_idx on public.task_resources (task_id);

create table public.roadmap_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint roadmap_tags_name_length check (char_length(name) between 1 and 50),
  constraint roadmap_tags_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  unique (slug)
);

create unique index roadmap_tags_name_lower_key on public.roadmap_tags (lower(name));

create table public.roadmap_tag_links (
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  tag_id uuid not null references public.roadmap_tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (roadmap_id, tag_id)
);

create index roadmap_tag_links_tag_id_idx on public.roadmap_tag_links (tag_id);

create table public.roadmap_followers (
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  started_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  primary key (roadmap_id, student_id)
);

create index roadmap_followers_student_id_idx on public.roadmap_followers (student_id);

create table public.task_progress (
  task_id uuid not null references public.tasks (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (task_id, student_id)
);

create index task_progress_student_id_idx on public.task_progress (student_id);

-- Timestamps are maintained in the database so all write paths behave consistently.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger roadmaps_set_updated_at before update on public.roadmaps
for each row execute function public.set_updated_at();
create trigger roadmap_sections_set_updated_at before update on public.roadmap_sections
for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();
create trigger task_resources_set_updated_at before update on public.task_resources
for each row execute function public.set_updated_at();
create trigger task_progress_set_updated_at before update on public.task_progress
for each row execute function public.set_updated_at();

-- Create a profile immediately after a Supabase Auth user is created.
-- The application should collect/confirm the username after sign-up if it is not supplied in metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'user_' || substr(replace(new.id::text, '-', ''), 1, 24)),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep publication timestamps and prevent clients from setting them independently.
create or replace function public.set_roadmap_publication_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'published' then
    if tg_op = 'INSERT' or old.status is distinct from 'published' then
      new.published_at = now();
    else
      new.published_at = old.published_at;
    end if;
  else
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger roadmaps_set_publication_timestamp
before insert or update on public.roadmaps
for each row execute function public.set_roadmap_publication_timestamp();

alter table public.profiles enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_sections enable row level security;
alter table public.tasks enable row level security;
alter table public.task_resources enable row level security;
alter table public.roadmap_tags enable row level security;
alter table public.roadmap_tag_links enable row level security;
alter table public.roadmap_followers enable row level security;
alter table public.task_progress enable row level security;

create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "published roadmaps and own drafts are readable" on public.roadmaps for select
using (status = 'published' or creator_id = auth.uid());
create policy "authenticated users create own roadmaps" on public.roadmaps for insert to authenticated
with check (creator_id = auth.uid());
create policy "creators update own roadmaps" on public.roadmaps for update
using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "creators delete own roadmaps" on public.roadmaps for delete using (creator_id = auth.uid());

create policy "visible roadmap sections are readable" on public.roadmap_sections for select using (
  exists (select 1 from public.roadmaps r where r.id = roadmap_id and (r.status = 'published' or r.creator_id = auth.uid()))
);
create policy "creators manage own roadmap sections" on public.roadmap_sections for all using (
  exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.creator_id = auth.uid())
) with check (
  exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.creator_id = auth.uid())
);

create policy "visible tasks are readable" on public.tasks for select using (
  exists (
    select 1 from public.roadmap_sections s join public.roadmaps r on r.id = s.roadmap_id
    where s.id = section_id and (r.status = 'published' or r.creator_id = auth.uid())
  )
);
create policy "creators manage own tasks" on public.tasks for all using (
  exists (
    select 1 from public.roadmap_sections s join public.roadmaps r on r.id = s.roadmap_id
    where s.id = section_id and r.creator_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.roadmap_sections s join public.roadmaps r on r.id = s.roadmap_id
    where s.id = section_id and r.creator_id = auth.uid()
  )
);

create policy "visible resources are readable" on public.task_resources for select using (
  exists (
    select 1 from public.tasks t join public.roadmap_sections s on s.id = t.section_id
    join public.roadmaps r on r.id = s.roadmap_id
    where t.id = task_id and (r.status = 'published' or r.creator_id = auth.uid())
  )
);
create policy "creators manage own resources" on public.task_resources for all using (
  exists (
    select 1 from public.tasks t join public.roadmap_sections s on s.id = t.section_id
    join public.roadmaps r on r.id = s.roadmap_id
    where t.id = task_id and r.creator_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.tasks t join public.roadmap_sections s on s.id = t.section_id
    join public.roadmaps r on r.id = s.roadmap_id
    where t.id = task_id and r.creator_id = auth.uid()
  )
);

create policy "tags are publicly readable" on public.roadmap_tags for select using (true);
create policy "visible roadmap tags are readable" on public.roadmap_tag_links for select using (
  exists (select 1 from public.roadmaps r where r.id = roadmap_id and (r.status = 'published' or r.creator_id = auth.uid()))
);
create policy "creators manage own roadmap tags" on public.roadmap_tag_links for all using (
  exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.creator_id = auth.uid())
) with check (
  exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.creator_id = auth.uid())
);

create policy "students read own follows" on public.roadmap_followers for select using (student_id = auth.uid());
create policy "students follow published roadmaps" on public.roadmap_followers for insert to authenticated with check (
  student_id = auth.uid() and exists (
    select 1 from public.roadmaps r where r.id = roadmap_id and r.status = 'published'
  )
);
create policy "students update own follows" on public.roadmap_followers for update
using (student_id = auth.uid()) with check (
  student_id = auth.uid() and exists (
    select 1 from public.roadmaps r where r.id = roadmap_id and r.status = 'published'
  )
);
create policy "students remove own follows" on public.roadmap_followers for delete using (student_id = auth.uid());

create policy "students read own task progress" on public.task_progress for select using (student_id = auth.uid());
create policy "students create progress for followed roadmaps" on public.task_progress for insert to authenticated with check (
  student_id = auth.uid() and exists (
    select 1 from public.tasks t join public.roadmap_sections s on s.id = t.section_id
    join public.roadmap_followers f on f.roadmap_id = s.roadmap_id
    where t.id = task_id and f.student_id = auth.uid()
  )
);
create policy "students update own task progress" on public.task_progress for update
using (student_id = auth.uid()) with check (
  student_id = auth.uid() and exists (
    select 1 from public.tasks t join public.roadmap_sections s on s.id = t.section_id
    join public.roadmap_followers f on f.roadmap_id = s.roadmap_id
    where t.id = task_id and f.student_id = auth.uid()
  )
);
create policy "students delete own task progress" on public.task_progress for delete using (student_id = auth.uid());

-- Service-role clients bypass RLS and can be used for controlled administration/tag management.
