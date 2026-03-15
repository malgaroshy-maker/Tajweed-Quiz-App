import { QuizTabs } from './quiz-tabs'
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { EditQuestionDialog } from './edit-question-dialog'
import { deleteQuestion } from './delete-question-action'
import { reorderQuestion } from './question-actions'
import { Button } from '@/components/ui/button'
import { publishQuiz, unpublishQuiz } from '../actions'
import { deleteQuiz } from './delete-quiz-action'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'

export default async function QuizEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('teacher_id', user?.id)
    .single()

  if (!quiz) {
    notFound()
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('*, options(*)')
    .eq('quiz_id', quiz.id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border-2 border-muted/50">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{quiz.title}</h1>
          {quiz.description && <p className="text-sm text-muted-foreground mt-1 font-medium line-clamp-1">{quiz.description}</p>}
        </div>
        <div className="flex items-center gap-3">
                  {quiz.is_published ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">منشور الآن</span>
              <div className="flex gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-200">
                  {quiz.share_code}
                </span>
                <form action={unpublishQuiz.bind(null, quiz.id) as unknown as string}>
                  <Button variant="outline" size="sm" type="submit" className="h-8 rounded-lg font-bold">إيقاف</Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">مسودة غير منشورة</span>
              <div className="flex gap-2 w-full">
                <form action={publishQuiz.bind(null, quiz.id) as unknown as string} className="flex-1 sm:flex-none">
                  <Button type="submit" size="sm" className="h-9 w-full rounded-xl font-bold shadow-md">نشر الاختبار</Button>
                </form>
                <form action={deleteQuiz.bind(null, quiz.id, quiz.folder_id) as unknown as string}>
                  <Button variant="destructive" size="icon" type="submit" className="h-9 w-9 rounded-xl shadow-md">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuizTabs quizId={quiz.id} questions={questions || []}>
        {/* Questions List (This is passed as children to QuizTabs) */}
        <div className="grid gap-4">
          {questions?.map((q, idx) => (
            <div key={q.id} className="p-5 border-2 border-muted/50 rounded-2xl bg-card shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">{idx + 1}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                      {q.type === 'multiple_choice' ? 'خيارات' : q.type === 'true_false' ? 'صح/خطأ' : q.type === 'fill_in_blank' ? 'إكمال' : 'نص'}
                    </span>
                  </div>
                  <p className="font-bold text-lg leading-relaxed font-quran">{q.text}</p>
                  
                  {q.image_url && (
                    <div className="mt-4 w-full max-w-sm aspect-video rounded-xl overflow-hidden border-2 border-muted bg-muted/30 relative">
                      <Image src={q.image_url} alt="Question" fill className="object-contain" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                    <form action={reorderQuestion.bind(null, q.id, 'up') as unknown as string}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    </form>
                    <form action={reorderQuestion.bind(null, q.id, 'down') as unknown as string}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" disabled={idx === (questions?.length || 0) - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                  <div className="flex gap-1">
                    <EditQuestionDialog question={q} />
                    <form action={deleteQuestion.bind(null, q.id, quiz.id) as unknown as string}>
                      <Button variant="ghost" size="icon" type="submit" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>

              {q.options && q.options.length > 0 && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt: { id: string; is_correct: boolean; text: string }) => (
                    <div key={opt.id} className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center gap-2 ${opt.is_correct ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/20 border-transparent text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${opt.is_correct ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      {opt.text}
                    </div>
                  ))}
                </div>
              )}
              
              {q.explanation && (
                <div className="mt-4 p-3 bg-blue-50/50 border-2 border-blue-100/50 rounded-xl text-xs text-blue-700 font-medium italic">
                  <span className="font-black block mb-1 non-italic">الشرح:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </QuizTabs>
    </div>
  )
}
