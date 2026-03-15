'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AIAssistant({ quizId }: { quizId: string }) {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [count, setCount] = useState([3])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleGenerate = async () => {
    if (!topic) {
      setError('يرجى كتابة موضوع الأسئلة')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, difficulty, count: count[0] }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'فشل في توليد الأسئلة')
      }

      // Now we need to save these generated questions to the database
      const saveRes = await fetch(`/api/ai/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizId, questions: data.questions }),
      })

      if (!saveRes.ok) {
        throw new Error('فشل في حفظ الأسئلة المولدة')
      }

      setSuccess(true)
      router.refresh()
      setTopic('')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8 bg-white border-2 border-primary/10 rounded-[2rem] shadow-xl shadow-primary/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="text-primary w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">مولد الأسئلة الذكي</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-sm font-black uppercase tracking-widest text-primary/70">موضوع الأسئلة</Label>
        <Input 
          id="topic" 
          placeholder="مثال: أحكام النون الساكنة والتنوين..." 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-14 rounded-xl border-2 border-muted hover:border-primary/20 focus-visible:border-primary transition-all text-lg font-bold"
        />
      </div>

      <div className="space-y-2 mt-4">
        <Label className="text-sm font-black uppercase tracking-widest text-primary/70">مستوى الصعوبة</Label>
        <Select value={difficulty} onValueChange={(v) => { if(v) setDifficulty(v) }}>
          <SelectTrigger className="h-14 rounded-xl border-2 border-muted hover:border-primary/20 focus-visible:border-primary transition-all text-lg font-bold">
            <SelectValue placeholder="اختر الصعوبة" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2">
            <SelectItem value="easy" className="font-bold">مبتدئ</SelectItem>
            <SelectItem value="medium" className="font-bold">متوسط</SelectItem>
            <SelectItem value="hard" className="font-bold">متقدم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center px-1">
          <Label className="text-sm font-black uppercase tracking-widest text-primary/70">عدد الأسئلة</Label>
          <span className="font-black text-2xl text-primary bg-primary/10 px-4 py-1 rounded-lg">{count[0]}</span>
        </div>
        <div dir="ltr" className="pt-2">
          <Slider 
            value={count} 
            onValueChange={(v) => setCount(Array.isArray(v) ? v : [v])} 
            max={10} 
            min={1} 
            step={1} 
            className="cursor-pointer"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-black flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5" />
          تم توليد وإضافة الأسئلة بنجاح إلى الاختبار!
        </div>
      )}

      <Button 
        onClick={handleGenerate} 
        disabled={loading} 
        className="w-full h-16 mt-6 gap-3 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98"
        variant="default"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
        {loading ? 'جاري التفكير...' : 'توليد الأسئلة الآن'}
      </Button>
    </div>
  )
}
