import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, History, ArrowRight, BookOpen, Trophy, Star, Target } from 'lucide-react'
import Link from 'next/link'

export default async function StudentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Fetch all attempts for stats
  const { data: allAttempts } = await supabase
    .from('attempts')
    .select('score, total_questions')
    .eq('student_id', user.id)

  const totalPoints = allAttempts?.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) || 0
  const completedCount = allAttempts?.filter(a => a.score !== null).length || 0
  const avgAccuracy = allAttempts && allAttempts.length > 0
    ? Math.round((allAttempts.reduce((acc, curr) => acc + (Number(curr.score) / curr.total_questions), 0) / allAttempts.length) * 100)
    : 0

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, quizzes(title)')
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })
    .limit(5)

  // Fetch available published quizzes
  const { data: availableQuizzes } = await supabase
    .from('quizzes')
    .select('id, title, description, share_code')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10)

  async function joinQuiz(formData: FormData) {
    'use server'
    const code = formData.get('code') as string
    if (code) {
      redirect(`/take-quiz/${code.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">بوابة الطالب</h1>
          <p className="text-muted-foreground mt-1 font-medium">مرحباً بك، {profile?.first_name} {profile?.last_name}</p>
        </div>
      </div>

      {/* Achievement Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
        <Card className="parchment-card border-none shadow-xl rounded-[2.5rem] group transition-premium hover:scale-[1.05]">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary/60">إجمالي النقاط</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{totalPoints}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="parchment-card border-none shadow-xl rounded-[2.5rem] group transition-premium hover:scale-[1.05]">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-600/60">اختبارات مكتملة</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="parchment-card border-none shadow-xl rounded-[2.5rem] group transition-premium hover:scale-[1.05]">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600/60">متوسط الدقة</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{avgAccuracy}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden relative group transition-premium hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-[6rem] -mr-12 -mt-12 transition-transform group-hover:scale-110" />
          <CardHeader className="relative p-10 pb-6">
            <CardTitle className="flex items-center gap-4 text-primary text-2xl font-black">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl transition-premium group-hover:rotate-6">
                <Search className="w-6 h-6" />
              </div>
              انضمام لاختبار
            </CardTitle>
            <CardDescription className="text-primary/70 font-black text-lg pt-4">أدخلي الرمز الذي شاركته معكِ المعلمة للبدء</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0 relative">
            <form action={joinQuiz} className="flex gap-4">
              <Input 
                name="code" 
                placeholder="أدخلي الرمز..." 
                required 
                className="uppercase text-center font-black tracking-[0.2em] text-2xl h-16 bg-white dark:bg-slate-900 border-2 border-primary/20 focus-visible:border-primary rounded-2xl shadow-inner" 
                maxLength={6} 
              />
              <Button type="submit" className="h-16 px-10 font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-premium bg-primary text-white">دخول</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="vellum-glass border-none shadow-xl rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="flex items-center gap-4 text-xl font-black text-slate-900 dark:text-white">
              <History className="text-primary w-6 h-6" />
              آخر الاختبارات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            {attempts?.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                    <History className="w-8 h-8" />
                  </div>
                <p className="text-muted-foreground text-lg font-bold italic">لم تقومي بإجراء أي اختبارات بعد.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {attempts?.map((attempt) => (
                  <li key={attempt.id} className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-premium shadow-sm group">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                        <div>
                          <p className="font-black text-lg text-slate-800 dark:text-white line-clamp-1">{attempt.quizzes?.title}</p>
                          <p className="text-xs text-muted-foreground font-bold tracking-wider">{new Date(attempt.started_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>
                    <div className="text-left shrink-0">
                      <span className={`font-black text-xl ${attempt.score >= (attempt.total_questions / 2) ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score !== null ? `${attempt.score} / ${attempt.total_questions}` : 'لم يكتمل'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {attempts && attempts.length > 0 && (
              <div className="mt-8 w-full">
                <Button variant="ghost" asChild className="w-full h-12 rounded-xl text-primary font-black hover:bg-primary/10 transition-premium">
                    <Link href="/student/history" className="gap-2">
                      عرض كل النتائج
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {availableQuizzes && availableQuizzes.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-2xl font-black px-2 text-slate-900 dark:text-white flex items-center gap-3">
             <BookOpen className="text-primary w-6 h-6" />
             الاختبارات المتاحة
          </h2>
          <div className="grid gap-6">
            {availableQuizzes?.map((quiz) => (
              <Card key={quiz.id} className="parchment-card border-none shadow-lg hover:shadow-2xl transition-premium group overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-8 gap-8">
                    <div className="flex items-center gap-6 text-right w-full sm:w-auto">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-premium shadow-inner">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-primary transition-colors">{quiz.title}</p>
                        {quiz.description && (
                          <p className="text-sm text-slate-500 font-bold line-clamp-1 mt-1">{quiz.description}</p>
                        )}
                      </div>
                    </div>
                    <Link href={`/take-quiz/${quiz.share_code}`} className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-14 px-10 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-premium bg-slate-900 text-white hover:scale-105">ابدأ الآن</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
