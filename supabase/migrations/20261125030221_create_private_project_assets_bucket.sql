-- Private per-user storage for production-project attachments.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entelaqtak-project-assets',
  'entelaqtak-project-assets',
  false,
  26214400,
  array[
    'image/jpeg','image/png','image/webp','image/gif',
    'audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/ogg',
    'video/mp4','video/webm','video/quicktime',
    'application/pdf','text/plain','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip'
  ]::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Project assets owner read" on storage.objects;
create policy "Project assets owner read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'entelaqtak-project-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Project assets owner upload" on storage.objects;
create policy "Project assets owner upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'entelaqtak-project-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Project assets owner update" on storage.objects;
create policy "Project assets owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'entelaqtak-project-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'entelaqtak-project-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Project assets owner delete" on storage.objects;
create policy "Project assets owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'entelaqtak-project-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
