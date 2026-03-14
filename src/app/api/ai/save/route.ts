import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await req.json()
  const { quizId, questions, question } = payload

  // Support both single "question" or array of "questions"
  const questionsToProcess = questions ? (Array.isArray(questions) ? questions : [questions]) : (question ? [question] : [])

  if (questionsToProcess.length === 0) {
    return NextResponse.json({ error: 'No questions provided' }, { status: 400 })
  }

  try {
    for (const q of questionsToProcess) {
      if (!q.text) continue

      const type = q.type || 'multiple_choice'

      const { data: insertedQuestion, error: qError } = await supabase
        .from('questions')
        .insert({
          teacher_id: user.id,
          quiz_id: (quizId === 'bank' || !quizId) ? null : quizId,
          text: q.text,
          type: type,
          explanation: q.explanation || null,
          topic: q.topic || 'AI Generated'
        })
        .select()
        .single()

      if (qError || !insertedQuestion) {
        console.error('Failed to insert question', qError)
        continue
      }

      // Insert options
      if (q.options && Array.isArray(q.options)) {
        const optionsToInsert = q.options.map((opt: { text: string; is_correct: boolean }) => ({
          question_id: insertedQuestion.id,
          text: opt.text,
          is_correct: opt.is_correct === true,
        }))

        if (optionsToInsert.length > 0) {
          await supabase.from('options').insert(optionsToInsert)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
