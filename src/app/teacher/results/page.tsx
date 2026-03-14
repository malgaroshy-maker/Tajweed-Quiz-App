import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Download, Users, BarChart3, CheckCircle } from 'lucide-react'
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">نتائج الطلاب</h2>
          <p className="text-muted-foreground mt-2">عرض محاولات الطلاب لجميع اختباراتك</p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/api/teacher/results/export" target="_blank">
            <Download className="w-4 h-4 ml-2" />
            تصدير النتائج (CSV)
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المحاولات</p>
              <p className="text-2xl font-bold">{totalAttempts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">متوسط الدرجات</p>
              <p className="text-2xl font-bold">{averageScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نسبة النجاح (50%+)</p>
              <p className="text-2xl font-bold">{passingRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {attemptsError && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">
            حدث خطأ أثناء تحميل البيانات.
          </CardContent>
        </Card>
      )}

      {!attemptsError && (!attempts || attempts.length === 0) && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            لا توجد محاولات بعد. عندما يبدأ الطلاب في إجراء اختباراتك، ستظهر النتائج هنا.
          </CardContent>
        </Card>
      )}

      {!attemptsError && attempts && attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المحاولات ({attempts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2">الطالب</th>
                    <th className="py-3 px-2">النوع</th>
                    <th className="py-3 px-2">الاختبار</th>
                    <th className="py-3 px-2">النتيجة</th>
                    <th className="py-3 px-2">التاريخ</th>
                    <th className="py-3 px-2">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => {
                    const studentName = attempt.guest_name 
                      ? attempt.guest_name
                      : attempt.profiles 
                        ? `${attempt.profiles.first_name} ${attempt.profiles.last_name}`.trim()
                        : 'طالب غير معروف'

                    const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
                    const isPassing = percentage >= 50

                    return (
                      <tr key={attempt.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-2">{studentName}</td>
                    <td className="py-3 px-2">
                      {attempt.guest_name ? (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">ضيف</span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">مسجل</span>
                      )}
                    </td>
                    <td className="py-3 px-2">{attempt.quizzes?.title}</td>
                        <td className="py-3 px-2">
                          <span className={`font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.score} / {attempt.total_questions} ({percentage}%)
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {new Date(attempt.completed_at!).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-2">
                          {attempt.quizzes?.share_code ? (
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/take-quiz/${attempt.quizzes.share_code}/result?attempt=${attempt.id}`}>
                                <Eye className="w-4 h-4 ml-2" />
                                عرض
                              </Link>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">غير متاح</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {missedQuestions && missedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الأسئلة الأكثر خطأً</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {missedQuestions.map((item) => (
                <li key={item.question_id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span className="line-clamp-2">{item.question_text}</span>
                  <span className="font-bold text-red-600 whitespace-nowrap">{item.wrong_count} مرات</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
