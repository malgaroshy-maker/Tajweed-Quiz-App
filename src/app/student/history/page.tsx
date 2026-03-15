import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function StudentHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, quizzes(title, share_code)')
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/student" className="text-muted-foreground hover:text-primary transition-colors">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold">نتائجي السابقة</h1>
      </div>

      <div className="grid gap-4">
        {attempts?.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              لم تقم بإجراء أي اختبارات بعد.
            </CardContent>
          </Card>
        ) : (
          attempts?.map((attempt) => {
            const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
            const isPassing = percentage >= 50

            return (
              <Card key={attempt.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${isPassing ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} border`}>
                      {percentage}%
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{attempt.quizzes?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">الدرجة</p>
                      <p className={`font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score} / {attempt.total_questions}
                      </p>
                    </div>
                    {attempt.quizzes?.share_code && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/take-quiz/${attempt.quizzes.share_code}/result?attempt=${attempt.id}`}>
                          <Eye className="w-4 h-4 ml-2" />
                          عرض التفاصيل
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
