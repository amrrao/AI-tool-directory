create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  stripe_customer_id text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
on public.users
for select
using (auth.uid() = id);

create policy "Users can update own data"
on public.users
for update
using (auth.uid() = id);
