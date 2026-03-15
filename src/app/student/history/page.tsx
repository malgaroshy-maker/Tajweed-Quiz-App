import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, ChevronRight, History as HistoryIcon, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function StudentHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, quizzes(title, share_code)')
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl w-fit border border-primary/10 shadow-sm transition-premium hover:shadow-md">
        <Link href="/student" className="text-primary/60 hover:text-primary font-black transition-premium">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-5 h-5 text-primary/20" />
        <h1 className="text-xl font-black text-slate-900 dark:text-white">تاريخ اختباراتي</h1>
      </div>

      <div className="grid gap-6">
        {attempts?.length === 0 ? (
          <div className="text-center py-24 parchment-card rounded-[4rem] border-4 border-dashed border-[#d4c3a3]/50">
             <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <HistoryIcon className="w-12 h-12 text-primary opacity-20" />
            </div>
            <h3 className="text-3xl font-black text-slate-400">لا توجد اختبارات مسجلة</h3>
            <p className="text-slate-400 mt-4 text-lg font-bold italic">ابدئي برحلة التعلم وخوض الاختبارات لتظهر هنا</p>
          </div>
        ) : (
          attempts?.map((attempt) => {
            const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
            const isPassing = percentage >= 50

            return (
              <Card key={attempt.id} className="parchment-card border-none shadow-lg transition-premium hover:scale-[1.005] hover:shadow-2xl rounded-[2.5rem] overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-8">
                    <div className="flex items-center gap-8 flex-1 w-full text-right">
                      <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center font-black shadow-xl transition-premium group-hover:rotate-6 ${isPassing ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'}`}>
                        <span className="text-2xl leading-none">{percentage}%</span>
                        <span className="text-[10px] uppercase mt-1 opacity-70">دقة</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-primary transition-colors">{attempt.quizzes?.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-slate-500 font-bold">
                            <Clock className="w-4 h-4 text-primary/40" />
                            <p className="text-sm">
                              {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                      <div className="text-left hidden lg:block bg-white/50 px-6 py-2 rounded-2xl border border-primary/5 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">الدرجة</p>
                        <p className={`text-2xl font-black ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                          {attempt.score} <span className="text-slate-300 text-sm">/ {attempt.total_questions}</span>
                        </p>
                      </div>
                      
                      {attempt.quizzes?.share_code && (
                        <Button asChild size="lg" className="h-14 px-8 rounded-2xl font-black text-lg bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.05] transition-premium">
                          <Link href={`/take-quiz/${attempt.quizzes.share_code}/result?attempt=${attempt.id}`} className="gap-3">
                            <Eye className="w-5 h-5" />
                            عرض التفاصيل
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
