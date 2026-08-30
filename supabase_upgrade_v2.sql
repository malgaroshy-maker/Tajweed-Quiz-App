-- ====================================================================
-- Al-Qalam (القلم) Tajweed Quiz App - Database Upgrade Patch v2.0
-- (Idempotent: Safe to run multiple times in Supabase SQL Editor)
-- ====================================================================

-- 1. EXTEND QUIZZES TABLE WITH TIMING & HALAQAH TARGETING
ALTER TABLE public.quizzes 
  ADD COLUMN IF NOT EXISTS time_limit_minutes integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS start_date timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS end_date timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_halaqah_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS allow_guest boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_answers_after_submission boolean DEFAULT true;

-- 2. EXTEND QUESTIONS TABLE WITH AUDIO & TAJWEED METADATA
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS audio_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS surah_number integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ayah_number integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reciter_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS audio_start_time numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS audio_end_time numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tajweed_rule text DEFAULT NULL;

-- 3. EXTEND ATTEMPT_ANSWERS TABLE FOR VOICE SUBMISSIONS & TEACHER GRADING
ALTER TABLE public.attempt_answers
  ADD COLUMN IF NOT EXISTS voice_recording_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS teacher_feedback text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS teacher_score numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS graded_at timestamptz DEFAULT NULL;

-- 4. HALAQAT (CLASSROOM / STUDY GROUPS) TABLES
CREATE TABLE IF NOT EXISTS public.halaqat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.halaqah_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  halaqah_id uuid NOT NULL REFERENCES public.halaqat(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (halaqah_id, student_id)
);

-- Foreign key link from quizzes to halaqat if not already added
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_quizzes_target_halaqah'
  ) THEN
    ALTER TABLE public.quizzes
      ADD CONSTRAINT fk_quizzes_target_halaqah 
      FOREIGN KEY (target_halaqah_id) REFERENCES public.halaqat(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- 5. ENABLE ROW LEVEL SECURITY (RLS) ON NEW TABLES
ALTER TABLE public.halaqat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halaqah_members ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR HALAQAT
DO $$ BEGIN
  DROP POLICY IF EXISTS "Teachers can manage their own halaqat" ON public.halaqat;
  DROP POLICY IF EXISTS "Students can view halaqat they joined or by code" ON public.halaqat;
  DROP POLICY IF EXISTS "Public can view halaqat for code verification" ON public.halaqat;
  DROP POLICY IF EXISTS "Authenticated users can view halaqat" ON public.halaqat;
  DROP POLICY IF EXISTS "Public can view halaqat for join code verification" ON public.halaqat;
EXCEPTION WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Teachers can manage their own halaqat" 
  ON public.halaqat FOR ALL 
  USING (auth.uid() = teacher_id);

CREATE POLICY "Authenticated users can view halaqat" 
  ON public.halaqat FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Public can view halaqat for join code verification" 
  ON public.halaqat FOR SELECT 
  TO anon 
  USING (true);

-- 7. RLS POLICIES FOR HALAQAH MEMBERS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Teachers can view members of their halaqat" ON public.halaqah_members;
  DROP POLICY IF EXISTS "Teachers can remove members from their halaqat" ON public.halaqah_members;
  DROP POLICY IF EXISTS "Students can join halaqat" ON public.halaqah_members;
  DROP POLICY IF EXISTS "Students can view their own halaqah memberships" ON public.halaqah_members;
  DROP POLICY IF EXISTS "Students can manage their own memberships" ON public.halaqah_members;
EXCEPTION WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Students can manage their own memberships" 
  ON public.halaqah_members FOR ALL 
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view members of their halaqat" 
  ON public.halaqah_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.halaqat 
      WHERE halaqat.id = halaqah_members.halaqah_id 
      AND halaqat.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can remove members from their halaqat" 
  ON public.halaqah_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.halaqat 
      WHERE halaqat.id = halaqah_members.halaqah_id 
      AND halaqat.teacher_id = auth.uid()
    )
  );

-- 8. PROVISION QUIZ-AUDIO STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('quiz-audio', 'quiz-audio', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage audio policies before creating to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public Access for quiz audio" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload quiz audio" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update quiz audio" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete quiz audio" ON storage.objects;
EXCEPTION WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Public Access for quiz audio" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'quiz-audio');

CREATE POLICY "Authenticated users can upload quiz audio" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'quiz-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update quiz audio" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'quiz-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete quiz audio" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'quiz-audio' AND auth.role() = 'authenticated');

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_halaqat_teacher ON public.halaqat(teacher_id);
CREATE INDEX IF NOT EXISTS idx_halaqat_code ON public.halaqat(code);
CREATE INDEX IF NOT EXISTS idx_halaqah_members_student ON public.halaqah_members(student_id);
CREATE INDEX IF NOT EXISTS idx_halaqah_members_halaqah ON public.halaqah_members(halaqah_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_target_halaqah ON public.quizzes(target_halaqah_id);
CREATE INDEX IF NOT EXISTS idx_questions_audio ON public.questions(surah_number, ayah_number);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_voice ON public.attempt_answers(voice_recording_url) WHERE voice_recording_url IS NOT NULL;

-- 10. REFRESH QUERY PLANNER STATISTICS
ANALYZE public.profiles;
ANALYZE public.halaqat;
ANALYZE public.halaqah_members;
ANALYZE public.quizzes;
ANALYZE public.questions;
ANALYZE public.options;
ANALYZE public.attempts;
ANALYZE public.attempt_answers;

-- 11. MIGRATE AI MODEL DEFAULTS TO GEMINI 3.X SERIES
ALTER TABLE public.profiles
  ALTER COLUMN gemini_model SET DEFAULT 'gemini-3.7-flash',
  ALTER COLUMN openrouter_model SET DEFAULT 'auto-quality-free';

UPDATE public.profiles
  SET gemini_model = 'gemini-3.7-flash'
  WHERE gemini_model IN ('gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash') OR gemini_model IS NULL;

UPDATE public.profiles
  SET openrouter_model = 'auto-quality-free'
  WHERE openrouter_model IS NULL OR openrouter_model = 'google/gemini-2.0-flash-001';


