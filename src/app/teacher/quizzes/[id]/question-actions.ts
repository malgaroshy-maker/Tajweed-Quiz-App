'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addQuestion(quizId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const text = formData.get('text') as string
  const type = formData.get('type') as string
  const topic = formData.get('topic') as string
  const explanation = formData.get('explanation') as string
  const imageUrl = formData.get('image_url') as string | null

  // Options logic depending on type
  const option1 = formData.get('option_1') as string
  const option2 = formData.get('option_2') as string
  const option3 = formData.get('option_3') as string
  const option4 = formData.get('option_4') as string
  const correctAnswer = formData.get('correct_answer') as string

  // Get current max order_index
  const { data: maxOrder } = await supabase
    .from('questions')
    .select('order_index')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: false })
    .limit(1)
  
  const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].order_index + 1 : 0

  const { data: question, error: qError } = await supabase
    .from('questions')
    .insert({
      teacher_id: user.id,
      quiz_id: quizId,
      text,
      type: type as "multiple_choice" | "true_false" | "short_answer" | "fill_in_blank",
      explanation,
      image_url: imageUrl,
      order_index: nextOrder,
      topic
    })
    .select()
    .single()

  if (qError || !question) return { error: qError?.message || 'Failed to add question' }

  // Insert options
  if (type === 'multiple_choice' || type === 'true_false' || type === 'fill_in_blank') {
    const optionsToInsert = []
    
    if (type === 'multiple_choice') {
      if (option1) optionsToInsert.push({ question_id: question.id, text: option1, is_correct: correctAnswer === '1' })
      if (option2) optionsToInsert.push({ question_id: question.id, text: option2, is_correct: correctAnswer === '2' })
      if (option3) optionsToInsert.push({ question_id: question.id, text: option3, is_correct: correctAnswer === '3' })
      if (option4) optionsToInsert.push({ question_id: question.id, text: option4, is_correct: correctAnswer === '4' })
    } else if (type === 'true_false') {
      optionsToInsert.push({ question_id: question.id, text: 'صح', is_correct: correctAnswer === 'true' })
      optionsToInsert.push({ question_id: question.id, text: 'خطأ', is_correct: correctAnswer === 'false' })
    } else if (type === 'fill_in_blank') {
      optionsToInsert.push({ question_id: question.id, text: correctAnswer, is_correct: true })
    }

    if (optionsToInsert.length > 0) {
      await supabase.from('options').insert(optionsToInsert)
    }
  }

  revalidatePath(`/teacher/quizzes/${quizId}`)
  return { success: true }
}

export async function getBankQuestions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('questions')
    .select('*, options(*)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function importQuestionsFromBank(quizId: string, questionIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Fetch the source questions
  const { data: sourceQuestions, error: fetchError } = await supabase
    .from('questions')
    .select('*, options(*)')
    .in('id', questionIds)

  if (fetchError || !sourceQuestions) return { error: 'Failed to fetch source questions' }

  // Get current max order_index
  const { data: maxOrder } = await supabase
    .from('questions')
    .select('order_index')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: false })
    .limit(1)
  
  let nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].order_index + 1 : 0

  for (const q of sourceQuestions) {
    // Insert new question
    const { data: newQuestion } = await supabase
      .from('questions')
      .insert({
        teacher_id: user.id,
        quiz_id: quizId,
        text: q.text,
        type: q.type,
        explanation: q.explanation,
        image_url: q.image_url,
        topic: q.topic,
        difficulty: q.difficulty,
        order_index: nextOrder++
      })
      .select()
      .single()

    if (newQuestion && q.options) {
      const optionsToInsert = q.options.map((opt: { text: string; is_correct: boolean }) => ({
        question_id: newQuestion.id,
        text: opt.text,
        is_correct: opt.is_correct
      }))
      await supabase.from('options').insert(optionsToInsert)
    }
  }

  revalidatePath(`/teacher/quizzes/${quizId}`)
  return { success: true }
}

export async function reorderQuestion(questionId: string, direction: 'up' | 'down') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { data: q } = await supabase
    .from('questions')
    .select('id, quiz_id, order_index')
    .eq('id', questionId)
    .single()

  if (!q || !q.quiz_id) return { error: 'Question not found' }

  const { data: questions } = await supabase
    .from('questions')
    .select('id, order_index')
    .eq('quiz_id', q.quiz_id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (!questions) return { error: 'Failed to fetch questions' }

  const currentIndex = questions.findIndex(item => item.id === questionId)
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

  if (targetIndex < 0 || targetIndex >= questions.length) return { error: 'Invalid move' }

  const targetQ = questions[targetIndex]

  // Update order_index for both
  await supabase.from('questions').update({ order_index: targetIndex }).eq('id', q.id)
  await supabase.from('questions').update({ order_index: currentIndex }).eq('id', targetQ.id)

  revalidatePath(`/teacher/quizzes/${q.quiz_id}`)
  return { success: true }
}
