import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  FolderOpen, 
  Users, 
  TrendingUp, 
  Activity, 
  BarChart3, 
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

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Recent Quizzes */}
        <Card className="lg:col-span-4 border-none shadow-xl shadow-primary/5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">الاختبارات الأخيرة</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary font-black hover:bg-primary/10 rounded-lg">
              <Link href="/teacher/quizzes" className="gap-2">
                عرض الكل
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-4">
              {recentQuizzes?.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground bg-muted/20 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-muted">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-bold">لا توجد اختبارات بعد.</p>
                </div>
              ) : (
                recentQuizzes?.map((quiz) => (
                  <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-2 border-muted/30 dark:border-slate-800 rounded-2xl hover:border-primary/40 hover:bg-white dark:hover:bg-slate-800 transition-all group gap-6 shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className={`w-4 h-16 rounded-full shrink-0 shadow-inner ${quiz.is_published ? 'bg-primary' : 'bg-amber-400'}`} />
                      <div>
                        <p className="font-black text-xl text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">{quiz.title}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {new Date(quiz.created_at).toLocaleDateString('ar-EG')}
                          </span>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black font-mono">
                            {quiz.share_code}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 sm:shrink-0">
                      <Button variant="outline" size="lg" asChild className="flex-1 sm:flex-none h-12 font-black rounded-xl border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all">
                        <Link href={`/teacher/quizzes/${quiz.id}`}>تعديل</Link>
                      </Button>
                      <Button size="lg" asChild className="flex-1 sm:flex-none h-12 font-black rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md hover:bg-slate-800 dark:hover:bg-white transition-all">
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
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-2 border-primary/20 bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden relative group transition-all hover:border-primary/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-primary text-xl font-black">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                توصيات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              {insights && insights.length > 0 ? (
                <>
                  <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      يواجه الطلاب صعوبة ملحوظة في السؤال: 
                      <span className="block mt-2 font-black text-slate-900 dark:text-white font-quran text-lg">&ldquo;{insights[0].question_text}&rdquo;</span>
                      تم رصد <span className="text-red-600 dark:text-red-400 font-black">{insights[0].wrong_count} إجابات خاطئة</span>.
                    </p>
                  </div>
                  <Button variant="default" className="w-full h-14 gap-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all" asChild>
                    <Link href={`/teacher/ai?suggest_quiz_for=${insights[0].question_id}`}>
                      <Plus className="w-5 h-5" />
                      إنشاء مراجعة مخصصة لهذا الحكم
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-20">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed px-4">
                    سأقوم بتحليل نتائج طلابكِ وتقديم توصيات ذكية لتحسين الأداء فور توفر بيانات كافية.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">روابط سريعة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-3" asChild>
                <Link href="/teacher/folders">
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                  <span>المجلدات</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-3" asChild>
                <Link href="/teacher/questions">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span>البنك</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-3" asChild>
                <Link href="/teacher/ai">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>الذكاء الاصطناعي</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-3" asChild>
                <Link href="/teacher/settings">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>الإعدادات</span>
                </Link>
              </Button>
              <GenerateCodeButton />
              <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-3 col-span-2" asChild>
                <Link href="/api/teacher/results/export" target="_blank">
                  <Download className="w-4 h-4 text-primary" />
                  <span>تصدير جميع النتائج (CSV)</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
