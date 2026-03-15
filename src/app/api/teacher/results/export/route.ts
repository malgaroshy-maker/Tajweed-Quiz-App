import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Fetch all attempts for quizzes owned by this teacher
  // We need to use a join or multiple queries since Supabase might not support filtering on joined table directly in some configs
  // But let's try the standard way first
  const { data: attempts, error } = await supabase
    .from('attempts')
    .select(`
      *,
      quizzes!inner (title, teacher_id),
      profiles (first_name, last_name)
    `)
    .eq('quizzes.teacher_id', user.id)
    .order('completed_at', { ascending: false })

  if (error || !attempts) {
    console.error('Export error:', error)
    return new NextResponse('Error fetching data', { status: 500 })
  }

  // Generate CSV content
  const headers = ['اسم الطالب', 'النوع', 'عنوان الاختبار', 'النتيجة', 'المجموع', 'النسبة', 'التاريخ']
  const rows = attempts.map(attempt => {
    const studentName = attempt.guest_name 
      ? attempt.guest_name
      : attempt.profiles 
        ? `${attempt.profiles.first_name} ${attempt.profiles.last_name}`.trim()
        : 'طالب غير معروف'
    
    const type = attempt.guest_name ? 'ضيف' : 'مسجل'
    const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
    const date = new Date(attempt.completed_at!).toLocaleDateString('ar-EG')

    // Handle commas in names or titles
    const safeName = `"${studentName.replace(/"/g, '""')}"`
    const quizTitle = (attempt.quizzes as unknown as { title: string })?.title || 'غير معروف'
    const safeTitle = `"${quizTitle.replace(/"/g, '""')}"`

    return [
      safeName,
      type,
      safeTitle,
      attempt.score,
      attempt.total_questions,
      `${percentage}%`,
      date
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Add BOM for Excel Arabic support
  const bom = Buffer.from('\uFEFF', 'utf-8')
  const content = Buffer.concat([bom, Buffer.from(csvContent, 'utf-8')])

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tajweed_results_${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
