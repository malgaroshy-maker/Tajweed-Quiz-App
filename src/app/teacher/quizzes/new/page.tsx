import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function NewQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const folder_id = resolvedParams.folder_id as string | undefined

  async function createQuiz(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const fId = formData.get('folder_id') as string

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        teacher_id: user.id,
        title,
        description,
        folder_id: fId || null,
      })
      .select()
      .single()

    if (!error && data) {
      redirect(`/teacher/quizzes/${data.id}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء اختبار جديد</CardTitle>
          <CardDescription>قم بتسمية الاختبار ووصفه للبدء بإضافة الأسئلة</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createQuiz} className="space-y-4">
            {folder_id && <input type="hidden" name="folder_id" value={folder_id} />}
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الاختبار</Label>
              <Input id="title" name="title" required placeholder="مثال: أحكام النون الساكنة" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف الاختبار (اختياري)</Label>
              <Input id="description" name="description" placeholder="وصف قصير للطلاب..." />
            </div>
            <Button type="submit" className="w-full">متابعة لإضافة الأسئلة</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
