'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function publishQuiz(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const shortCode = generateShortCode()

  // Attempt to publish. Unique constraint on share_code is active, if it fails, regenerate (simplistic handling for MVP)
  await supabase
    .from('quizzes')
    .update({ is_published: true, share_code: shortCode })
    .eq('id', quizId)
    .eq('teacher_id', user.id)

  revalidatePath(`/teacher/quizzes/${quizId}`)
}

export async function unpublishQuiz(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('quizzes')
    .update({ is_published: false, share_code: null })
    .eq('id', quizId)
    .eq('teacher_id', user.id)

  revalidatePath(`/teacher/quizzes/${quizId}`)
}
