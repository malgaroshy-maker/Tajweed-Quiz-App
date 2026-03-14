import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileQuestion, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function QuizzesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, folders(name)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">الاختبارات</h2>
        <Link href="/teacher/quizzes/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            اختبار جديد
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {quizzes?.length === 0 ? (
          <p className="text-muted-foreground">لا توجد اختبارات حتى الآن.</p>
        ) : (
          quizzes?.map((quiz) => (
            <Card key={quiz.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <Link href={`/teacher/quizzes/${quiz.id}`} className="flex items-center gap-3 text-lg flex-1">
                  <FileQuestion className="text-primary" />
                  <div>
                    <div className="font-semibold">{quiz.title}</div>
                    <div className="text-xs text-muted-foreground">
                      المجلد: {(quiz.folders as any)?.name || 'بدون مجلد'}
                    </div>
                  </div>
                </Link>
                <span className={`text-sm font-medium px-2 py-1 rounded ${quiz.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {quiz.is_published ? 'منشور' : 'مسودة'}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
