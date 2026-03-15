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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden relative group transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[3rem]" />
            <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <Users className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المحاولات</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{totalAttempts}</p>
                </div>
            </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden relative group transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-[3rem]" />
            <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100">
                    <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">متوسط الدرجات</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{averageScore}%</p>
                </div>
            </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden relative group transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-[3rem]" />
            <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">نسبة النجاح</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{passingRate}%</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">سجل المحاولات</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {attemptsError ? (
                        <div className="p-12 text-center text-red-500 font-bold">حدث خطأ أثناء تحميل البيانات.</div>
                    ) : !attempts || attempts.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground font-bold">لا توجد محاولات مسجلة بعد.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-muted/30 border-y border-muted/50">
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">الطالب</th>
                                        <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">الاختبار</th>
                                        <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">النتيجة</th>
                                        <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">التاريخ</th>
                                        <th className="py-5 px-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/50">
                                    {attempts.map((attempt) => {
                                        const studentName = attempt.guest_name 
                                            ? attempt.guest_name
                                            : attempt.profiles 
                                                ? `${attempt.profiles.first_name} ${attempt.profiles.last_name}`.trim()
                                                : 'طالب غير معروف'

                                        const percentage = Math.round((Number(attempt.score) / attempt.total_questions) * 100)
                                        const isPassing = percentage >= 50

                                        return (
                                            <tr key={attempt.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="py-5 px-8">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800 dark:text-slate-200">{studentName}</span>
                                                        {attempt.guest_name ? (
                                                            <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-amber-100">زائر</span>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-blue-100">مسجل</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-4">
                                                    <span className="font-bold text-slate-600 dark:text-slate-400">{attempt.quizzes?.title}</span>
                                                </td>
                                                <td className="py-5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isPassing ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <span className={`font-black ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                                            {attempt.score} / {attempt.total_questions} ({percentage}%)
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-4 text-sm text-slate-500 font-medium">
                                                    {new Date(attempt.completed_at!).toLocaleDateString('ar-EG', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="py-5 px-8 text-center">
                                                    {attempt.quizzes?.share_code ? (
                                                        <Button asChild size="sm" variant="ghost" className="h-9 rounded-xl font-bold hover:bg-primary hover:text-white transition-all px-4">
                                                            <Link href={`/take-quiz/${attempt.quizzes.share_code}/result?attempt=${attempt.id}`}>
                                                                عرض التفاصيل
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground opacity-50 italic">غير متاح</span>
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

        <div className="space-y-6">
            <Card className="border-2 border-primary/20 bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 rounded-[2.5rem] overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-600 text-xl font-black">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        نقاط الضعف العامة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {missedQuestions && missedQuestions.length > 0 ? (
                        <div className="space-y-5">
                            {missedQuestions.map((item) => (
                                <div key={item.question_id} className="p-4 bg-red-50/30 rounded-2xl border border-red-100/50 group hover:border-red-300 transition-all">
                                    <p className="font-quran font-black text-lg leading-relaxed text-slate-800 line-clamp-2 mb-3 group-hover:text-red-700 transition-colors">&ldquo;{item.question_text}&rdquo;</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            <span className="text-xs font-black text-red-600 uppercase tracking-widest">خطأ متكرر</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{item.wrong_count} إجابة خاطئة</span>
                                    </div>
                                </div>
                            ))}
                            <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-2 font-black gap-2 mt-4 hover:bg-red-50 hover:text-red-600 transition-all border-red-100 text-red-600">
                                <Link href="/teacher/ai">
                                    <Plus className="w-5 h-5" />
                                    توليد مراجعة ذكية لهذه النقاط
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="py-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                                <Activity className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-slate-400 font-bold italic leading-relaxed px-6">
                                سأقوم بتحليل أخطاء الطلاب وتقديم تقارير دورية فور توفر بيانات كافية.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <CardHeader>
                    <CardTitle className="text-xl font-black">نصيحة المعلمة الذكية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                    <p className="text-white/90 leading-relaxed font-medium">
                        بناءً على النتائج الأخيرة، ننصح بالتركيز على مخارج الحروف الشجرية في الدروس القادمة، حيث لوحظ تكرار الأخطاء فيها.
                    </p>
                    <div className="h-1 w-20 bg-white/30 rounded-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
