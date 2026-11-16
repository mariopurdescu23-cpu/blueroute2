-- Run once in Supabase SQL Editor before enabling request submission.
create table if not exists public.requests (
 id uuid primary key,
 reference text not null unique,
 request_key uuid not null unique,
 created_at timestamptz not null default now(),
 status text not null default 'De analizat' check (status in ('De analizat','În pregătire','Ofertă trimisă','Finalizat','Arhivat')),
 data jsonb not null,
 files jsonb not null default '[]'::jsonb,
 fee text not null default '',
 delivery text not null default '',
 admin_notes text not null default '',
 quote_text text not null default '',
 notification text not null default 'not_configured'
);
create index if not exists requests_created_at_idx on public.requests (created_at desc);
alter table public.requests enable row level security;
revoke all on public.requests from anon, authenticated;
-- All database operations use the server-only service role. No public read policies.
insert into storage.buckets (id,name,public,file_size_limit)
values ('blue-route-documents','blue-route-documents',false,26214400)
on conflict (id) do nothing;
-- Do not add public bucket policies. The server issues short-lived signed URLs.
