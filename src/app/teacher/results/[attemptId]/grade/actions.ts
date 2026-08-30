'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function gradeVoiceAnswerAction(
  attemptId: string,
  answerId: string,
  formData: FormData
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const isCorrect = formData.get('is_correct') === 'true'
  const teacherScore = isCorrect ? 1 : 0
  const teacherFeedback = (formData.get('teacher_feedback') as string)?.trim() || null

  // 1. Update the specific attempt_answer
  await supabase
    .from('attempt_answers')
    .update({
      is_correct: isCorrect,
      teacher_score: teacherScore,
      teacher_feedback: teacherFeedback,
      graded_at: new Date().toISOString()
    })
    .eq('id', answerId)
    .eq('attempt_id', attemptId)

  // 2. Recalculate total score for this attempt
  const { data: allAnswers } = await supabase
    .from('attempt_answers')
    .select('is_correct')
    .eq('attempt_id', attemptId)

  if (allAnswers) {
    const newTotalScore = allAnswers.filter(a => a.is_correct).length

    await supabase
      .from('attempts')
      .update({ score: newTotalScore })
      .eq('id', attemptId)
  }

  revalidatePath(`/teacher/results`)
  revalidatePath(`/teacher/results/${attemptId}/grade`)
}
