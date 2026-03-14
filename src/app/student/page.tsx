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
          <h1 className="text-3xl font-black tracking-tight text-primary">بوابة الطالب</h1>
          <p className="text-muted-foreground mt-1 font-medium">مرحباً بك، {profile?.first_name} {profile?.last_name}</p>
        </div>
      </div>

      {/* Achievement Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-primary border-none text-primary-foreground shadow-xl shadow-primary/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">إجمالي النقاط</p>
              <p className="text-3xl font-black">{totalPoints}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-2 border-muted shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">اختبارات مكتملة</p>
              <p className="text-3xl font-black text-slate-900">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-2 border-muted shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">متوسط الدقة</p>
              <p className="text-3xl font-black text-slate-900">{avgAccuracy}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/30 border-2 shadow-lg shadow-primary/5 rounded-2xl overflow-hidden bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary text-xl">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                <Search className="w-5 h-5" />
              </div>
              انضمام لاختبار
            </CardTitle>
            <CardDescription className="text-primary/70 font-medium pt-2">أدخل الرمز الذي شاركه معك المعلم للبدء</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={joinQuiz} className="flex gap-2">
              <Input 
                name="code" 
                placeholder="أدخل الرمز..." 
                required 
                className="uppercase text-center font-bold tracking-widest text-xl h-14 bg-background border-2 border-primary/20 focus-visible:border-primary rounded-xl" 
                maxLength={6} 
              />
              <Button type="submit" className="h-14 px-6 font-bold text-lg rounded-xl shadow-lg shadow-primary/20">دخول</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="text-muted-foreground w-5 h-5" />
              آخر الاختبارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attempts?.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 italic">لم تقم بإجراء أي اختبارات بعد.</p>
            ) : (
              <ul className="space-y-3">
                {attempts?.map((attempt) => (
                  <li key={attempt.id} className="flex justify-between items-center bg-background p-3 rounded-xl border-2 border-muted/50">
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{attempt.quizzes?.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{new Date(attempt.started_at).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <span className={`font-black text-sm ${attempt.score >= (attempt.total_questions / 2) ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score !== null ? `${attempt.score} / ${attempt.total_questions}` : 'لم يكتمل'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {attempts && attempts.length > 0 && (
              <div className="mt-4 w-full text-center">
                <Link href="/student/history" className="text-primary hover:underline text-sm font-bold flex items-center justify-center gap-1">
                  عرض كل النتائج
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {availableQuizzes && availableQuizzes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-1">الاختبارات المتاحة</h2>
          <div className="grid gap-3">
            {availableQuizzes?.map((quiz) => (
              <Card key={quiz.id} className="rounded-2xl border-2 border-muted/50 hover:border-primary/30 transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{quiz.title}</p>
                        {quiz.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{quiz.description}</p>
                        )}
                      </div>
                    </div>
                    <Link href={`/take-quiz/${quiz.share_code}`}>
                      <Button size="lg" className="rounded-xl font-bold h-12 px-6">ابدأ</Button>
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
