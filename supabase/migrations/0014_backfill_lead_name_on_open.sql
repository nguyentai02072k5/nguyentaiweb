-- ---------------------------------------------------------------------------
-- 0014_backfill_lead_name_on_open.sql
--
-- Map sẵn TÊN (không chỉ SĐT) khi khách mở link theo số điện thoại.
--
-- Trước đây record_lead_open chỉ insert phone → row mới luôn full_name NULL.
-- Do leads tách theo (phone, source_group), 1 SĐT đã điền tên ở nhóm 'infor'
-- khi mở form.* (nhóm 'mooly') vẫn KHÔNG lấy được tên đó → form chỉ prefill SĐT.
--
-- Sửa: lúc mở link, tra tên đã biết từ BẤT KỲ lead nào cùng SĐT (ưu tiên bản đã
-- submit gần nhất) rồi điền vào row đang mở. Idempotent: không ghi đè tên row đã có.
-- ---------------------------------------------------------------------------

create or replace function public.record_lead_open(
  p_phone      text,
  p_user_agent text default null,
  p_ip_hash    text default null,
  p_source     text default 'infor-link'
)
returns table (id uuid, status text, full_name text, payload jsonb)
language plpgsql
as $$
declare
  v_known_name text;
begin
  -- Tên đã biết từ bất kỳ lead nào cùng SĐT (mọi nguồn). Ưu tiên bản đã submit
  -- gần nhất → tên chính xác do khách tự điền, không phải tên tạm.
  select l.full_name into v_known_name
  from public.leads l
  where l.phone = p_phone
    and l.full_name is not null
    and btrim(l.full_name) <> ''
  order by (l.status = 'submitted') desc,
           l.submitted_at desc nulls last,
           l.updated_at desc
  limit 1;

  return query
  insert into public.leads (phone, status, full_name, user_agent, ip_hash, source)
  values (p_phone, 'opened', v_known_name, p_user_agent, p_ip_hash, coalesce(p_source, 'infor-link'))
  on conflict (phone, source_group) do update
    set open_count = public.leads.open_count + 1,
        opened_at  = now(),
        -- Chỉ điền tên khi row hiện chưa có → không đè tên khách đã tự sửa.
        full_name  = coalesce(public.leads.full_name, v_known_name),
        user_agent = coalesce(excluded.user_agent, public.leads.user_agent)
  returning public.leads.id, public.leads.status, public.leads.full_name, public.leads.payload;
end;
$$;
