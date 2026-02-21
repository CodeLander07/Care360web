-- Extend rppg_sessions for reports, training, and recommended doctor
ALTER TABLE public.rppg_sessions ADD COLUMN IF NOT EXISTS processed_signal JSONB;
ALTER TABLE public.rppg_sessions ADD COLUMN IF NOT EXISTS instantaneous_bpm JSONB;
ALTER TABLE public.rppg_sessions ADD COLUMN IF NOT EXISTS recommended_doctor TEXT;
ALTER TABLE public.rppg_sessions ADD COLUMN IF NOT EXISTS risk_flags JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.rppg_sessions.processed_signal IS 'PPG waveform for graph display';
COMMENT ON COLUMN public.rppg_sessions.instantaneous_bpm IS 'Beat-to-beat BPM for fluctuation chart';
COMMENT ON COLUMN public.rppg_sessions.recommended_doctor IS 'Suggested specialist based on risk flags';
