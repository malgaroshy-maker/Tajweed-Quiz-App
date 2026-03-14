'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface QuizFormProps {
  quiz: any
  questions: any[]
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
      } catch (e) {
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="bg-muted/50 border-none shadow-none">
        <CardContent className="pt-6">
          <Label htmlFor="guest_name">اسمك (إذا كنت غير مسجل الدخول)</Label>
          <Input 
            id="guest_name" 
            name="guest_name" 
            placeholder="الاسم الكريم..." 
            className="bg-background mt-2" 
            defaultValue={answers['guest_name'] || guestName}
            onChange={(e) => handleValueChange('guest_name', e.target.value)}
          />
        </CardContent>
      </Card>

      {questions.map((q, index) => (
        <Card key={q.id} className="border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed font-quran">
              <span className="text-primary ml-2 font-sans">{index + 1}.</span> 
              {q.type === 'fill_in_blank' && q.text.includes('[...]') ? (
                <span>
                  {q.text.split('[...]').map((part: string, i: number) => (
                    <span key={i}>
                      {part}
                      {i < q.text.split('[...]').length - 1 && (
                        <input 
                          type="text"
                          name={`question_${q.id}`}
                          placeholder="..."
                          className="inline-block w-32 border-b-2 border-primary mx-1 h-8 px-2 bg-primary/5 outline-none text-foreground text-center"
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
              <div className="mt-4 w-full max-w-2xl mx-auto overflow-hidden rounded-md border bg-muted/30">
                <img 
                  src={q.image_url} 
                  alt="Question content" 
                  className="w-full h-auto max-h-[400px] object-contain cursor-zoom-in" 
                  onClick={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.style.maxHeight === 'none') {
                      target.style.maxHeight = '400px';
                    } else {
                      target.style.maxHeight = 'none';
                    }
                  }}
                />
                <p className="text-[10px] text-muted-foreground text-center py-1 font-sans">اضغط للتكبير</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {q.type === 'short_answer' || (q.type === 'fill_in_blank' && !q.text.includes('[...]')) ? (
              <div className="space-y-2">
                <Label htmlFor={`q_${q.id}`} className="text-muted-foreground">الإجابة:</Label>
                {q.type === 'short_answer' ? (
                  <Textarea 
                    name={`question_${q.id}`} 
                    id={`q_${q.id}`} 
                    placeholder="اكتب إجابتك هنا..." 
                    className="min-h-[100px] text-lg font-quran" 
                    value={answers[q.id] || ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                  />
                ) : (
                  <Input 
                    name={`question_${q.id}`} 
                    id={`q_${q.id}`} 
                    placeholder="اكتب الكلمة الناقصة..." 
                    className="text-lg py-6 font-quran" 
                    value={answers[q.id] || ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ) : q.type === 'fill_in_blank' && q.text.includes('[...]') ? (
              <p className="text-xs text-muted-foreground italic">املأ الفراغ أعلاه في نص السؤال.</p>
            ) : (
              <RadioGroup 
                name={`question_${q.id}`} 
                className="space-y-3"
                value={answers[q.id] || ''}
                onValueChange={(val) => handleValueChange(q.id, val)}
              >
                {q.options?.map((opt: any) => (
                  <div key={opt.id} className="flex items-center space-x-3 space-x-reverse rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value={opt.id} id={`opt_${opt.id}`} />
                    <Label htmlFor={`opt_${opt.id}`} className="flex-1 cursor-pointer text-lg font-medium pr-2 font-quran">
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="sticky bottom-4 z-10 p-4 bg-background/80 backdrop-blur-md border rounded-xl shadow-lg flex justify-between items-center">
        <span className="font-semibold text-muted-foreground font-sans">عدد الأسئلة: {questions.length}</span>
        <Button type="submit" size="lg" className="px-8 text-lg font-bold" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          {isPending ? 'جاري التسليم...' : 'تسليم الإجابات'}
        </Button>
      </div>
    </form>
  )
}
