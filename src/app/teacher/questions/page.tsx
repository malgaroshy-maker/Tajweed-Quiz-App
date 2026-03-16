import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { Trash2, BookOpen } from 'lucide-react'
import { EditQuestionDialog } from '../quizzes/[id]/edit-question-dialog'
import { deleteQuestion } from '../quizzes/[id]/delete-question-action'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

export default async function QuestionBankPage({ searchParams }: { searchParams: Promise<{ search?: string, type?: string, topic?: string, difficulty?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch unique topics for filter
  const { data: topicsData } = await supabase
    .from('questions')
    .select('topic')
    .eq('teacher_id', user.id)
    .not('topic', 'is', null)
  
  const uniqueTopics = Array.from(new Set(topicsData?.map(t => t.topic).filter(Boolean)))

  let query = supabase
    .from('questions')
    .select('*, quizzes(title), options(*)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  if (params.search) query = query.ilike('text', `%${params.search}%`)
  if (params.type && params.type !== 'all') query = query.eq('type', params.type)
  if (params.topic && params.topic !== 'all') query = query.eq('topic', params.topic)
  if (params.difficulty && params.difficulty !== 'all') query = query.eq('difficulty', params.difficulty)

  const { data: questions } = await query

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">بنك الأسئلة</h1>
          <p className="text-primary/70 mt-2 text-lg font-medium">إدارة وتنظيم جميع الأسئلة الخاصة بكِ في مكان واحد</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] vellum-glass overflow-hidden transition-premium hover:shadow-primary/5">
        <CardContent className="p-8">
            <form className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="md:col-span-2 lg:col-span-1">
                    <Input name="search" defaultValue={params.search} placeholder="بحث في نص السؤال..." className="h-14 rounded-2xl border-2 border-primary/20 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-primary font-bold shadow-inner" />
                </div>
                
                <Select name="type" defaultValue={params.type || 'all'}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/20 bg-white/50 dark:bg-slate-800/50 font-bold">
                        <SelectValue placeholder="نوع السؤال" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="multiple_choice">اختيار من متعدد</SelectItem>
                        <SelectItem value="true_false">صح أو خطأ</SelectItem>
                        <SelectItem value="fill_in_blank">إكمال الفراغ</SelectItem>
                        <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
                    </SelectContent>
                </Select>

                <Select name="topic" defaultValue={params.topic || 'all'}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/20 bg-white/50 dark:bg-slate-800/50 font-bold">
                        <SelectValue placeholder="الموضوع" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                        <SelectItem value="all">جميع الموضوعات</SelectItem>
                        {uniqueTopics.map((topic) => (
                            <SelectItem key={topic} value={topic!}>{topic}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select name="difficulty" defaultValue={params.difficulty || 'all'}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/20 bg-white/50 dark:bg-slate-800/50 font-bold">
                        <SelectValue placeholder="الصعوبة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                        <SelectItem value="all">جميع المستويات</SelectItem>
                        <SelectItem value="easy">سهل</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="hard">صعب</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-3">
                    <Button type="submit" className="h-14 flex-1 rounded-2xl bg-primary font-black text-lg shadow-xl shadow-primary/20 transition-premium hover:scale-105">تصفية</Button>
                    <Link href="/teacher/questions" className="flex-1">
                        <Button variant="outline" type="button" className="h-14 w-full rounded-2xl border-2 border-primary/20 font-black text-lg transition-premium hover:bg-primary/5">مسح</Button>
                    </Link>
                </div>
            </form>
        </CardContent>
      </Card>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {questions?.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-24 parchment-card rounded-[4rem] border-4 border-dashed border-[#d4c3a3]/50">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-12 h-12 text-primary opacity-20" />
            </div>
            <h3 className="text-3xl font-black text-slate-400">لا توجد أسئلة تطابق بحثكِ</h3>
            <p className="text-slate-400 mt-4 text-lg font-bold">حاول تغيير معايير التصفية أو إضافة أسئلة جديدة</p>
          </div>
        ) : (
          questions?.map((q) => (
            <Card key={q.id} className="parchment-card border-none shadow-xl rounded-[3rem] overflow-hidden group transition-premium hover:scale-[1.02] flex flex-col">
              <CardContent className="p-10 flex flex-col h-full relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] pointer-events-none transition-transform group-hover:scale-110" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex flex-wrap gap-3">
                    <span className="text-[10px] px-4 py-1.5 bg-primary/10 text-primary rounded-full font-black uppercase tracking-[0.2em] border border-primary/10 shadow-sm">
                      {q.type === 'multiple_choice' ? 'خيارات' : q.type === 'true_false' ? 'صح/خطأ' : q.type === 'fill_in_blank' ? 'فراغ' : 'نص'}
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
                  <div className="flex gap-2 shrink-0 transition-premium group-hover:translate-x-0 sm:translate-x-2 sm:opacity-0 group-hover:opacity-100">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <EditQuestionDialog question={q as any} />
                    <form action={deleteQuestion.bind(null, q.id, q.quiz_id || 'bank') as unknown as string}>
                      <Button variant="ghost" size="icon" type="submit" className="h-10 w-10 text-destructive hover:bg-red-50 rounded-2xl transition-premium">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>
                </div>

                <p className="font-black text-2xl leading-relaxed text-slate-900 dark:text-slate-100 font-quran mb-8 line-clamp-4 pr-2">
                  {q.text}
                </p>

                <div className="mt-auto space-y-6">
                    {q.options && q.options.length > 0 && (
                        <div className="p-6 vellum-glass rounded-[2rem] border border-primary/10 shadow-inner relative overflow-hidden group/ans">
                            <div className="absolute top-2 left-2 opacity-5 font-quran text-4xl pointer-events-none">الإجابة</div>
                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] block mb-3">الإجابة الصحيحة</span>
                            <p className="font-black text-slate-900 dark:text-slate-100 text-lg leading-relaxed font-quran">
                                {q.options.find((o: { is_correct: boolean; text: string }) => o.is_correct)?.text || 'غير محددة'}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">الموضوع</span>
                            <span className="text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{q.topic || 'عام'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">الاختبار</span>
                            <span className="text-sm font-black text-primary truncate max-w-[140px] italic">
                                {(q.quizzes as unknown as { title: string })?.title || 'بنك الأسئلة'}
                            </span>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
