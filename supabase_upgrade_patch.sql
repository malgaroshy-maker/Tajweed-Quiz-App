-- ====================================================================
-- Tajweed Quiz App - Database Performance & Feature Upgrade Patch
-- (Run this in Supabase Dashboard > SQL Editor)
-- ====================================================================

-- 1. PERFORMANCE INDEXES (Speed up queries as data grows)
CREATE INDEX IF NOT EXISTS idx_questions_quiz_order ON public.questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_questions_teacher ON public.questions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON public.options(question_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON public.quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_folder ON public.quizzes(folder_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_share_code ON public.quizzes(share_code);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_student ON public.attempts(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON public.attempt_answers(attempt_id, question_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON public.ai_chat_messages(session_id);

-- 2. ENSURE STORAGE BUCKET EXISTS FOR IMAGE UPLOADS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('quiz-images', 'quiz-images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies to avoid duplicates before creating
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public Access for quiz images" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can upload quiz images" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can update quiz images" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can delete quiz images" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Storage RLS: Public can view images, authenticated users can upload/update/delete
CREATE POLICY "Public Access for quiz images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'quiz-images');

CREATE POLICY "Teachers can upload quiz images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

CREATE POLICY "Teachers can update quiz images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

CREATE POLICY "Teachers can delete quiz images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

-- 3. VACUUM ANALYZE (Refresh query planner statistics)
ANALYZE public.profiles;
ANALYZE public.folders;
ANALYZE public.quizzes;
ANALYZE public.questions;
ANALYZE public.options;
ANALYZE public.attempts;
ANALYZE public.attempt_answers;
