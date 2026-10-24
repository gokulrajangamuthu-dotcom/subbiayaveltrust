# Content Portal

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and paste your Supabase URL + anon key
3. Supabase: run the database SQL, create private buckets `videos` and `pdfs`, then run `storage-policies.sql`
4. Supabase > Authentication > Providers > Email: turn OFF "Confirm email" (easier for testing)
5. `npm run dev` then open http://localhost:3000
