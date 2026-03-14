import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, TrendingUp, Users, Activity, BarChart3 } from 'lucide-react'

export async function DashboardStats({ teacherId }: { teacherId: string }) {
  const supabase = await createClient()

  // Execute aggregated queries in parallel
  const [
    { count: quizzesCount },
    { data: studentAttempts },
    { data: attempts }
  ] = await Promise.all([
    supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('teacher_id', teacherId),
    supabase.from('attempts').select('student_id, guest_name, quizzes!inner(teacher_id)').eq('quizzes.teacher_id', teacherId),
    supabase.from('attempts').select('score, total_questions, quizzes!inner(teacher_id)').eq('quizzes.teacher_id', teacherId)
  ])

  const uniqueStudents = new Set(studentAttempts?.map(a => a.student_id || a.guest_name))
  const studentsCount = uniqueStudents.size
  
  const totalAttempts = attempts?.length || 0
  const avgScore = totalAttempts > 0 
    ? Math.round((attempts!.reduce((acc, curr) => acc + (Number(curr.score) / curr.total_questions), 0) / totalAttempts) * 100)
    : 0

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card className="relative overflow-hidden border-none bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 rounded-2xl group transition-all hover:shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">الاختبارات النشطة</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{quizzesCount || 0}</div>
            <div className="flex items-center text-xs text-primary/70 font-bold mt-2">
              <TrendingUp className="w-3 h-3 ml-1" />
              +2 هذا الأسبوع
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 rounded-2xl group transition-all hover:shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">إجمالي الطلاب</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{studentsCount || 0}</div>
            <div className="flex items-center text-xs text-blue-600/70 font-bold mt-2">
              <Activity className="w-3 h-3 ml-1" />
              نشط الآن: {Math.floor(studentsCount * 0.2)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 rounded-2xl group sm:col-span-2 lg:col-span-1 transition-all hover:shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">متوسط الدرجات</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{avgScore}%</div>
            <div className="w-full bg-muted dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${avgScore}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
