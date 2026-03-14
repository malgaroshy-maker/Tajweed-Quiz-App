import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { EditQuestionDialog } from '../quizzes/[id]/edit-question-dialog'
import { deleteQuestion } from '../quizzes/[id]/delete-question-action'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

export default async function QuestionBankPage({ searchParams }: { searchParams: { search?: string, type?: string } }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let query = supabase
    .from('questions')
    .select('*, quizzes(title), options(*)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  if (params.search) query = query.ilike('text', `%${params.search}%`)
  if (params.type && params.type !== 'all') query = query.eq('type', params.type)

  const { data: questions } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">بنك الأسئلة</h2>
      </div>

      <div className="flex gap-4">
        <form className="flex gap-4 flex-1">
            <Input name="search" defaultValue={params.search} placeholder="بحث في الأسئلة..." />
            <Select name="type" defaultValue={params.type || 'all'}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="multiple_choice">خيارات</SelectItem>
                    <SelectItem value="true_false">صح/خطأ</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit">تصفية</Button>
            <Link href="/teacher/questions"><Button variant="outline">مسح</Button></Link>
        </form>
      </div>

      <div className="grid gap-4">
        {questions?.length === 0 ? (
          <p className="text-muted-foreground">لا توجد أسئلة تطابق المعايير.</p>
        ) : (
          questions?.map((q: any) => (
            <Card key={q.id}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-lg leading-relaxed">{q.text}</span>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full mr-2 inline-block">
                      {q.type === 'multiple_choice' ? 'خيارات' : q.type === 'true_false' ? 'صح/خطأ' : 'نص'}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <EditQuestionDialog question={q} />
                    <form action={deleteQuestion.bind(null, q.id, q.quiz_id || 'bank')}>
                      <button type="submit" className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors w-8 h-8 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
                {q.options && q.options.length > 0 && (
                  <div className="text-sm mt-2 p-2 bg-muted rounded">
                    <span className="font-semibold text-green-700">الإجابة الصحيحة: </span>
                    {q.options.find((o: any) => o.is_correct)?.text || 'غير محددة'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
