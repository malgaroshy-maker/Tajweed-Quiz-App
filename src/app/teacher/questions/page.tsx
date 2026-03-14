import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { EditQuestionDialog } from '../quizzes/[id]/edit-question-dialog'
import { deleteQuestion } from '../quizzes/[id]/delete-question-action'

export default async function QuestionBankPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all questions for this teacher, showing where they are used
  const { data: questions } = await supabase
    .from('questions')
    .select('*, quizzes(title), options(*)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">بنك الأسئلة</h2>
      </div>

      <div className="grid gap-4">
        {questions?.length === 0 ? (
          <p className="text-muted-foreground">لا توجد أسئلة في البنك حتى الآن. ستظهر هنا الأسئلة التي تنشئها في الاختبارات.</p>
        ) : (
          questions?.map((q: any, idx) => (
            <Card key={q.id}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-lg leading-relaxed">{q.text}</span>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full mr-2 inline-block">
                      {q.type === 'multiple_choice' ? 'خيارات' : q.type === 'true_false' ? 'صح/خطأ' : 'نص'}
                    </span>
                    {q.image_url && (
                      <div className="mt-2 w-32 aspect-video rounded border overflow-hidden">
                        <img src={q.image_url} alt="Question" className="w-full h-full object-contain bg-muted" />
                      </div>
                    )}
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
                {/* Display Correct Answer */}
                {q.options && q.options.length > 0 && (
                  <div className="text-sm mt-2 p-2 bg-muted rounded">
                    <span className="font-semibold text-green-700">الإجابة الصحيحة: </span>
                    {q.options.find((o: any) => o.is_correct)?.text || 'غير محددة'}
                  </div>
                )}
                <div className="text-sm text-muted-foreground flex justify-between items-center mt-2">
                  <span>
                    الاختبار المستضيف: {q.quizzes ? (q.quizzes as any).title : 'غير مرتبط باختبار'}
                  </span>
                  <span>{new Date(q.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
