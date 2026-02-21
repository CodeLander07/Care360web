-- rPPG Heart Rate Sessions (privacy-first: store signals + report only, no raw video)
CREATE TABLE IF NOT EXISTS public.rppg_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  avg_heart_rate INTEGER NOT NULL,
  signal_quality NUMERIC(4,2) NOT NULL,
  beats_analyzed INTEGER NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('High', 'Medium', 'Low')),
  report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rppg_sessions_user_id ON public.rppg_sessions(user_id);

ALTER TABLE public.rppg_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rppg_sessions_select_own"
  ON public.rppg_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "rppg_sessions_insert_own"
  ON public.rppg_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
