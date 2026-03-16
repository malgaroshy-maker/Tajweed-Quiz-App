import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

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

  interface StudentStat {
    name: string;
    totalAttempts: number;
    totalScore: number;
    totalQuestions: number;
  }

  // Aggregate student stats
  const studentStats: Record<string, StudentStat> = {}
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attempts?.forEach((attempt: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student: any = Array.isArray(attempt.profiles) ? attempt.profiles[0] : attempt.profiles
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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">طلابك المتميزات</h1>
          <p className="text-primary/70 mt-2 text-lg font-medium">متابعة سجل أداء الطلاب اللواتي شاركن في اختباراتك</p>
        </div>
      </div>

      <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-7 h-7" />
             </div>
             إحصائيات الطلاب
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {studentList.length === 0 ? (
            <div className="p-24 text-center text-muted-foreground font-black text-xl italic">لا يوجد طلاب مسجلات بعد.</div>
          ) : (
            <div className="divide-y-2 divide-[#d4c3a3]/20">
              {studentList.map((student, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-8 px-10 hover:bg-primary/[0.02] transition-premium group gap-6">
                  <div className="flex items-center gap-6 flex-1 w-full text-right">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-premium">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-black text-2xl text-slate-800 dark:text-white group-hover:text-primary transition-colors">{student.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <p className="text-sm text-slate-500 font-black uppercase tracking-wider">{student.totalAttempts} اختبارات مكتملة</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-left flex items-center gap-6 w-full sm:w-auto justify-end bg-white/50 px-8 py-3 rounded-[1.5rem] shadow-inner border border-primary/5">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المعدل</span>
                        <span className="font-black text-4xl text-primary tracking-tighter">{student.avgScore}%</span>
                    </div>
                    <div className="w-[2px] h-10 bg-slate-100 mx-2" />
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden lg:block">
                        <div className="bg-primary h-full transition-premium" style={{ width: `${student.avgScore}%` }} />
                    </div>
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
