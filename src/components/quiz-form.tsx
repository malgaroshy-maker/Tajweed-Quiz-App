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
      <Card className="parchment-card rounded-[2rem] shadow-xl">
        <CardContent className="pt-8 p-8">
          <Label htmlFor="guest_name" className="text-primary font-black uppercase tracking-widest text-xs mb-3 block">اسم الطالب</Label>
          <Input 
            id="guest_name" 
            name="guest_name" 
            placeholder="ادخلي اسمكِ الكريم هنا..." 
            className="bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] h-14 rounded-2xl text-lg font-bold focus-visible:ring-primary" 
            defaultValue={answers['guest_name'] || guestName}
            onChange={(e) => handleValueChange('guest_name', e.target.value)}
          />
          <p className="text-[10px] text-muted-foreground mt-3 font-bold opacity-60">* سيتم تسجيل النتيجة بهذا الاسم في لوحة صدارة المعلمة</p>
        </CardContent>
      </Card>

      {questions.map((q, index) => (
        <Card key={q.id} className="parchment-card rounded-[2.5rem] shadow-2xl border-b-8 border-[#d4c3a3]/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] pointer-events-none" />
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg">
                    {index + 1}
                </div>
                <div className="h-0.5 flex-1 bg-[#d4c3a3]/30 rounded-full" />
            </div>
            <CardTitle className="text-2xl leading-relaxed font-black font-quran text-slate-900 dark:text-slate-100">
              {q.type === 'fill_in_blank' && q.text.includes('[...]') ? (
                <span className="inline-block leading-[3rem]">
                  {q.text.split('[...]').map((part: string, i: number) => (
                    <span key={i}>
                      {part}
                      {i < q.text.split('[...]').length - 1 && (
                        <input 
                          type="text"
                          name={`question_${q.id}`}
                          placeholder=".........."
                          className="inline-block w-40 border-b-4 border-primary/40 mx-2 h-10 px-4 bg-primary/5 outline-none text-primary text-center font-bold transition-all focus:border-primary focus:bg-primary/10 rounded-t-lg"
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
              <div className="mt-8 w-full max-w-2xl mx-auto overflow-hidden rounded-3xl border-4 border-[#d4c3a3]/30 bg-white/50 shadow-inner relative h-[350px]">
                <Image 
                  src={q.image_url} 
                  alt="Question content" 
                  fill
                  className="object-contain p-4" 
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {q.type === 'short_answer' || (q.type === 'fill_in_blank' && !q.text.includes('[...]')) ? (
              <div className="space-y-4">
                <Label htmlFor={`q_${q.id}`} className="text-primary font-black uppercase tracking-widest text-xs">إجابتكِ المكتوبة:</Label>
                {q.type === 'short_answer' ? (
                  <Textarea 
                    name={`question_${q.id}`} 
                    id={`q_${q.id}`} 
                    placeholder="اكتبي إجابتكِ بالتفصيل هنا..." 
                    className="min-h-[150px] text-xl font-bold font-quran bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] rounded-3xl p-6 focus-visible:ring-primary shadow-inner" 
                    value={answers[q.id] || ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                  />
                ) : (
                  <Input 
                    name={`question_${q.id}`} 
                    id={`q_${q.id}`} 
                    placeholder="اكتبي الكلمة الصحيحة..." 
                    className="h-16 text-xl font-bold font-quran bg-white/50 dark:bg-black/20 border-2 border-[#d4c3a3] rounded-2xl px-6 focus-visible:ring-primary shadow-inner" 
                    value={answers[q.id] || ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ) : q.type === 'fill_in_blank' && q.text.includes('[...]') ? (
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm text-primary font-bold">يرجى كتابة الإجابة في الفراغ الموجود داخل نص السؤال أعلاه.</p>
              </div>
            ) : (
              <RadioGroup 
                name={`question_${q.id}`} 
                className="grid grid-cols-1 gap-4"
                value={answers[q.id] || ''}
                onValueChange={(val) => handleValueChange(q.id, val)}
              >
                {q.options?.map((opt: { id: string; text: string }) => (
                  <div key={opt.id} className={`flex items-center space-x-4 space-x-reverse rounded-[1.5rem] border-2 p-6 transition-all cursor-pointer group/opt ${answers[q.id] === opt.id ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]' : 'bg-white/50 dark:bg-black/20 border-[#d4c3a3] hover:border-primary/50 hover:bg-white dark:hover:bg-black/40'}`}>
                    <RadioGroupItem value={opt.id} id={`opt_${opt.id}`} className={answers[q.id] === opt.id ? 'border-white text-white' : 'border-primary'} />
                    <Label htmlFor={`opt_${opt.id}`} className="flex-1 cursor-pointer text-xl font-bold pr-3 font-quran leading-relaxed">
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="sticky bottom-6 z-20 p-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-2 border-[#d4c3a3] rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center sm:items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">التقدم المحرز</span>
            <span className="font-black text-slate-900 dark:text-white text-xl">
                {Object.keys(answers).filter(k => k !== 'guest_name').length} من {questions.length} أسئلة
            </span>
        </div>
        <Button type="submit" size="lg" className="w-full sm:w-auto h-16 px-12 text-xl font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3" disabled={isPending}>
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 -rotate-90" />}
          {isPending ? 'جاري الحفظ...' : 'تسليم الاختبار النهائي'}
        </Button>
      </div>
    </form>
  )
}
