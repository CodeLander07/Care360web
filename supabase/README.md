# Supabase Setup

## Environment Variables

Add to `.env.local` (client requires `NEXT_PUBLIC_` prefix):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Copy values from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

## Running Migrations

**Option A: Supabase CLI (recommended)**

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

**Option B: Manual**

1. Open Supabase Dashboard → SQL Editor
2. Run each migration file in `supabase/migrations/` in order

## Security

- **Anon key**: Safe for client. RLS enforces data access.
- **Service role**: Never use in app code. Reserve for migrations/admin scripts only.
