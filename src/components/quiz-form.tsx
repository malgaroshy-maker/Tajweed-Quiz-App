'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'
import Image from 'next/image'

interface QuizFormProps {
  quiz: { id: string }
  questions: {
    id: string;
    text: string;
    type: string;
    image_url?: string;
    options?: { id: string; text: string }[];
  }[]
  guestName: string
  submitAction: (formData: FormData) => Promise<void>
}

export function QuizForm({ quiz, questions, guestName, submitAction }: QuizFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoaded, setIsLoaded] = useState(false)

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
    setIsLoaded(true)
  }, [quiz.id])

  // Save to localStorage whenever answers change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`quiz_progress_${quiz.id}`, JSON.stringify(answers))
    }
  }, [answers, quiz.id, isLoaded])

  const handleValueChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await submitAction(formData)
      // Clear localStorage on success (the page will redirect anyway)
      localStorage.removeItem(`quiz_progress_${quiz.id}`)
    } catch (error) {
      console.error('Submission failed:', error)
      alert('حدث خطأ أثناء تسليم الإجابات. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsPending(false)
    }
  }

  if (!isLoaded) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <Card className="parchment-card rounded-[2.5rem] shadow-2xl transition-premium hover:scale-[1.005]">
        <CardContent className="pt-10 p-10">
          <Label htmlFor="guest_name" className="text-primary font-black uppercase tracking-widest text-sm mb-4 block">اسم الطالبة الكريمة</Label>
          <Input 
            id="guest_name" 
            name="guest_name" 
            placeholder="ادخلي اسمكِ هنا..." 
            className="bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] h-16 rounded-2xl text-xl font-black focus-visible:ring-primary shadow-inner" 
            defaultValue={answers['guest_name'] || guestName}
            onChange={(e) => handleValueChange('guest_name', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-4 font-bold opacity-70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              سيتم تسجيل النتيجة بهذا الاسم في لوحة صدارة المعلمة
          </p>
        </CardContent>
      </Card>

      {questions.map((q, index) => (
        <Card key={q.id} className="parchment-card rounded-[3rem] shadow-2xl border-b-[12px] border-[#d4c3a3]/30 relative overflow-hidden group transition-premium hover:border-[#d4c3a3]/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[6rem] pointer-events-none transition-transform group-hover:scale-110" />
          <CardHeader className="p-10 pb-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl transition-premium group-hover:rotate-12">
                    {index + 1}
                </div>
                <div className="h-0.5 flex-1 bg-[#d4c3a3]/40 rounded-full" />
            </div>
            <CardTitle className="text-3xl leading-relaxed font-black font-quran text-slate-900 dark:text-slate-100 pr-2">
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
                          className="inline-block w-48 border-b-4 border-primary/40 mx-3 h-12 px-5 bg-primary/5 outline-none text-primary text-center font-black transition-premium focus:border-primary focus:bg-primary/10 rounded-t-xl"
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
            {q.image_url && (
              <div className="mt-10 w-full max-w-2xl mx-auto overflow-hidden rounded-[2.5rem] border-8 border-[#d4c3a3]/20 bg-white/50 shadow-inner relative h-[400px] transition-premium group-hover:border-[#d4c3a3]/40">
                <Image 
                  src={q.image_url} 
                  alt="Question content" 
                  fill
                  className="object-contain p-6" 
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-10 pt-6">
            {q.type === 'short_answer' || (q.type === 'fill_in_blank' && !q.text.includes('[...]')) ? (
              <div className="space-y-6">
                <Label htmlFor={`q_${q.id}`} className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    إجابتكِ المكتوبة:
                </Label>
                {q.type === 'short_answer' ? (
                  <Textarea 
                    name={`question_${q.id}`} 
                    id={`q_${q.id}`} 
                    placeholder="اكتبي إجابتكِ بالتفصيل هنا..." 
                    className="min-h-[200px] text-2xl font-black font-quran bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] rounded-[2rem] p-8 focus-visible:ring-primary shadow-inner leading-relaxed" 
                    value={answers[q.id] || ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                  />
                ) : (
                  <Input 
                    name={`question_${q.id}`} 
                    id={`q_${q.id}`} 
                    placeholder="اكتبي الكلمة الصحيحة..." 
                    className="h-20 text-2xl font-black font-quran bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] rounded-2xl px-8 focus-visible:ring-primary shadow-inner" 
                    value={answers[q.id] || ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ) : q.type === 'fill_in_blank' && q.text.includes('[...]') ? (
              <div className="p-6 vellum-glass rounded-[2rem] border border-primary/20 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <p className="text-lg text-primary font-black">يرجى كتابة الإجابة في الفراغ الموجود داخل نص السؤال أعلاه.</p>
              </div>
            ) : (
              <RadioGroup 
                name={`question_${q.id}`} 
                className="grid grid-cols-1 gap-6"
                value={answers[q.id] || ''}
                onValueChange={(val) => handleValueChange(q.id, val)}
              >
                {q.options?.map((opt: { id: string; text: string }) => (
                  <div key={opt.id} className={`flex items-center space-x-4 space-x-reverse rounded-[2rem] border-2 p-8 transition-premium cursor-pointer group/opt shadow-sm ${answers[q.id] === opt.id ? 'bg-primary text-primary-foreground border-primary shadow-2xl scale-[1.02]' : 'bg-white/50 dark:bg-black/20 border-[#d4c3a3] hover:border-primary/50 hover:bg-white dark:hover:bg-black/40'}`}>
                    <RadioGroupItem value={opt.id} id={`opt_${opt.id}`} className={answers[q.id] === opt.id ? 'border-white text-white w-6 h-6' : 'border-primary w-6 h-6'} />
                    <Label htmlFor={`opt_${opt.id}`} className="flex-1 cursor-pointer text-2xl font-black pr-6 font-quran leading-relaxed">
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="sticky bottom-8 z-20 p-8 vellum-glass border-2 border-[#d4c3a3] rounded-[3rem] shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-8 max-w-4xl mx-auto transition-premium hover:shadow-primary/10">
        <div className="flex flex-col items-center sm:items-start">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 mb-2">التقدم في الاختبار</span>
            <div className="flex items-center gap-3">
                <span className="font-black text-slate-900 dark:text-white text-3xl tracking-tighter">
                    {Object.keys(answers).filter(k => k !== 'guest_name').length} <span className="text-sm opacity-30 text-slate-500">/ {questions.length}</span>
                </span>
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner hidden md:block">
                    <div 
                        className="bg-primary h-full transition-premium" 
                        style={{ width: `${(Object.keys(answers).filter(k => k !== 'guest_name').length / questions.length) * 100}%` }} 
                    />
                </div>
            </div>
        </div>
        <Button type="submit" size="lg" className="w-full sm:w-auto h-20 px-16 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-premium gap-4 bg-primary text-white" disabled={isPending}>
          {isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8 -rotate-90" />}
          {isPending ? 'جاري الحفظ...' : 'تسليم الاختبار'}
        </Button>
      </div>
    </form>
  )
}
