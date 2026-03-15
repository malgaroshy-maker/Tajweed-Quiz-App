'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

function normalizeArabic(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "") // Remove tashkeel (diacritics)
    .replace(/[أإآ]/g, "ا") // Normalize Alefs
    .replace(/ة/g, "ه") // Normalize Teh Marbuta
    .replace(/ى/g, "ي") // Normalize Alef Maqsura
    .replace(/\s+/g, " ") // Normalize whitespace
}

export async function submitQuizAction(quizId: string, shareCode: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch Questions to evaluate
  const { data: questions } = await supabase
    .from('questions')
    .select('id, type')
    .eq('quiz_id', quizId)

  if (!questions) throw new Error('Questions not found')

  // 2. Evaluate Score
  let score = 0
  const evaluatedAnswers = []

  for (const q of questions) {
    const submittedValue = formData.get(`question_${q.id}`) as string
    let isCorrect = false

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      const { data: correctOption } = await supabase
        .from('options')
        .select('is_correct')
        .eq('id', submittedValue)
        .single()
      
      if (correctOption?.is_correct) {
        isCorrect = true
        score++
      }

      evaluatedAnswers.push({
        question_id: q.id,
        selected_option_id: submittedValue || null,
        is_correct: isCorrect
      })
    } else if (q.type === 'fill_in_blank') {
      const { data: correctOption } = await supabase
        .from('options')
        .select('text')
        .eq('question_id', q.id)
        .eq('is_correct', true)
        .single()
      
      const answer = normalizeArabic(submittedValue || '')
      const correct = normalizeArabic(correctOption?.text || '')
      
      // Support multiple possible correct answers separated by |
      const possibleAnswers = correct.split('|').map(a => a.trim())
      
      if (possibleAnswers.includes(answer)) {
        isCorrect = true
        score++
      }

      evaluatedAnswers.push({
        question_id: q.id,
        text_answer: submittedValue || null,
        is_correct: isCorrect
      })
    } else {
      evaluatedAnswers.push({
        question_id: q.id,
        text_answer: submittedValue || null,
        is_correct: false 
      })
    }
  }

  // 3. Insert Attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .insert({
      quiz_id: quizId,
      student_id: user ? user.id : null,
      guest_name: user ? null : (formData.get('guest_name') as string || 'زائر'),
      score: score,
      total_questions: questions.length,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (attemptError || !attempt) {
    console.error(attemptError)
    throw new Error('Failed to save attempt')
  }

  // 4. Insert Attempt Answers
  const answersToInsert = evaluatedAnswers.map(a => ({
    ...a,
    attempt_id: attempt.id
  }))

  await supabase.from('attempt_answers').insert(answersToInsert)

  redirect(`/take-quiz/${shareCode}/result?attempt=${attempt.id}`)
}
