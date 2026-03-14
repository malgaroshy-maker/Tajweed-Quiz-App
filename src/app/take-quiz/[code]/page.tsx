import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { QuizForm } from '@/components/quiz-form'
import { submitQuizAction } from './actions'

export default async function TakeQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ guest_name?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const guestName = resolvedSearch.guest_name || ''
  const supabase = await createClient()

  // 1. Fetch Quiz by share_code
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, description, is_published, share_code')
    .eq('share_code', resolvedParams.code)
    .single()

  if (!quiz || !quiz.is_published) {
    notFound()
  }

  // 2. Fetch Questions & Options
  const { data: questions } = await supabase
    .from('questions')
    .select('*, options(id, text)')
    .eq('quiz_id', quiz.id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-xl">لا توجد أسئلة في هذا الاختبار بعد.</div>
  }

  // Randomized version (optional: keep randomization but handle order_index if desired)
  // For now, we respect the teacher's order_index but we can still randomize options
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      // eslint-disable-next-line react-hooks/purity
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const processedQuestions = questions.map(q => ({
    ...q,
    options: q.options ? shuffleArray(q.options) : undefined
  }))

  const bindedSubmitAction = submitQuizAction.bind(null, quiz.id, quiz.share_code!)

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">{quiz.title}</h1>
        {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
      </div>

      <QuizForm 
        quiz={quiz} 
        questions={processedQuestions} 
        guestName={guestName} 
        submitAction={bindedSubmitAction} 
      />
    </div>
  )
}
