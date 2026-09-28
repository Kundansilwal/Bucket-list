# Bucket List Drop

A production-oriented Next.js experience where every anonymous bucket list becomes a drop in a shared global water container.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Run `npm install`, then `npm run dev`.
3. Without Supabase environment variables, the app uses an in-memory demo store so the full submit/retrieve journey works locally. Demo entries reset on restart.

## Deploy with Supabase and Vercel

1. Create a Supabase project and run `supabase/migrations/0001_bucket_list_drop.sql` in its SQL editor (or use the Supabase CLI).
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Vercel. The service key is used only by server routes.
3. Set product limits (`GLOBAL_WATER_TARGET`, `MAX_ITEMS_PER_BUCKET_LIST`, `MAX_ITEM_LENGTH`) in Vercel.
4. Deploy. Individual `/bucket/:id` pages carry `noindex` metadata.

## Architecture and operations

- `create_bucket_list` is a transactional PostgreSQL function: it creates the public ID, list, item rows, and aggregate counters without race conditions.
- `global_stats` avoids a full `COUNT(*)` on homepage visits and allows stages beyond the configured target.
- The UI subscribes to Supabase Realtime updates for the one public `global_stats` row, with a 30-second resilience fallback. It never subscribes to bucket-list or item tables, so private list content is not broadcast.
- The included in-memory rate limiter protects a single runtime. Replace it with an atomic Upstash/Redis limiter before multi-instance production deployment. Consider Turnstile when abuse warrants it.
- RLS blocks table reads. The server service role accesses only the two narrow database functions and aggregate read.

## Checks

Run `npm run typecheck`, `npm run lint`, and `npm run build` before deploying.
# Bucket-list
