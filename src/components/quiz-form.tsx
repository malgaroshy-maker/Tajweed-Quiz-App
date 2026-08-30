'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Clock, Volume2, Mic, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { QuranAudioPlayer } from '@/components/quran-audio-player'
import { VoiceRecorder } from '@/components/voice-recorder'
import { getTajweedRuleById } from '@/lib/tajweed-rules'

interface QuizFormProps {
  quiz: {
    id: string
    title: string
    time_limit_minutes?: number | null
  }
  questions: {
    id: string;
    text: string;
    type: string;
    image_url?: string;
    audio_url?: string;
    surah_number?: number;
    ayah_number?: number;
    reciter_id?: string;
    tajweed_rule?: string;
    options?: { id: string; text: string }[];
  }[]
  guestName: string
  submitAction: (formData: FormData) => Promise<void>
}

export function QuizForm({ quiz, questions, guestName, submitAction }: QuizFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Timer State (in seconds)
  const hasTimeLimit = Boolean(quiz.time_limit_minutes && quiz.time_limit_minutes > 0)
  const totalSeconds = hasTimeLimit ? (quiz.time_limit_minutes! * 60) : 0
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds)
  const formRef = useRef<HTMLFormElement | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`quiz_progress_${quiz.id}`)
    if (saved) {
      try {
        setAnswers(JSON.parse(saved))
      } catch {
        console.error('Failed to parse saved progress')
      }
    }

    // Initialize / retrieve remaining timer
    if (hasTimeLimit) {
      const savedTimerKey = `quiz_timer_${quiz.id}`
      const savedRemaining = localStorage.getItem(savedTimerKey)
      if (savedRemaining) {
        setRemainingSeconds(parseInt(savedRemaining, 10))
      } else {
        setRemainingSeconds(totalSeconds)
      }
    }

    setIsLoaded(true)
  }, [quiz.id, hasTimeLimit, totalSeconds])

  // Save progress to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`quiz_progress_${quiz.id}`, JSON.stringify(answers))
    }
  }, [answers, quiz.id, isLoaded])

  // Countdown timer tick
  useEffect(() => {
    if (!hasTimeLimit || !isLoaded || isPending) return

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Auto submit form when time expires
          if (formRef.current) {
            formRef.current.requestSubmit()
          }
          return 0
        }
        const next = prev - 1
        localStorage.setItem(`quiz_timer_${quiz.id}`, next.toString())
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasTimeLimit, isLoaded, isPending, quiz.id])

  const handleValueChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await submitAction(formData)
      localStorage.removeItem(`quiz_progress_${quiz.id}`)
      localStorage.removeItem(`quiz_timer_${quiz.id}`)
    } catch (error) {
      console.error('Submission failed:', error)
      alert('حدث خطأ أثناء تسليم الإجابات. يرجى المحاولة مرة أخرى.')
      setIsPending(false)
    }
  }

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remaining = secs % 60
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`
  }

  if (!isLoaded) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
      {/* Sticky Top Timer Bar if Quiz is Timed */}
      {hasTimeLimit && (
        <div className="sticky top-4 z-30">
          <div className={`p-4 rounded-2xl border-2 backdrop-blur-md shadow-xl flex items-center justify-between transition-all ${remainingSeconds < 120 ? 'bg-red-500/90 text-white border-red-300 animate-pulse' : 'bg-primary/90 text-primary-foreground border-primary/20'}`}>
            <div className="flex items-center gap-2 font-black text-sm sm:text-base">
              <Clock className="w-5 h-5 animate-spin" />
              <span>الوقت المتبقي لانتهاء الاختبار:</span>
            </div>
            <span className="font-mono font-black text-2xl tracking-widest bg-black/20 px-4 py-1 rounded-xl">
              {formatCountdown(remainingSeconds)}
            </span>
          </div>
        </div>
      )}

      {/* Guest Name Card */}
      <Card className="parchment-card rounded-[2.5rem] shadow-2xl transition-premium hover:scale-[1.005]">
        <CardContent className="pt-8 p-8 md:p-10">
          <Label htmlFor="guest_name" className="text-primary font-black uppercase tracking-widest text-sm mb-3 block">
            اسم الطالب / الطالبة
          </Label>
          <Input 
            id="guest_name" 
            name="guest_name" 
            placeholder="اكتب اسمك الثلاثي هنا..." 
            className="bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] h-16 rounded-2xl text-xl font-black focus-visible:ring-primary shadow-inner" 
            defaultValue={answers['guest_name'] || guestName}
            onChange={(e) => handleValueChange('guest_name', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-3 font-bold opacity-70 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            سيتم إصدار شهادة التفوق وتسجيل النتيجة بهذا الاسم
          </p>
        </CardContent>
      </Card>

      {/* Questions Loop */}
      {questions.map((q, index) => {
        const tajweedMeta = q.tajweed_rule ? getTajweedRuleById(q.tajweed_rule) : null

        return (
          <Card key={q.id} className="parchment-card rounded-[3rem] shadow-2xl border-b-[12px] border-[#d4c3a3]/30 relative overflow-hidden group transition-premium hover:border-[#d4c3a3]/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[6rem] pointer-events-none transition-transform group-hover:scale-110" />
            
            <CardHeader className="p-8 md:p-10 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-xl">
                    {index + 1}
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    السؤال {index + 1} من {questions.length}
                  </span>
                </div>

                {/* Tajweed Category Badge */}
                {tajweedMeta && (
                  <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-sm ${tajweedMeta.bgColor} ${tajweedMeta.borderColor}`}>
                    {tajweedMeta.nameAr}
                  </span>
                )}
              </div>

              {/* Quran Audio Player for Auditory Questions */}
              {q.audio_url && (
                <div className="mb-6">
                  <QuranAudioPlayer
                    audioUrl={q.audio_url}
                    surahNumber={q.surah_number}
                    ayahNumber={q.ayah_number}
                    reciterId={q.reciter_id}
                  />
                </div>
              )}

              {/* Question Text */}
              <CardTitle className="text-2xl md:text-3xl leading-relaxed font-black font-quran text-slate-900 dark:text-slate-100 pr-2">
                {q.type === 'fill_in_blank' && q.text.includes('[...]') ? (
                  <span className="inline-block leading-[4rem]">
                    {q.text.split('[...]').map((part: string, i: number) => (
                      <span key={i}>
                        {part}
                        {i < q.text.split('[...]').length - 1 && (
                          <input 
                            type="text"
                            name={`question_${q.id}`}
                            placeholder=".........."
                            className="inline-block w-48 border-b-4 border-primary/40 mx-3 h-12 px-4 bg-primary/5 outline-none text-primary text-center font-black transition-premium focus:border-primary focus:bg-primary/10 rounded-t-xl text-xl"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleValueChange(q.id, e.target.value)}
                            required
                          />
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  q.text
                )}
              </CardTitle>

              {/* Ayah Image */}
              {q.image_url && (
                <div className="mt-6 w-full max-w-2xl mx-auto overflow-hidden rounded-[2rem] border-4 border-[#d4c3a3]/30 bg-white/50 shadow-inner relative h-[320px]">
                  <Image 
                    src={q.image_url} 
                    alt="Question content" 
                    fill
                    className="object-contain p-4" 
                  />
                </div>
              )}
            </CardHeader>

            <CardContent className="p-8 md:p-10 pt-2">
              {/* Question Form Types */}
              {q.type === 'voice_recitation' ? (
                <div className="pt-2">
                  <VoiceRecorder
                    questionId={q.id}
                    name={`question_${q.id}`}
                    initialAudioUrl={answers[q.id] || undefined}
                    onAudioUploaded={(url) => handleValueChange(q.id, url)}
                  />
                </div>
              ) : q.type === 'short_answer' || (q.type === 'fill_in_blank' && !q.text.includes('[...]')) ? (
                <div className="space-y-4">
                  <Label htmlFor={`q_${q.id}`} className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    إجابتك المكتوبة:
                  </Label>
                  {q.type === 'short_answer' ? (
                    <Textarea 
                      name={`question_${q.id}`} 
                      id={`q_${q.id}`} 
                      placeholder="اكتب إجابتك بالتفصيل هنا..." 
                      className="min-h-[140px] text-xl font-black font-quran bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] rounded-2xl p-6 focus-visible:ring-primary shadow-inner leading-relaxed" 
                      value={answers[q.id] || ''}
                      onChange={(e) => handleValueChange(q.id, e.target.value)}
                    />
                  ) : (
                    <Input 
                      name={`question_${q.id}`} 
                      id={`q_${q.id}`} 
                      placeholder="اكتب الكلمة أو الحكم الصحيح..." 
                      className="h-16 text-xl font-black font-quran bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] rounded-2xl px-6 focus-visible:ring-primary shadow-inner" 
                      value={answers[q.id] || ''}
                      onChange={(e) => handleValueChange(q.id, e.target.value)}
                    />
                  )}
                </div>
              ) : q.type === 'fill_in_blank' && q.text.includes('[...]') ? (
                <div className="p-4 vellum-glass rounded-2xl border border-primary/20 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm text-primary font-black">يرجى كتابة الإجابة في الفراغ الموجود داخل نص السؤال أعلاه.</p>
                </div>
              ) : (
                /* Multiple Choice, Audio MCQ, True/False, Tajweed Rule */
                <RadioGroup 
                  name={`question_${q.id}`} 
                  className="grid grid-cols-1 gap-4"
                  value={answers[q.id] || ''}
                  onValueChange={(val) => handleValueChange(q.id, val)}
                >
                  {q.options?.map((opt: { id: string; text: string }) => (
                    <div 
                      key={opt.id} 
                      onClick={() => handleValueChange(q.id, opt.id)}
                      className={`flex items-center space-x-4 space-x-reverse rounded-2xl border-2 p-5 md:p-6 transition-premium cursor-pointer group/opt shadow-sm ${answers[q.id] === opt.id ? 'bg-primary text-primary-foreground border-primary shadow-xl scale-[1.01]' : 'bg-white/60 dark:bg-black/20 border-[#d4c3a3] hover:border-primary/50'}`}
                    >
                      <RadioGroupItem value={opt.id} id={`opt_${opt.id}`} className={answers[q.id] === opt.id ? 'border-white text-white w-5 h-5' : 'border-primary w-5 h-5'} />
                      <Label htmlFor={`opt_${opt.id}`} className="flex-1 cursor-pointer text-xl font-black pr-4 font-quran leading-relaxed">
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-6 z-20 p-6 md:p-8 vellum-glass border-2 border-[#d4c3a3] rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-xs font-black uppercase tracking-widest text-primary/70 mb-1">التقدم في الإجابات</span>
          <div className="flex items-center gap-3">
            <span className="font-black text-foreground text-2xl">
              {Object.keys(answers).filter(k => k !== 'guest_name').length} <span className="text-sm opacity-40">/ {questions.length}</span>
            </span>
            <div className="w-32 h-2.5 bg-muted rounded-full overflow-hidden shadow-inner hidden md:block">
              <div 
                className="bg-primary h-full transition-all duration-300" 
                style={{ width: `${(Object.keys(answers).filter(k => k !== 'guest_name').length / questions.length) * 100}%` }} 
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full sm:w-auto h-16 px-12 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3 bg-primary text-primary-foreground" 
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 -rotate-90" />}
          {isPending ? 'جاري تسليم الإجابات...' : 'تسليم وإنهاء الاختبار'}
        </Button>
      </div>
    </form>
  )
}
