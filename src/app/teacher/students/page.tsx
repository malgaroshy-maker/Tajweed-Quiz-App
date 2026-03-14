import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, TrendingUp } from 'lucide-react'

export default async function StudentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch unique students who took this teacher's quizzes
  const { data: attempts } = await supabase
    .from('attempts')
    .select(`
      student_id,
      profiles:student_id (id, first_name, last_name),
      score,
      total_questions,
      quizzes!inner(teacher_id)
    `)
    .eq('quizzes.teacher_id', user.id)
    .not('student_id', 'is', null)

  // Aggregate student stats
  const studentStats: Record<string, any> = {}
  
  attempts?.forEach((attempt: any) => {
    const student = Array.isArray(attempt.profiles) ? attempt.profiles[0] : attempt.profiles
    if (!student) return
    const id = student.id
    if (!studentStats[id]) {
      studentStats[id] = {
        name: `${student.first_name} ${student.last_name}`,
        totalAttempts: 0,
        totalScore: 0,
        totalQuestions: 0,
      }
    }
    studentStats[id].totalAttempts += 1
    studentStats[id].totalScore += Number(attempt.score)
    studentStats[id].totalQuestions += attempt.total_questions
  })

  const studentList = Object.values(studentStats).map(s => ({
    ...s,
    avgScore: s.totalQuestions > 0 ? Math.round((s.totalScore / s.totalQuestions) * 100) : 0
  }))

  return (
    <div className="space-y-8 pb-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">طلابك</h1>
        <p className="text-primary/70 mt-2 text-lg font-medium">قائمة بجميع الطلاب الذين شاركوا في اختباراتك</p>
      </div>

      <Card className="border-none shadow-xl shadow-primary/5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-black">إحصائيات الطلاب</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {studentList.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground font-bold">لا يوجد طلاب مسجلين بعد.</div>
          ) : (
            <div className="divide-y divide-muted/50">
              {studentList.map((student, i) => (
                <div key={i} className="flex items-center justify-between p-6 px-8 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg text-slate-800">{student.name}</p>
                      <p className="text-sm text-slate-500 font-bold">{student.totalAttempts} اختبارات مكتملة</p>
                    </div>
                  </div>
                  <div className="text-left flex items-baseline gap-1">
                    <span className="font-black text-2xl text-primary">{student.avgScore}%</span>
                    <span className="text-muted-foreground font-black text-xs uppercase tracking-widest">متوسط الدرجة</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
