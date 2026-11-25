-- Entelaqtak: restrict service writes and move admin allowlist checks into RLS.
create or replace function public.heartbeat_visitor_session(
  p_session_id uuid,
  p_session_token text,
  p_user_id uuid,
  p_visitor_email text,
  p_page_path text,
  p_user_agent text,
  p_referrer text,
  p_ended boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := now();
begin
  if p_session_id is null
     or p_session_token is null
     or length(p_session_token) < 32
     or length(p_session_token) > 128 then
    raise exception 'Invalid visitor session credentials';
  end if;

  if p_user_id is null and p_visitor_email is not null then
    raise exception 'Anonymous session cannot claim an account';
  end if;

  if p_visitor_email is not null and length(p_visitor_email) > 254 then
    raise exception 'Invalid visitor email';
  end if;

  insert into public.visitor_sessions (
    session_id, session_token, user_id, visitor_email, page_path,
    first_seen, last_seen, ended_at, user_agent, referrer
  )
  values (
    p_session_id, p_session_token, p_user_id, p_visitor_email,
    left(coalesce(p_page_path, '/'), 500),
    v_now, v_now,
    case when coalesce(p_ended, false) then v_now else null end,
    left(coalesce(p_user_agent, ''), 500),
    left(coalesce(p_referrer, ''), 1000)
  )
  on conflict (session_id) do update
  set user_id = coalesce(public.visitor_sessions.user_id, excluded.user_id),
      visitor_email = coalesce(public.visitor_sessions.visitor_email, excluded.visitor_email),
      page_path = excluded.page_path,
      last_seen = excluded.last_seen,
      ended_at = excluded.ended_at,
      user_agent = excluded.user_agent,
      referrer = excluded.referrer
  where public.visitor_sessions.session_token = excluded.session_token
    and (
      public.visitor_sessions.user_id is null
      or public.visitor_sessions.user_id = excluded.user_id
    );

  if not found then
    raise exception 'Invalid visitor session credentials';
  end if;
end;
$$;

revoke all on function public.heartbeat_visitor_session(uuid,text,uuid,text,text,text,text,boolean)
  from public, anon, authenticated;
grant execute on function public.heartbeat_visitor_session(uuid,text,uuid,text,text,text,text,boolean)
  to service_role;

drop policy if exists "No direct access to site admin allowlist" on public.site_admins;
drop policy if exists "Admins can verify their own allowlist entry" on public.site_admins;
create policy "Admins can verify their own allowlist entry"
  on public.site_admins
  for select
  to authenticated
  using (
    lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );

revoke all on public.site_admins from anon, authenticated;
grant select on public.site_admins to authenticated;

drop policy if exists "Only site admins can read visitor sessions" on public.visitor_sessions;
create policy "Only site admins can read visitor sessions"
  on public.visitor_sessions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.site_admins as admins
      where lower(admins.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    )
  );

revoke all on function public.is_site_admin() from public, anon, authenticated;
drop function if exists public.is_site_admin();

notify pgrst, 'reload schema';
