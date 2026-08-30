import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mic, CheckCircle, XCircle, ArrowRight, Sparkles, Volume2, Clock, Check } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { gradeVoiceAnswerAction } from './actions'

export default async function TeacherGradeAttemptPage({
  params
}: {
  params: Promise<{ attemptId: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch attempt details
  const { data: attempt } = await supabase
    .from('attempts')
    .select(`
      id,
      score,
      total_questions,
      guest_name,
      completed_at,
      profiles:student_id (
        first_name,
        last_name
      ),
      quizzes (
        id,
        title,
        teacher_id
      )
    `)
    .eq('id', resolvedParams.attemptId)
    .single()

  if (!attempt || (attempt.quizzes as any)?.teacher_id !== user.id) {
    notFound()
  }

  // Fetch attempt answers with question details
  const { data: answers } = await supabase
    .from('attempt_answers')
    .select(`
      id,
      question_id,
      is_correct,
      text_answer,
      voice_recording_url,
      teacher_feedback,
      teacher_score,
      graded_at,
      selected_option_id,
      questions (
        id,
        text,
        type,
        explanation,
        audio_url,
        tajweed_rule
      )
    `)
    .eq('attempt_id', attempt.id)

  const studentName = attempt.profiles
    ? `${(attempt.profiles as any).first_name || ''} ${(attempt.profiles as any).last_name || ''}`.trim()
    : attempt.guest_name || 'طالب'

  const scorePercentage = Math.round(((attempt.score || 0) / (attempt.total_questions || 1)) * 100)

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <Link
            href="/teacher/results"
            className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لنتائج الطلاب
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary flex items-center gap-3">
            <Mic className="w-8 h-8 text-primary" />
            تقييم ومراجعة تلاوة الطالب
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            اختبار: <span className="font-bold text-foreground">{(attempt.quizzes as any)?.title}</span> — الطالب: <span className="font-bold text-foreground">{studentName}</span>
          </p>
        </div>

        {/* Current Score Badge */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border-2 border-primary/20 shrink-0">
          <div>
            <span className="text-xs font-bold text-muted-foreground block">الدرجة الحالية:</span>
            <span className="text-2xl font-black text-primary">
              {attempt.score} / {attempt.total_questions} ({scorePercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Answers List */}
      <div className="space-y-8">
        {answers?.map((ans, idx) => {
          const q = (ans.questions as any)
          const isVoiceQuestion = q?.type === 'voice_recitation' || Boolean(ans.voice_recording_url)

          return (
            <Card key={ans.id} className="parchment-card rounded-[2.5rem] shadow-xl border-2 border-[#d4c3a3]/70 overflow-hidden">
              <CardHeader className="p-6 md:p-8 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-base shadow-md">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">
                      {isVoiceQuestion ? 'سؤال تلاوة وتسجيل صوتي 🎙️' : q?.type === 'multiple_choice' ? 'اختيار من متعدد' : q?.type === 'true_false' ? 'صح أو خطأ' : 'إكمال الفراغ'}
                    </span>
                  </div>

                  <span className={`text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border ${ans.is_correct ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                    {ans.is_correct ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {ans.is_correct ? 'إجابة صحيحة / معتمد' : isVoiceQuestion ? 'قيد المراجعة / لم تُعتمد' : 'إجابة خاطئة'}
                  </span>
                </div>

                <CardTitle className="text-xl md:text-2xl font-black font-quran leading-relaxed text-foreground">
                  {q?.text}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-0 space-y-6">
                {/* Voice Submission Player & Teacher Grading Form */}
                {isVoiceQuestion ? (
                  <div className="space-y-6 pt-2">
                    <div className="p-5 rounded-2xl bg-card border-2 border-primary/20 space-y-3">
                      <Label className="text-xs font-black text-primary flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        استمع لتلاوة الطالب المسجلة:
                      </Label>

                      {ans.voice_recording_url ? (
                        <audio
                          controls
                          src={ans.voice_recording_url}
                          className="w-full h-12 rounded-xl accent-primary"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground italic">لم يتم إرفاق تسجيل صوتي من قبل الطالب.</p>
                      )}
                    </div>

                    {/* Teacher Grading Action Form */}
                    <form action={gradeVoiceAnswerAction.bind(null, attempt.id, ans.id)} className="space-y-4 rounded-2xl p-6 bg-primary/5 border border-primary/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="text-sm font-black text-foreground">قرار التقييم:</span>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 cursor-pointer font-bold text-xs">
                            <input
                              type="radio"
                              name="is_correct"
                              value="true"
                              defaultChecked={ans.is_correct}
                            />
                            تلاوة متقنة (احتساب الدرجة)
                          </label>

                          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 cursor-pointer font-bold text-xs">
                            <input
                              type="radio"
                              name="is_correct"
                              value="false"
                              defaultChecked={!ans.is_correct}
                            />
                            تحتاج مراجعة (0 درجات)
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`feedback_${ans.id}`} className="text-xs font-bold text-muted-foreground">
                          ملاحظات وتوجيهات المعلم التجويدية للطالب:
                        </Label>
                        <Textarea
                          id={`feedback_${ans.id}`}
                          name="teacher_feedback"
                          placeholder="مثال: أحسنت في إظهار الغنة، لكن انتبه لترقيق الراء المكسورة..."
                          defaultValue={ans.teacher_feedback || ''}
                          className="rounded-xl bg-card resize-none h-20 text-sm"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground shadow-md gap-2"
                        >
                          <Check className="w-4 h-4" />
                          حفظ التقييم والملاحظات
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Standard text/option question summary */
                  <div className="text-sm space-y-2 pt-2">
                    {ans.text_answer && (
                      <p className="text-muted-foreground">
                        إجابة الطالب المكتوبة: <span className="font-bold text-foreground">{ans.text_answer}</span>
                      </p>
                    )}
                    {q?.explanation && (
                      <p className="text-xs text-muted-foreground/80 italic">
                        توضيح المعلم: {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
