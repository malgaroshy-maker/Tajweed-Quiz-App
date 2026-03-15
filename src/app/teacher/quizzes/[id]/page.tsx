import { QuizTabs } from './quiz-tabs'
import { Trash2, ArrowUp, ArrowDown, Plus, CheckCircle, Sparkles } from 'lucide-react'
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
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 vellum-glass p-8 rounded-[2.5rem] shadow-sm sticky top-0 z-10 transition-premium border-primary/10">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{quiz.title}</h1>
          {quiz.description && <p className="text-primary/60 mt-2 font-bold line-clamp-2 max-w-2xl">{quiz.description}</p>}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {quiz.is_published ? (
            <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-3 pr-6 rounded-2xl border border-green-200 shadow-inner">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">منشور ومتاح للطالبات</span>
                <span className="font-black text-2xl tracking-[0.2em] text-slate-900 dark:text-white">
                  {quiz.share_code}
                </span>
              </div>
              <form action={unpublishQuiz.bind(null, quiz.id) as unknown as string}>
                <Button variant="outline" size="lg" type="submit" className="h-12 px-6 rounded-xl font-black border-2 border-green-200 text-green-700 hover:bg-green-50 transition-premium">إيقاف النشر</Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-3 pr-6 rounded-2xl border border-primary/10 shadow-inner">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">مسودة قيد الإعداد</span>
                <span className="text-sm font-black text-slate-500 italic">غير مرئي للطالبات</span>
              </div>
              <div className="flex gap-2">
                <form action={publishQuiz.bind(null, quiz.id) as unknown as string}>
                  <Button type="submit" size="lg" className="h-12 px-8 rounded-xl font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.05] transition-premium">نشر الاختبار</Button>
                </form>
                <form action={deleteQuiz.bind(null, quiz.id, quiz.folder_id) as unknown as string}>
                  <Button variant="ghost" size="icon" type="submit" className="h-12 w-12 rounded-xl text-destructive hover:bg-red-50 transition-premium border border-transparent hover:border-red-100">
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>

      <QuizTabs quizId={quiz.id} questions={questions || []}>
        {/* Questions List */}
        <div className="grid gap-8 mt-8">
          {questions?.length === 0 ? (
            <div className="text-center py-24 parchment-card rounded-[4rem] border-4 border-dashed border-[#d4c3a3]/50">
               <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Plus className="w-12 h-12 text-primary opacity-20" />
              </div>
              <h3 className="text-3xl font-black text-slate-400">لا توجد أسئلة في هذا الاختبار</h3>
              <p className="text-slate-400 mt-4 text-lg font-bold">أضيفي سؤالاً جديداً أو استوردي من البنك للبدء</p>
            </div>
          ) : (
            questions?.map((q, idx) => (
              <div key={q.id} className="parchment-card rounded-[3rem] shadow-xl overflow-hidden group transition-premium hover:shadow-2xl flex flex-col border-none relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] pointer-events-none transition-transform group-hover:scale-110" />
                
                <div className="p-10 flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-black shadow-lg transition-premium group-hover:rotate-12">{idx + 1}</div>
                      <span className="text-[10px] px-4 py-1.5 bg-primary/10 text-primary rounded-full font-black uppercase tracking-[0.2em] border border-primary/10 shadow-sm">
                        {q.type === 'multiple_choice' ? 'خيارات متعددة' : q.type === 'true_false' ? 'صح أو خطأ' : q.type === 'fill_in_blank' ? 'إكمال الفراغ' : 'إجابة نصية'}
                      </span>
                      {q.difficulty && (
                        <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] border shadow-sm ${
                            q.difficulty === 'easy' ? 'bg-green-50 text-green-600 border-green-100' :
                            q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-100'
                        }`}>
                            {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                        </span>
                      )}
                    </div>
                    
                    <p className="font-black text-2xl leading-relaxed font-quran text-slate-900 dark:text-slate-100 pr-2">{q.text}</p>
                    
                    {q.image_url && (
                      <div className="mt-8 w-full max-w-md aspect-video rounded-[2.5rem] overflow-hidden border-4 border-[#d4c3a3]/30 bg-white/50 relative shadow-inner transition-premium group-hover:border-[#d4c3a3]/50">
                        <Image src={q.image_url} alt="Question content" fill className="object-contain p-4" />
                      </div>
                    )}

                    {q.options && q.options.length > 0 && (
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map((opt: { id: string; is_correct: boolean; text: string }) => (
                          <div key={opt.id} className={`p-5 rounded-2xl border-2 transition-premium flex items-center gap-4 shadow-sm ${opt.is_correct ? 'bg-green-50/50 border-green-200 text-green-900' : 'bg-white/50 border-primary/5 text-slate-600'}`}>
                            <div className={`w-3 h-3 rounded-full shadow-inner ${opt.is_correct ? 'bg-green-500 animate-pulse' : 'bg-slate-200'}`} />
                            <span className="font-bold font-quran text-lg">{opt.text}</span>
                            {opt.is_correct && <CheckCircle className="w-4 h-4 text-green-600 mr-auto" />}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.explanation && (
                      <div className="mt-8 p-6 vellum-glass rounded-[2rem] border border-primary/10 relative overflow-hidden group/exp">
                        <div className="absolute top-2 left-4 opacity-5 font-quran text-4xl pointer-events-none">توضيح</div>
                        <div className="flex items-center gap-3 mb-3 font-black text-[10px] uppercase tracking-[0.2em] text-primary">
                          <Sparkles className="w-4 h-4" />
                          الشرح المرفق
                        </div>
                        <p className="text-base leading-relaxed font-bold text-slate-700 italic pr-2">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-4 shrink-0 w-full md:w-auto">
                    <div className="flex gap-2 vellum-glass p-2 rounded-2xl shadow-inner justify-center border border-primary/10">
                      <form action={reorderQuestion.bind(null, q.id, 'up') as unknown as string}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl transition-premium hover:bg-white" disabled={idx === 0}>
                          <ArrowUp className="w-5 h-5" />
                        </Button>
                      </form>
                      <div className="w-[1px] h-6 bg-primary/10 my-auto" />
                      <form action={reorderQuestion.bind(null, q.id, 'down') as unknown as string}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl transition-premium hover:bg-white" disabled={idx === (questions?.length || 0) - 1}>
                          <ArrowDown className="w-5 h-5" />
                        </Button>
                      </form>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <EditQuestionDialog question={q} />
                      <form action={deleteQuestion.bind(null, q.id, quiz.id) as unknown as string}>
                        <Button variant="ghost" size="icon" type="submit" className="h-12 w-12 rounded-2xl text-destructive hover:bg-red-50 transition-premium border border-transparent hover:border-red-100 shadow-sm bg-white/50">
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </QuizTabs>
    </div>
  )
}
