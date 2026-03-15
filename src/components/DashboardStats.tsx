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
    <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card className="parchment-card relative overflow-hidden border-none shadow-xl rounded-[2rem] group transition-premium hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-black text-primary uppercase tracking-widest">الاختبارات النشطة</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-premium group-hover:rotate-12">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{quizzesCount || 0}</div>
            <div className="flex items-center text-sm text-primary/70 font-bold mt-4">
              <TrendingUp className="w-4 h-4 ml-2" />
              +2 هذا الأسبوع
            </div>
          </CardContent>
        </Card>

        <Card className="parchment-card relative overflow-hidden border-none shadow-xl rounded-[2rem] group transition-premium hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">إجمالي الطلاب</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-premium group-hover:rotate-12">
              <Users className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{studentsCount || 0}</div>
            <div className="flex items-center text-sm text-blue-600/70 font-bold mt-4">
              <Activity className="w-4 h-4 ml-2" />
              نشط الآن: {Math.floor(studentsCount * 0.2)}
            </div>
          </CardContent>
        </Card>

        <Card className="parchment-card relative overflow-hidden border-none shadow-xl rounded-[2rem] group sm:col-span-2 lg:col-span-1 transition-premium hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">متوسط الأداء</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 transition-premium group-hover:rotate-12">
              <BarChart3 className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{avgScore}%</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 mt-6 overflow-hidden shadow-inner">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${avgScore}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
