import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  FolderOpen, 
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  Settings,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GenerateCodeButton } from '@/components/ai/GenerateCodeButton'

import { Suspense } from 'react'
import { DashboardStats } from '@/components/DashboardStats'
import { Skeleton } from '@/components/ui/skeleton'

export default async function TeacherDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // 2. Fetch Recent Quizzes
  const { data: recentQuizzes } = await supabase
    .from('quizzes')
    .select('id, title, is_published, created_at, share_code')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // 3. Fetch Insights (Most missed)
  const { data: insights } = await supabase
    .from('most_missed_questions')
    .select('*')
    .eq('teacher_id', user.id)
    .order('wrong_count', { ascending: false })
    .limit(2)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">لوحة المعلمة</h1>
          <p className="text-primary/70 mt-2 text-lg font-medium">السلام عليكم ونورتي شيختي {profile?.first_name} {profile?.last_name}</p>
        </div>
        <Button asChild className="h-14 px-8 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all gap-2">
          <Link href="/teacher/quizzes/new">
            <Plus className="w-5 h-5" />
            إنشاء اختبار جديد
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12 h-[120px]"><Skeleton className="rounded-2xl"/><Skeleton className="rounded-2xl"/><Skeleton className="rounded-2xl"/></div>}>
          <DashboardStats teacherId={user.id} />
      </Suspense>

      <div className="grid gap-10 lg:grid-cols-7">
        {/* Recent Quizzes */}
        <Card className="lg:col-span-4 parchment-card border-none shadow-xl transition-premium hover:scale-[1.005] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-10 pb-4">
            <div>
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">الاختبارات الأخيرة</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary font-black hover:bg-primary/10 rounded-lg transition-premium">
              <Link href="/teacher/quizzes" className="gap-2">
                عرض الكل
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="space-y-6">
              {recentQuizzes?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-muted/20 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-muted transition-premium">
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-bold text-lg">لا توجد اختبارات بعد.</p>
                </div>
              ) : (
                recentQuizzes?.map((quiz) => (
                  <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 vellum-glass rounded-3xl hover:shadow-md transition-premium group gap-6 border-transparent hover:border-primary/20">
                    <div className="flex items-center gap-6">
                      <div className={`w-2 h-16 rounded-full shrink-0 shadow-inner ${quiz.is_published ? 'bg-primary' : 'bg-amber-400'}`} />
                      <div>
                        <p className="font-black text-2xl text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">{quiz.title}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(quiz.created_at).toLocaleDateString('ar-EG')}
                          </span>
                          <span className="bg-primary/10 text-primary px-4 py-1 rounded-xl font-black font-mono">
                            {quiz.share_code}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 sm:shrink-0">
                      <Button variant="outline" size="lg" asChild className="flex-1 sm:flex-none h-14 px-6 font-black rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/5 transition-premium">
                        <Link href={`/teacher/quizzes/${quiz.id}`}>تعديل</Link>
                      </Button>
                      <Button size="lg" asChild className="flex-1 sm:flex-none h-14 px-6 font-black rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:shadow-primary/10 transition-premium">
                        <Link href={`/teacher/results?quiz=${quiz.id}`}>النتائج</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights & Actions */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden relative group transition-premium hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-[6rem] -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <CardHeader className="relative p-8">
              <CardTitle className="flex items-center gap-4 text-primary text-2xl font-black">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-premium group-hover:rotate-6">
                  <Sparkles className="w-8 h-8 animate-pulse text-primary" />
                </div>
                توصيات ذكية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 relative p-8 pt-0">
              {insights && insights.length > 0 ? (
                <>
                  <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-[2rem] border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-2 left-2 opacity-5 font-quran text-6xl">القلم</div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bold text-lg">
                      يواجه الطلاب صعوبة في حكم: 
                      <span className="block mt-4 font-black text-slate-900 dark:text-white font-quran text-2xl bg-white/50 dark:bg-black/20 p-4 rounded-2xl">&ldquo;{insights[0].question_text}&rdquo;</span>
                      تم رصد <span className="text-red-600 dark:text-red-400 font-black">{insights[0].wrong_count} إجابات خاطئة</span>.
                    </p>
                  </div>
                  <Button variant="default" className="w-full h-16 gap-4 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-premium" asChild>
                    <Link href={`/teacher/ai?suggest_quiz_for=${insights[0].question_id}`}>
                      <Plus className="w-6 h-6" />
                      إنشاء مراجعة مخصصة
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-muted dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-20">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed px-6">
                    سأقوم بتحليل نتائج طلابكِ وتقديم توصيات ذكية فور توفر بيانات كافية.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="vellum-glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black text-primary uppercase tracking-widest">روابط سريعة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-8 pt-0">
              <Button variant="outline" className="justify-start gap-3 h-auto py-5 px-6 rounded-2xl transition-premium hover:bg-white/50" asChild>
                <Link href="/teacher/folders">
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                  <span className="font-bold">المجلدات</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-auto py-5 px-6 rounded-2xl transition-premium hover:bg-white/50" asChild>
                <Link href="/teacher/questions">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  <span className="font-bold">البنك</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-auto py-5 px-6 rounded-2xl transition-premium hover:bg-white/50" asChild>
                <Link href="/teacher/ai">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="font-bold">الذكاء الاصطناعي</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-auto py-5 px-6 rounded-2xl transition-premium hover:bg-white/50" asChild>
                <Link href="/teacher/settings">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-bold">الإعدادات</span>
                </Link>
              </Button>
              <GenerateCodeButton />
              <Button variant="outline" className="justify-start gap-3 h-auto py-5 px-6 rounded-2xl transition-premium hover:bg-white/50 col-span-2" asChild>
                <Link href="/api/teacher/results/export" target="_blank">
                  <Download className="w-5 h-5 text-primary" />
                  <span className="font-bold">تصدير جميع النتائج (CSV)</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
