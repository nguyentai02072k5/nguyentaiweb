-- ---------------------------------------------------------------------------
-- 0011_leads_source_group_unique.sql
--
-- Tách lead theo NGUỒN khi cùng số điện thoại.
--
-- Trước đây `phone` unique toàn cục + RPC `on conflict (phone)` → 1 SĐT từng vào
-- infor.* mà sau đó điền form.* (Bot Mooly) sẽ GHI ĐÈ chung 1 row, trộn dữ liệu
-- 2 nguồn. Giờ tách: mỗi (SĐT × nhóm-nguồn) là 1 lead độc lập.
--
--   - source_group: cột sinh tự động từ `source` ('mooly%' → 'mooly', còn lại 'infor').
--   - Bỏ unique đơn trên phone, thay bằng unique (phone, source_group).
--   - 2 RPC upsert đổi conflict target sang (phone, source_group).
-- ---------------------------------------------------------------------------

-- 1. Bỏ mọi unique-constraint chỉ-trên-phone (tên auto có thể là leads_phone_key).
do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'leads'
      and con.contype = 'u'
      and (
        select array_agg(att.attname::text order by att.attnum)
        from unnest(con.conkey) as k(attnum)
        join pg_attribute att on att.attrelid = con.conrelid and att.attnum = k.attnum
      ) = array['phone']::text[]
  loop
    execute format('alter table public.leads drop constraint %I', c.conname);
  end loop;
end $$;

-- 2. Cột nhóm-nguồn sinh tự động (stored → index được).
alter table public.leads
  add column if not exists source_group text
  generated always as (
    case when source like 'mooly%' then 'mooly' else 'infor' end
  ) stored;

-- 3. Unique mới theo (phone, source_group).
create unique index if not exists leads_phone_source_group_key
  on public.leads (phone, source_group);

create index if not exists idx_leads_source_group on public.leads (source_group);

-- 4. RPC record_lead_open - conflict target (phone, source_group).
create or replace function public.record_lead_open(
  p_phone      text,
  p_user_agent text default null,
  p_ip_hash    text default null,
  p_source     text default 'infor-link'
)
returns table (id uuid, status text, full_name text, payload jsonb)
language plpgsql
as $$
begin
  return query
  insert into public.leads (phone, status, user_agent, ip_hash, source)
  values (p_phone, 'opened', p_user_agent, p_ip_hash, coalesce(p_source, 'infor-link'))
  on conflict (phone, source_group) do update
    set open_count = public.leads.open_count + 1,
        opened_at  = now(),
        user_agent = coalesce(excluded.user_agent, public.leads.user_agent)
  returning public.leads.id, public.leads.status, public.leads.full_name, public.leads.payload;
end;
$$;

-- 5. RPC submit_lead - conflict target (phone, source_group).
create or replace function public.submit_lead(
  p_phone      text,
  p_full_name  text default null,
  p_payload    jsonb default '{}'::jsonb,
  p_user_agent text default null,
  p_ip_hash    text default null,
  p_source     text default 'infor-link'
)
returns table (id uuid, status text, submitted_at timestamptz)
language plpgsql
as $$
begin
  return query
  insert into public.leads (phone, status, full_name, payload, submitted_at, user_agent, ip_hash, source)
  values (p_phone, 'submitted', p_full_name, coalesce(p_payload, '{}'::jsonb), now(),
          p_user_agent, p_ip_hash, coalesce(p_source, 'infor-link'))
  on conflict (phone, source_group) do update
    set status       = 'submitted',
        full_name    = coalesce(excluded.full_name, public.leads.full_name),
        payload      = coalesce(excluded.payload, public.leads.payload),
        submitted_at = now(),
        user_agent   = coalesce(excluded.user_agent, public.leads.user_agent),
        ip_hash      = coalesce(excluded.ip_hash, public.leads.ip_hash)
  returning public.leads.id, public.leads.status, public.leads.submitted_at;
end;
$$;
