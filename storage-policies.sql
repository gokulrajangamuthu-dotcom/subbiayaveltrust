-- Run in Supabase SQL Editor (after creating private buckets: videos, pdfs)
create policy "admin uploads files" on storage.objects for insert to authenticated
  with check (bucket_id in ('videos','pdfs') and is_admin());
create policy "logged in users read files" on storage.objects for select to authenticated
  using (bucket_id in ('videos','pdfs'));
