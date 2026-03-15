'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteQuestion(questionId: string, quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // Due to RLS, teacher can only delete their own questions
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('teacher_id', user.id)

  if (!error) {
    if (quizId !== 'bank') {
      revalidatePath(`/teacher/quizzes/${quizId}`)
    }
    revalidatePath(`/teacher/questions`)
  }
}
