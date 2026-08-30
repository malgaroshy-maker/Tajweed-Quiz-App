import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Printer, ArrowRight, Eye, CheckSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PrintExamView } from './print-view'

export default async function PrintQuizPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  // Fetch quiz with teacher details
  const { data: quiz } = await supabase
    .from('quizzes')
    .select(`
      *,
      profiles:teacher_id (
        first_name,
        last_name
      ),
      halaqat:target_halaqah_id (
        name
      )
    `)
    .eq('id', resolvedParams.id)
    .eq('teacher_id', user.id)
    .single()

  if (!quiz) notFound()

  // Fetch questions and options
  const { data: questions } = await supabase
    .from('questions')
    .select('*, options(*)')
    .eq('quiz_id', quiz.id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  const teacherName = quiz.profiles 
    ? `${(quiz.profiles as any).first_name || ''} ${(quiz.profiles as any).last_name || ''}`.trim() 
    : 'المعلم المعتمد'

  const halaqahName = (quiz.halaqat as any)?.name || 'عامة'

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 print:p-0 print:bg-white print:dark:bg-white">
      {/* Top Non-Print Control Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden bg-card p-4 rounded-2xl border shadow-sm">
        <Link
          href={`/teacher/quizzes/${quiz.id}`}
          className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لتعديل الاختبار
        </Link>

        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
          ورقة اختبار ورقية جاهزة للطباعة عالية الدقة (A4)
        </span>
      </div>

      {/* Interactive Print Component */}
      <PrintExamView
        quiz={quiz}
        questions={questions || []}
        teacherName={teacherName}
        halaqahName={halaqahName}
      />
    </div>
  )
}
