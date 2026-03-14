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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 border rounded p-4 bg-primary/5 text-card-foreground">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-primary" />
        <h3 className="text-lg font-bold text-primary">المساعد الذكي (AI)</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="topic">موضوع الأسئلة</Label>
        <Input 
          id="topic" 
          placeholder="مثال: أحكام النون الساكنة والتنوين..." 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="space-y-2 mt-4">
        <Label>مستوى الصعوبة</Label>
        <Select value={difficulty} onValueChange={(v) => { if(v) setDifficulty(v) }}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الصعوبة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">سهل</SelectItem>
            <SelectItem value="medium">متوسط</SelectItem>
            <SelectItem value="hard">صعب</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex justify-between">
          <Label>عدد الأسئلة</Label>
          <span className="font-bold">{count[0]}</span>
        </div>
        <div dir="ltr">
          <Slider 
            value={count} 
            onValueChange={(v) => setCount(Array.isArray(v) ? v : [v])} 
            max={10} 
            min={1} 
            step={1} 
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-4">{error}</p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 mt-4 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          تم توليد وإضافة الأسئلة بنجاح!
        </div>
      )}

      <Button 
        onClick={handleGenerate} 
        disabled={loading} 
        className="w-full mt-6 gap-2"
        variant="default"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'جاري التفكير...' : 'توليد الأسئلة'}
      </Button>
    </div>
  )
}
