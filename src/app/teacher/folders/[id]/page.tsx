import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { FolderOpen, ArrowRight, FileQuestion } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function FolderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: folder } = await supabase
    .from('folders')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('teacher_id', user?.id)
    .single()

  if (!folder) {
    notFound()
  }

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*')
    .eq('folder_id', folder.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/folders" className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="text-blue-500" />
          {folder.name}
        </h2>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">الاختبارات</h3>
        <Link href={`/teacher/quizzes/new?folder_id=${folder.id}`}>
          <Button>إنشاء اختبار جديد</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes?.length === 0 ? (
          <p className="text-muted-foreground col-span-full">لا توجد اختبارات في هذا المجلد بعد.</p>
        ) : (
          quizzes?.map((quiz) => (
            <Card key={quiz.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <Link href={`/teacher/quizzes/${quiz.id}`} className="flex items-center gap-3 text-lg flex-1">
                  <FileQuestion className="text-primary" />
                  <span className="font-semibold">{quiz.title}</span>
                </Link>
                {/* We will add edit/delete actions for quizzes later */}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
