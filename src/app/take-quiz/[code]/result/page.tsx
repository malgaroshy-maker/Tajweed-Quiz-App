import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ArrowRight, Trophy, Medal, ListTodo, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ConfettiCelebration } from '@/components/confetti-celebration'

interface DedupedLeaderboardEntry {
  name: string;
  score: number;
  total: number;
}

export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ attempt: string }>
}) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const attemptId = resolvedSearch.attempt

  if (!resolvedParams.code) notFound()

  if (!attemptId) notFound()

  const supabase = await createClient()

  // Get current user (if logged in)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch attempt details
  const { data: attempt } = await supabase
    .from('attempts')
    .select('*, quizzes(id, title, share_code)')
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()

  // Fetch leaderboard
  const { data: leaderboard } = await supabase
    .from('attempts')
    .select('score, total_questions, guest_name, profiles(first_name, last_name), completed_at')
    .eq('quiz_id', attempt.quizzes?.id)
    .order('score', { ascending: false })
    .order('completed_at', { ascending: true })
    .limit(50)
  
  // Dedup leaderboard by student
  const dedupedLeaderboard: DedupedLeaderboardEntry[] = []
  const seenNames = new Set()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leaderboard?.forEach((entry: any) => {
    // ESLint disable since Supabase returns dynamic generic types that are hard to cleanly map without extensive auto-gen types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile: any = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles
    const name = entry.guest_name || (profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'طالب')
    if (!seenNames.has(name)) {
      dedupedLeaderboard.push({ name, score: entry.score, total: entry.total_questions })
      seenNames.add(name)
    }
  })

  // Fetch detailed answers with explanations
  const { data: answers } = await supabase
    .from('attempt_answers')
    .select(`
      *,
      questions (
        id,
        text,
        type,
        explanation,
        image_url,
        options (id, text, is_correct)
      )
    `)
    .eq('attempt_id', attemptId)

  // Get current user role to decide where to redirect back
  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() : { data: null }

   const isTeacher = profile?.role === 'teacher'
   const backButtonTarget = isTeacher ? '/teacher/results' : '/student'
   const backButtonLabel = isTeacher ? 'العودة لنتائج الطلاب' : 'العودة للوحة التحكم'

   const percentage = Math.round((Number(attempt.score) / attempt.total_questions) * 100)

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      <ConfettiCelebration score={Number(attempt.score)} total={attempt.total_questions} />
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">النتيجة: {attempt.quizzes?.title}</h1>
        
        <Card className={`rounded-3xl border-none shadow-2xl overflow-hidden ${percentage >= 50 ? 'bg-primary text-white' : 'bg-red-600 text-white'}`}>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <span className="text-6xl font-black mb-2 leading-none">{attempt.score} / {attempt.total_questions}</span>
            <span className="text-2xl font-bold opacity-80">{percentage}%</span>
            {percentage >= 50 ? (
              <div className="flex flex-col items-center mt-6 gap-2">
                <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
                <span className="font-black text-2xl">أحسنت! أداء متميز</span>
              </div>
            ) : (
              <div className="flex flex-col items-center mt-6 gap-2">
                <XCircle className="w-10 h-10 text-red-200" />
                <span className="font-black text-2xl">تحتاج لمزيد من المراجعة</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="space-y-6">
         <h2 className="text-2xl font-black border-b border-primary/10 pb-4 flex items-center gap-3">
           <ListTodo className="w-6 h-6 text-primary" />
           مراجعة الإجابات
         </h2>

         {!answers || answers.length === 0 ? (
           <Card className="rounded-2xl border-none shadow-sm bg-muted/20">
             <CardContent className="pt-6 text-center text-muted-foreground font-bold py-10">
               لا توجد إجابات للعرض.
             </CardContent>
           </Card>
         ) : (
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           answers.map((ans: any, idx: number) => {
             const q = ans.questions
             const options = q?.options as { id: string, text: string, is_correct: boolean }[] || []
             const correctOpt = options.find((o: { is_correct: boolean }) => o.is_correct)
             const selectedOption = options.find((o: { id: string }) => o.id === ans.selected_option_id)

           return (
             <Card key={ans.id} className={`rounded-2xl border-2 shadow-sm transition-all ${ans.is_correct ? 'border-green-100 bg-white' : 'border-red-100 bg-white'}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${ans.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ans.is_correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {ans.is_correct ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold leading-relaxed font-quran text-slate-900">
                      {q.text}
                    </CardTitle>
                    {q.image_url && (
                      <div className="mt-4 w-full max-w-sm overflow-hidden rounded-xl border-2 border-muted bg-muted/10 relative h-[200px]">
                        <Image src={q.image_url} alt="Question context" fill className="object-contain" />
                      </div>
                    )}
                  </div>
                  {ans.is_correct ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {q.type === 'short_answer' || q.type === 'fill_in_blank' ? (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border-2 ${ans.is_correct ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-2">إجابتك:</span>
                        <p className="font-bold text-lg">{ans.text_answer || <span className="italic opacity-50">لم يتم الإجابة</span>}</p>
                      </div>
                      {!ans.is_correct && q.type === 'fill_in_blank' && correctOpt && (
                        <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
                          <span className="text-xs font-black text-green-700 uppercase tracking-widest block mb-2">الإجابة الصحيحة:</span>
                          <p className="font-bold text-lg text-green-800">{correctOpt.text}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                   <div className="space-y-3">
                     <div className={`p-4 rounded-xl border-2 ${ans.is_correct ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                       <span className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-2">إجابتك:</span>
                       <p className="font-bold text-lg">{selectedOption ? selectedOption.text : <span className="italic opacity-50">لم يتم الإجابة</span>}</p>
                     </div>

                     {!ans.is_correct && correctOpt && (
                       <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
                         <span className="text-xs font-black text-green-700 uppercase tracking-widest block mb-2">الإجابة الصحيحة:</span>
                         <p className="font-bold text-lg text-green-800">{correctOpt.text}</p>
                       </div>
                     )}
                   </div>
                 )}

                {q.explanation && (
                  <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-100/50 italic text-blue-800">
                    <div className="flex items-center gap-2 mb-2 font-black text-xs uppercase tracking-widest non-italic">
                      <Sparkles className="w-4 h-4" />
                      توضيح المعلم
                    </div>
                    <p className="text-sm leading-relaxed font-medium">{q.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
           )
           })
         )}
       </div>

      <div className="flex justify-center pt-8">
        <Link href={backButtonTarget}>
          <Button size="lg" className="gap-2 rounded-xl h-14 px-10 font-black text-lg shadow-xl shadow-primary/20">
            {backButtonLabel} <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Leaderboard Section */}
      <div className="space-y-6 pt-16">
        <div className="flex items-center gap-3 px-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">لوحة الصدارة</h2>
        </div>
        
        <Card className="rounded-3xl border-none shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            {dedupedLeaderboard.length === 0 ? (
              <p className="p-12 text-center text-muted-foreground font-bold">لا توجد نتائج مسجلة بعد.</p>
            ) : (
              <div className="divide-y divide-muted/50">
                {dedupedLeaderboard.slice(0, 10).map((entry, i) => (
                  <div key={i} className={`flex items-center justify-between p-5 px-8 ${i === 0 ? 'bg-amber-50/30' : ''} transition-colors hover:bg-muted/10`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${
                        i === 0 ? 'bg-amber-400 text-white' : 
                        i === 1 ? 'bg-slate-300 text-slate-700' : 
                        i === 2 ? 'bg-orange-300 text-white' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-lg text-slate-800">{entry.name}</span>
                        {i === 0 && <Medal className="w-5 h-5 text-amber-500" />}
                      </div>
                    </div>
                    <div className="text-left flex items-baseline gap-1">
                      <span className="font-black text-2xl text-primary">{entry.score}</span>
                      <span className="text-muted-foreground font-black text-xs uppercase tracking-widest">/ {entry.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
