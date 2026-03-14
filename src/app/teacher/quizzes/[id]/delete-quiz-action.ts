'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteQuiz(quizId: string, folderId: string | null, formData?: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // RLS will ensure the teacher owns the quiz
  await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)
    .eq('teacher_id', user.id)

  revalidatePath('/teacher/folders')
  if (folderId) {
    revalidatePath(`/teacher/folders/${folderId}`)
    redirect(`/teacher/folders/${folderId}`)
  } else {
    redirect('/teacher')
  }
}
