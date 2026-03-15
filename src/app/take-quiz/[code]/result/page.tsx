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
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12 pb-24 parchment-texture">
      <ConfettiCelebration score={Number(attempt.score)} total={attempt.total_questions} />
      
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">النتيجة: {attempt.quizzes?.title}</h1>
        
        <Card className={`rounded-[3rem] border-none shadow-2xl overflow-hidden transition-premium hover:scale-[1.02] ${percentage >= 50 ? 'bg-primary text-white' : 'bg-red-600 text-white'}`}>
          <CardContent className="flex flex-col items-center justify-center p-12 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[4rem] pointer-events-none" />
            <span className="text-8xl font-black mb-4 leading-none tracking-tighter shadow-sm">{attempt.score} / {attempt.total_questions}</span>
            <div className="flex items-center gap-4 bg-white/20 px-8 py-3 rounded-2xl backdrop-blur-md">
                <span className="text-3xl font-black">{percentage}%</span>
                <div className="w-[2px] h-8 bg-white/40" />
                <span className="text-xl font-bold uppercase tracking-widest">الدقة</span>
            </div>
            
            {percentage >= 50 ? (
              <div className="flex flex-col items-center mt-10 gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-bounce shadow-xl">
                    <Trophy className="w-12 h-12 text-amber-300" />
                </div>
                <span className="font-black text-3xl">أحسنتِ! أداء متميز ومبارك</span>
              </div>
            ) : (
              <div className="flex flex-col items-center mt-10 gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shadow-xl">
                    <XCircle className="w-12 h-12 text-red-200" />
                </div>
                <span className="font-black text-3xl">تحتاجين لمزيد من المراجعة والتدريب</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="space-y-10">
         <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 px-2">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ListTodo className="w-7 h-7" />
           </div>
           مراجعة الإجابات التفصيلية
         </h2>

         {!answers || answers.length === 0 ? (
           <Card className="parchment-card rounded-[3rem] border-none shadow-xl">
             <CardContent className="pt-10 text-center text-muted-foreground font-bold py-20">
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
              <Card key={ans.id} className={`parchment-card rounded-[3rem] border-none shadow-xl transition-premium group hover:scale-[1.01] ${ans.is_correct ? 'border-r-[12px] border-green-500/30' : 'border-r-[12px] border-red-500/30'}`}>
                <CardHeader className="flex flex-col md:flex-row items-start justify-between gap-6 p-10 pb-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-4 mb-6">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shadow-lg transition-premium group-hover:rotate-12 ${ans.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border shadow-sm ${ans.is_correct ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {ans.is_correct ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                      </span>
                    </div>
                    <CardTitle className="text-2xl font-black leading-relaxed font-quran text-slate-900 dark:text-slate-100 pr-2">
                      {q.text}
                    </CardTitle>
                    {q.image_url && (
                      <div className="mt-8 w-full max-w-md overflow-hidden rounded-[2.5rem] border-4 border-[#d4c3a3]/30 bg-white/50 relative h-[250px] transition-premium group-hover:border-[#d4c3a3]/50 shadow-inner">
                        <Image src={q.image_url} alt="Question context" fill className="object-contain p-4" />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 transition-premium group-hover:scale-110">
                    {ans.is_correct ? (
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shadow-inner">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shadow-inner">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-10 pt-6">
                  {q.type === 'short_answer' || q.type === 'fill_in_blank' ? (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-[2rem] border-2 shadow-inner ${ans.is_correct ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-3">إجابتكِ:</span>
                        <p className="font-black text-xl text-slate-900 font-quran leading-relaxed">{ans.text_answer || <span className="italic opacity-40">لم يتم الإجابة</span>}</p>
                      </div>
                      {!ans.is_correct && q.type === 'fill_in_blank' && correctOpt && (
                        <div className="p-6 rounded-[2rem] border-2 border-green-200 bg-green-50 shadow-md">
                          <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] block mb-3">الإجابة الصحيحة:</span>
                          <p className="font-black text-xl text-green-900 font-quran leading-relaxed">{correctOpt.text}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                   <div className="space-y-4">
                     <div className={`p-6 rounded-[2rem] border-2 shadow-inner ${ans.is_correct ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-3">إجابتكِ:</span>
                       <p className="font-black text-xl text-slate-900 font-quran leading-relaxed">{selectedOption ? selectedOption.text : <span className="italic opacity-40">لم يتم الإجابة</span>}</p>
                     </div>

                     {!ans.is_correct && correctOpt && (
                       <div className="p-6 rounded-[2rem] border-2 border-green-200 bg-green-50 shadow-md">
                         <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] block mb-3">الإجابة الصحيحة:</span>
                         <p className="font-black text-xl text-green-900 font-quran leading-relaxed">{correctOpt.text}</p>
                       </div>
                     )}
                   </div>
                  )}

                {q.explanation && (
                  <div className="mt-8 p-8 vellum-glass rounded-[2.5rem] border-2 border-primary/20 relative overflow-hidden group/exp">
                    <div className="absolute top-2 left-4 opacity-5 font-quran text-5xl pointer-events-none transition-premium group-hover/exp:scale-110">توضيح</div>
                    <div className="flex items-center gap-3 mb-4 font-black text-xs uppercase tracking-[0.3em] text-primary">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      توضيح المعلمة
                    </div>
                    <p className="text-lg leading-relaxed font-bold text-slate-700 dark:text-slate-300 pr-2 italic">{q.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
           )
           })
         )}
       </div>

      <div className="flex justify-center pt-12">
        <Link href={backButtonTarget}>
          <Button size="lg" className="gap-4 rounded-2xl h-20 px-12 font-black text-2xl shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-premium bg-primary text-white">
            {backButtonLabel} <ArrowRight className="w-7 h-7" />
          </Button>
        </Link>
      </div>

      {/* Leaderboard Section */}
      <div className="space-y-10 pt-20">
        <div className="flex items-center gap-6 px-4">
          <div className="w-16 h-16 rounded-[1.5rem] bg-amber-100 flex items-center justify-center text-amber-600 shadow-xl transition-premium hover:rotate-12">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">لوحة الصدارة</h2>
            <p className="text-slate-500 font-bold">أوائل الطالبات المتميزات في هذا الاختبار</p>
          </div>
        </div>
        
        <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden transition-premium hover:shadow-primary/10">
          <CardContent className="p-0">
            {dedupedLeaderboard.length === 0 ? (
              <p className="p-20 text-center text-muted-foreground font-black text-xl italic">لا توجد نتائج مسجلة بعد.</p>
            ) : (
              <div className="divide-y-2 divide-[#d4c3a3]/20">
                {dedupedLeaderboard.slice(0, 10).map((entry, i) => (
                  <div key={i} className={`flex items-center justify-between p-8 px-12 ${i === 0 ? 'bg-amber-400/5' : ''} transition-premium hover:bg-white/60 group`}>
                    <div className="flex items-center gap-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-premium group-hover:scale-110 ${
                        i === 0 ? 'bg-amber-400 text-white rotate-3' : 
                        i === 1 ? 'bg-slate-300 text-slate-700' : 
                        i === 2 ? 'bg-orange-300 text-white' : 
                        'bg-white border-2 border-slate-100 text-slate-400'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-2xl text-slate-800 dark:text-white group-hover:text-primary transition-colors">{entry.name}</span>
                        {i === 0 && <Medal className="w-7 h-7 text-amber-500 animate-pulse" />}
                      </div>
                    </div>
                    <div className="text-left flex items-baseline gap-2 bg-white/50 px-6 py-2 rounded-2xl shadow-inner border border-primary/5">
                      <span className="font-black text-4xl text-primary tracking-tighter">{entry.score}</span>
                      <span className="text-slate-400 font-black text-sm uppercase tracking-widest opacity-50">/ {entry.total}</span>
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
