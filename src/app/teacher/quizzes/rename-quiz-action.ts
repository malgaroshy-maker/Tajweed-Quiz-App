'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function renameQuiz(id: string, newTitle: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await supabase
    .from('quizzes')
    .update({ title: newTitle })
    .eq('id', id)
    .eq('teacher_id', user.id)

  revalidatePath('/teacher/quizzes')
}
