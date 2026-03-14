'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function moveQuiz(quizId: string, folderId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('quizzes')
    .update({ folder_id: folderId })
    .eq('id', quizId)
    .eq('teacher_id', user.id)

  if (!error) {
    revalidatePath('/teacher/quizzes')
  }
}
