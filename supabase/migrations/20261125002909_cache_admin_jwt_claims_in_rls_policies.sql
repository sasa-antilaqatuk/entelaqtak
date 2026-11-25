drop policy if exists "Admins can verify their own allowlist entry" on public.site_admins;
create policy "Admins can verify their own allowlist entry"
  on public.site_admins
  for select
  to authenticated
  using (
    lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
  );

drop policy if exists "Only site admins can read visitor sessions" on public.visitor_sessions;
create policy "Only site admins can read visitor sessions"
  on public.visitor_sessions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.site_admins as admins
      where lower(admins.email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
    )
  );
