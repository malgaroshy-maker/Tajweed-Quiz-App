import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileQuestion, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { deleteQuiz } from './[id]/delete-quiz-action'
import { MoveQuizSelect } from '@/components/MoveQuizSelect'

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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">الاختبارات</h2>
          <p className="text-primary/70 mt-2 text-lg font-medium">تنظيم وإدارة اختبارات طالباتكِ بكل سهولة</p>
        </div>
        <Button asChild className="h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-premium hover:scale-105">
          <Link href="/teacher/quizzes/new" className="gap-2">
            <Plus className="h-6 w-6" />
            إنشاء اختبار جديد
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {quizzes?.length === 0 ? (
          <div className="text-center py-24 parchment-card rounded-[4rem] border-4 border-dashed border-[#d4c3a3]/50">
             <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <FileQuestion className="w-12 h-12 text-primary opacity-20" />
            </div>
            <h3 className="text-3xl font-black text-slate-400">لا توجد اختبارات حتى الآن</h3>
            <p className="text-slate-400 mt-4 text-lg font-bold italic">ابدئي بإنشاء أول اختبار لكِ من الزر أعلاه</p>
          </div>
        ) : (
          quizzes?.map((quiz) => (
            <Card key={quiz.id} className="parchment-card border-none shadow-lg transition-premium hover:scale-[1.005] hover:shadow-2xl rounded-[2.5rem] overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8">
                  <Link href={`/teacher/quizzes/${quiz.id}`} className="flex items-center gap-6 flex-1 w-full text-right">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-premium shadow-inner">
                      <FileQuestion className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{quiz.title}</div>
                      <div className="text-sm text-slate-500 font-bold mt-1 flex items-center gap-2">
                        <span className="opacity-50">المجلد:</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-300">{(quiz.folders as unknown as { name: string })?.name || 'بدون مجلد'}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <span className={`text-xs font-black px-4 py-2 rounded-xl border tracking-widest uppercase ${quiz.is_published ? 'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-100' : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100'}`}>
                      {quiz.is_published ? 'منشور' : 'مسودة'}
                    </span>
                    
                    <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                    <div className="flex items-center gap-2">
                        <MoveQuizSelect quizId={quiz.id} currentFolderId={quiz.folder_id} folders={folders || []} />
                        <form action={deleteQuiz.bind(null, quiz.id, quiz.folder_id) as unknown as string}>
                          <Button variant="ghost" size="icon" type="submit" className="h-12 w-12 text-destructive hover:bg-red-50 rounded-2xl transition-premium">
                            <Trash2 className="h-6 w-6" />
                          </Button>
                        </form>
                    </div>
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
