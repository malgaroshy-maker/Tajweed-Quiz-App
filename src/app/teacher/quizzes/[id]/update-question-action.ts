'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateQuestion(questionId: string, quizId: string | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const text = formData.get('text') as string
  const type = formData.get('type') as string
  const topic = formData.get('topic') as string
  const explanation = formData.get('explanation') as string
  
  // Update question
  const { error: qError } = await supabase
    .from('questions')
    .update({
      text,
      type,
      explanation,
      topic,
    })
    .eq('id', questionId)
    .eq('teacher_id', user.id)

  if (qError) return { error: qError.message }

  // Update options: Delete all and re-insert
  await supabase.from('options').delete().eq('question_id', questionId)

  const optionsToInsert = []
  
  if (type === 'multiple_choice') {
    const options = JSON.parse(formData.get('options') as string)
    for (const opt of options) {
      if (opt.text) {
        optionsToInsert.push({ question_id: questionId, text: opt.text, is_correct: opt.is_correct })
      }
    }
  } else if (type === 'true_false') {
    const isCorrectTrue = formData.get('correct_option') === 'true'
    optionsToInsert.push({ question_id: questionId, text: 'صح', is_correct: isCorrectTrue })
    optionsToInsert.push({ question_id: questionId, text: 'خطأ', is_correct: !isCorrectTrue })
  } else if (type === 'fill_in_blank') {
    const fillAnswer = formData.get('fill_answer') as string
    optionsToInsert.push({ question_id: questionId, text: fillAnswer, is_correct: true })
  }

  if (optionsToInsert.length > 0) {
    await supabase.from('options').insert(optionsToInsert)
  }

  revalidatePath(`/teacher/quizzes/${quizId || 'bank'}`)
  revalidatePath(`/teacher/questions`)
  return { success: true }
}
