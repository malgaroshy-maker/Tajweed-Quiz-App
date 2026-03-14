import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileQuestion, Plus, Trash2, Folder } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { deleteQuiz } from './[id]/delete-quiz-action'
import { moveQuiz } from './move-quiz-action'

export default async function QuizzesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, folders(name)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  const { data: folders } = await supabase
    .from('folders')
    .select('*')
    .eq('teacher_id', user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">الاختبارات</h2>
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
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link href={`/teacher/quizzes/${quiz.id}`} className="flex items-center gap-3 text-lg flex-1 w-full">
                  <FileQuestion className="text-primary shrink-0" />
                  <div>
                    <div className="font-semibold">{quiz.title}</div>
                    <div className="text-xs text-muted-foreground">
                      المجلد: {(quiz.folders as any)?.name || 'بدون مجلد'}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className={`text-sm font-medium px-2 py-1 rounded ${quiz.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {quiz.is_published ? 'منشور' : 'مسودة'}
                  </span>
                  
                  <form action={deleteQuiz.bind(null, quiz.id, quiz.folder_id) as any}>
                    <Button variant="ghost" size="icon" type="submit" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                  
                  {/* Simple move to folder menu */}
                  <div className="flex gap-1 border-r pr-2">
                    <form action={moveQuiz.bind(null, quiz.id, null) as any}>
                      <Button variant="ghost" size="sm" type="submit" className="text-xs">بدون</Button>
                    </form>
                    {folders?.map(f => (
                      <form key={f.id} action={moveQuiz.bind(null, quiz.id, f.id) as any}>
                        <Button variant="ghost" size="sm" type="submit" className="text-xs">{f.name}</Button>
                      </form>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

