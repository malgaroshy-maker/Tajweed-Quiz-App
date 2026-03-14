'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, User, Send, Loader2, Sparkles, Plus, Copy, Check, Save } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

export function AIChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, questions?: any[] }[]>([
    { role: 'assistant', content: 'السلام عليكم! أنا مساعدك الذكي لعلوم التجويد والقرآن. يمكنك طرح أي سؤال، أو لصق نص من كتاب أو ملف وسأساعدك في استخراج أسئلة اختبار منه مباشرة.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user' as const, content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      
      // Basic detection if the response contains questions in JSON format
      // In a real app, we'd have a more structured API response
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: data.message,
        questions: data.questions // Assuming the API might return structured questions
      }])
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'عذراً، حدث خطأ أثناء التواصل مع الذكاء الاصطناعي.' }])
    } finally {
      setLoading(false)
    }
  }

  const saveToBank = async (q: any) => {
    try {
      const res = await fetch('/api/ai/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      if (res.ok) {
        alert('تم حفظ السؤال بنجاح في بنك الأسئلة')
      }
    } catch (e) {
      alert('فشل حفظ السؤال')
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-2xl overflow-hidden bg-background shadow-xl">
      <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">مساعد التجويد الذكي</span>
        </div>
        <div className="text-[10px] bg-primary-foreground/20 px-2 py-1 rounded-full">الوضع المتقدم</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className={`p-4 rounded-2xl leading-relaxed ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white border rounded-tl-none shadow-sm'}`}>
                {m.content}
              </div>
              
              {m.questions && m.questions.length > 0 && (
                <div className="grid gap-3 mt-2">
                  {m.questions.map((q: any, idx: number) => (
                    <Card key={idx} className="bg-primary/5 border-primary/20">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-bold text-sm">{q.text}</p>
                        <Button size="sm" variant="outline" className="w-full gap-1 h-8 text-xs" onClick={() => saveToBank(q)}>
                          <Save className="w-3 h-3" />
                          حفظ في بنك الأسئلة
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium animate-pulse">جاري معالجة المحتوى...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white space-y-3">
        <div className="flex flex-col gap-2">
          <Textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="لصق نص لإنشاء أسئلة، أو طرح استفسار..." 
            className="min-h-[100px] p-4 resize-none border-2 border-muted focus-visible:border-primary rounded-2xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -rotate-90" />}
            {loading ? 'جاري المعالجة...' : 'إرسال للمساعد'}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
          يمكنك لصق نصوص طويلة من ملفات الـ PDF أو الكتب لاستخراج أحكام التجويد والأسئلة منها.
        </p>
      </div>
    </div>
  )
}
