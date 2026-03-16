import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Users, BarChart3, CheckCircle, Sparkles, Plus, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function TeacherResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all attempts for quizzes owned by this teacher
  const { data: attempts, error: attemptsError } = await supabase
    .from('attempts')
    .select(`
      *,
      quizzes!inner (id, title, share_code, teacher_id),
      profiles (first_name, last_name)
    `)
    .eq('quizzes.teacher_id', user.id)
    .order('completed_at', { ascending: false })

  // Calculate metrics
  const totalAttempts = attempts?.length || 0
  const averageScore = totalAttempts > 0 
    ? Math.round((attempts!.reduce((acc, curr) => acc + (Number(curr.score) / curr.total_questions), 0) / totalAttempts) * 100)
    : 0
  
  const passingAttempts = attempts?.filter(a => (a.score / a.total_questions) >= 0.5).length || 0
  const passingRate = totalAttempts > 0 ? Math.round((passingAttempts / totalAttempts) * 100) : 0

  // Fetch most missed questions for this teacher's quizzes
  const { data: missedQuestions } = await supabase
    .from('most_missed_questions')
    .select('question_id, question_text, wrong_count')
    .eq('teacher_id', user.id)
    .order('wrong_count', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">نتائج الطلاب</h1>
          <p className="text-primary/70 mt-2 text-lg font-medium">تحليل دقيق لأداء الطلاب ومتابعة التقدم الدراسي</p>
        </div>
        <Button asChild variant="outline" className="h-12 px-6 border-2 font-bold rounded-xl shadow-sm hover:bg-primary/5 transition-all gap-2">
          <Link href="/api/teacher/results/export" target="_blank">
            <Download className="w-5 h-5 text-primary" />
            تصدير (CSV)
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="parchment-card border-none shadow-xl rounded-[2.5rem] overflow-hidden relative group transition-premium hover:scale-[1.05]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[4rem] pointer-events-none" />
            <CardContent className="p-10 flex items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
                    <Users className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em] mb-2">إجمالي المحاولات</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{totalAttempts}</p>
                </div>
            </CardContent>
        </Card>

        <Card className="parchment-card border-none shadow-xl rounded-[2.5rem] overflow-hidden relative group transition-premium hover:scale-[1.05]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[4rem] pointer-events-none" />
            <CardContent className="p-10 flex items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
                    <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-green-600/60 uppercase tracking-[0.2em] mb-2">متوسط الدرجات</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{averageScore}%</p>
                </div>
            </CardContent>
        </Card>

        <Card className="parchment-card border-none shadow-xl rounded-[2.5rem] overflow-hidden relative group transition-premium hover:scale-[1.05]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[4rem] pointer-events-none" />
            <CardContent className="p-10 flex items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-purple-600/60 uppercase tracking-[0.2em] mb-2">نسبة النجاح</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{passingRate}%</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">سجل المحاولات التفصيلي</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {attemptsError ? (
                        <div className="p-20 text-center text-red-500 font-black text-xl italic">حدث خطأ أثناء تحميل البيانات.</div>
                    ) : !attempts || attempts.length === 0 ? (
                        <div className="p-20 text-center text-muted-foreground font-black text-xl italic">لا توجد محاولات مسجلة بعد.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-primary/5 border-y border-primary/10">
                                        <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">الطالب</th>
                                        <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">الاختبار</th>
                                        <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">النتيجة</th>
                                        <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">التاريخ والوقت</th>
                                        <th className="py-6 px-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#d4c3a3]/20">
                                    {attempts.map((attempt) => {
                                        const studentName = attempt.guest_name 
                                            ? attempt.guest_name
                                            : attempt.profiles 
                                                ? `${attempt.profiles.first_name} ${attempt.profiles.last_name}`.trim()
                                                : 'طالب غير معروفة'

                                        const percentage = Math.round((Number(attempt.score) / attempt.total_questions) * 100)
                                        const isPassing = percentage >= 50

                                        return (
                                            <tr key={attempt.id} className="hover:bg-primary/[0.03] transition-premium group">
                                                <td className="py-6 px-10">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-lg text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{studentName}</span>
                                                        {attempt.guest_name ? (
                                                            <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit mt-2 border border-amber-100 shadow-sm">زائرة</span>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mt-2 border border-blue-100 shadow-sm">مسجلة</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <span className="font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 transition-colors">{attempt.quizzes?.title}</span>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full shadow-inner ${isPassing ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                        <span className={`font-black text-lg ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                                            {attempt.score} <span className="text-slate-300 text-sm">/ {attempt.total_questions}</span>
                                                            <span className="mr-2 opacity-50 text-xs">({percentage}%)</span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-sm text-slate-500 font-bold">
                                                    {new Date(attempt.completed_at!).toLocaleDateString('ar-EG', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="py-6 px-10 text-center">
                                                    {attempt.quizzes?.share_code ? (
                                                        <Button asChild size="sm" variant="ghost" className="h-10 rounded-2xl font-black hover:bg-primary hover:text-white transition-premium px-6 shadow-sm border border-primary/10">
                                                            <Link href={`/take-quiz/${attempt.quizzes.share_code}/result?attempt=${attempt.id}`}>
                                                                عرض المراجعة
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground opacity-30 italic font-bold">غير متاح</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden group transition-premium hover:scale-[1.01]">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-4 text-red-600 text-2xl font-black">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border-2 border-red-100 shadow-xl transition-premium group-hover:rotate-6">
                            <Sparkles className="w-7 h-7 animate-pulse text-red-600" />
                        </div>
                        تحديات طلابك
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    {missedQuestions && missedQuestions.length > 0 ? (
                        <div className="space-y-6">
                            {missedQuestions.map((item) => (
                                <div key={item.question_id} className="p-6 bg-red-50/50 rounded-[2rem] border-2 border-red-100 transition-premium hover:border-red-300 shadow-sm relative overflow-hidden group/item">
                                    <div className="absolute top-2 left-2 opacity-5 font-quran text-4xl pointer-events-none group-hover/item:scale-125 transition-premium">خطأ</div>
                                    <p className="font-quran font-black text-xl leading-relaxed text-slate-800 line-clamp-2 mb-4 group-hover/item:text-red-700 transition-colors pr-2">&ldquo;{item.question_text}&rdquo;</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                            <span className="text-xs font-black text-red-600 uppercase tracking-widest">تحتاج مراجعة مكثفة</span>
                                        </div>
                                        <div className="bg-white/80 px-4 py-1.5 rounded-xl border border-red-100 shadow-inner">
                                            <span className="text-sm font-black text-slate-900">{item.wrong_count} إخفاقات</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button asChild variant="default" className="w-full h-16 rounded-[1.5rem] bg-red-600 text-white font-black text-lg gap-4 mt-6 shadow-xl shadow-red-200 transition-premium hover:bg-red-700 hover:scale-[1.02]">
                                <Link href="/teacher/ai">
                                    <Sparkles className="w-6 h-6" />
                                    توليد تدريب ذكي لهذا النقص
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-8">
                            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto opacity-20">
                                <Activity className="w-10 h-10" />
                            </div>
                            <p className="text-lg text-slate-400 font-bold italic leading-relaxed px-10">
                                سأقوم بتحليل أخطاء الطلاب وتقديم تقارير دورية فور توفر بيانات كافية بإذن الله.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="parchment-card border-none shadow-2xl rounded-[3rem] bg-primary text-white overflow-hidden relative transition-premium hover:shadow-primary/20">
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-black flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                        توجيه المعلم
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6 relative">
                    <p className="text-white/90 leading-relaxed font-bold text-lg italic">
                        بناءً على النتائج الأخيرة، ننصح بالتركيز على مخارج الحروف الشجرية في الدروس القادمة، حيث لوحظ تكرار الأخطاء فيها لدى معظم الطلاب.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 bg-white/40 rounded-full" />
                        <div className="h-1.5 w-4 bg-white/20 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
