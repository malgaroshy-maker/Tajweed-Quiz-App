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

      <Card className="border-none shadow-xl shadow-primary/5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8">
            <form className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="md:col-span-2 lg:col-span-1">
                    <Input name="search" defaultValue={params.search} placeholder="بحث في نص السؤال..." className="h-12 rounded-xl border-2 focus-visible:ring-primary" />
                </div>
                
                <Select name="type" defaultValue={params.type || 'all'}>
                    <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="نوع السؤال" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="multiple_choice">اختيار من متعدد</SelectItem>
                        <SelectItem value="true_false">صح أو خطأ</SelectItem>
                        <SelectItem value="fill_in_blank">إكمال الفراغ</SelectItem>
                        <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
                    </SelectContent>
                </Select>

                <Select name="topic" defaultValue={params.topic || 'all'}>
                    <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="الموضوع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الموضوعات</SelectItem>
                        {uniqueTopics.map((topic) => (
                            <SelectItem key={topic} value={topic!}>{topic}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select name="difficulty" defaultValue={params.difficulty || 'all'}>
                    <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="الصعوبة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع المستويات</SelectItem>
                        <SelectItem value="easy">سهل</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="hard">صعب</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button type="submit" className="h-12 flex-1 rounded-xl bg-primary font-bold shadow-lg shadow-primary/20">تصفية</Button>
                    <Link href="/teacher/questions" className="flex-1">
                        <Button variant="outline" type="button" className="h-12 w-full rounded-xl border-2 font-bold">مسح</Button>
                    </Link>
                </div>
            </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {questions?.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/30">
            <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-2xl font-black text-slate-400">لا توجد أسئلة تطابق بحثكِ</h3>
            <p className="text-slate-400 mt-2 font-medium">حاولي تغيير معايير التصفية أو إضافة أسئلة جديدة</p>
          </div>
        ) : (
          questions?.map((q) => (
            <Card key={q.id} className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden group hover:border-primary/30 transition-all flex flex-col">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-3 py-1 bg-primary/10 text-primary rounded-full font-black uppercase tracking-widest border border-primary/10">
                      {q.type === 'multiple_choice' ? 'خيارات' : q.type === 'true_false' ? 'صح/خطأ' : q.type === 'fill_in_blank' ? 'فراغ' : 'نص'}
                    </span>
                    {q.difficulty && (
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                            q.difficulty === 'easy' ? 'bg-green-50 text-green-600 border-green-100' :
                            q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-100'
                        }`}>
                            {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                        </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <EditQuestionDialog question={q as any} />
                    <form action={deleteQuestion.bind(null, q.id, q.quiz_id || 'bank') as unknown as string}>
                      <Button variant="ghost" size="icon" type="submit" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>

                <p className="font-black text-xl leading-relaxed text-slate-900 dark:text-slate-100 font-quran mb-6 line-clamp-3">
                  {q.text}
                </p>

                <div className="mt-auto space-y-4">
                    {q.options && q.options.length > 0 && (
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest block mb-2">الإجابة الصحيحة</span>
                            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                {q.options.find((o: { is_correct: boolean; text: string }) => o.is_correct)?.text || 'غير محددة'}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الموضوع</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{q.topic || 'عام'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الاختبار</span>
                            <span className="text-xs font-bold text-primary truncate max-w-[120px]">
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
