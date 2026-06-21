-- Bảng cấu hình flow automation + trạng thái run (engine ở zalo-worker).
-- Chỉ service_role truy cập (RLS bật, không policy public).

create table if not exists public.automation_flows (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  enabled        boolean not null default false,
  trigger_source text,                              -- null = mọi nguồn; 'mooly' | 'infor'
  steps          jsonb not null default '[]'::jsonb,-- mảng step {id,type,config}
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id           uuid primary key default gen_random_uuid(),
  flow_id      uuid not null references public.automation_flows(id) on delete cascade,
  status       text not null default 'running',     -- running | waiting | done | failed
  context      jsonb not null default '{}'::jsonb,  -- biến: phone, ten, link_meet, uid...
  current_step int  not null default 0,             -- index step kế tiếp sẽ chạy
  resume_token text,                                -- token để n8n callback resume
  last_error   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_automation_runs_flow on public.automation_runs(flow_id);
create index if not exists idx_automation_runs_status on public.automation_runs(status);

alter table public.automation_flows enable row level security;
alter table public.automation_runs enable row level security;

comment on table public.automation_flows is 'Flow automation Zalo (step-list). Truy cập qua service_role.';
comment on table public.automation_runs is 'Trạng thái thực thi flow, hỗ trợ resume qua webhook n8n.';
