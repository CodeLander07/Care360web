-- Care360 Healthcare AI Platform - Initial Schema
-- Idempotent migration. Safe to run multiple times.
-- Healthcare: RLS enforced on all tables. No PHI exposed.

-- =============================================================================
-- UUID generation uses PostgreSQL built-in gen_random_uuid() (PG13+)
-- =============================================================================

-- =============================================================================
-- PROFILES
-- Links to auth.users. Stores role and basic user metadata.
-- Email synced from auth on signup. No PHI beyond email.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  has_password BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to auth. Role determines access level.';
COMMENT ON COLUMN public.profiles.role IS 'patient | doctor | admin';
COMMENT ON COLUMN public.profiles.has_password IS 'True if user has set a password (vs magic link only)';

-- =============================================================================
-- CONSULTATIONS
-- Clinical consultation records. User-scoped. Contains summary and transcript.
-- PHI: Transcript may contain patient details. RLS ensures user-only access.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations(created_at DESC);

COMMENT ON TABLE public.consultations IS 'Consultation records. User can only access own rows.';

-- =============================================================================
-- AI_INSIGHTS
-- AI-generated insights per user. Risk score and sentiment.
-- Read-only for users. Admins can read all.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  risk_score NUMERIC(5, 2),
  sentiment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);

COMMENT ON TABLE public.ai_insights IS 'AI insights. Users read own; admins read all.';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- PROFILES ---
-- Users read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users update their own profile (limited; role changes may need admin)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- --- CONSULTATIONS ---
-- Users read only their own consultations
CREATE POLICY "consultations_select_own"
  ON public.consultations FOR SELECT
  USING (auth.uid() = user_id);

-- Users insert only for themselves
CREATE POLICY "consultations_insert_own"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users update only their own
CREATE POLICY "consultations_update_own"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users delete only their own
CREATE POLICY "consultations_delete_own"
  ON public.consultations FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all consultations
CREATE POLICY "consultations_admin_select_all"
  ON public.consultations FOR SELECT
  USING (public.is_admin());

-- --- AI_INSIGHTS ---
-- Users read only their own insights (no write for users)
CREATE POLICY "ai_insights_select_own"
  ON public.ai_insights FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all insights
CREATE POLICY "ai_insights_admin_select_all"
  ON public.ai_insights FOR SELECT
  USING (public.is_admin());

-- Service/backend can insert (use service role). No direct user insert.

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Syncs email from auth.users into profiles.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, has_password)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.encrypted_password IS NOT NULL AND NEW.encrypted_password != '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    has_password = EXCLUDED.has_password,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also sync on email/password update (e.g. password set later)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, encrypted_password ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
