'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, User, Send, Loader2, Sparkles, Save, FileUp, FileText, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

export function AIChatWindow({ sessionId }: { sessionId?: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'السلام عليكم! أنا مساعدكِ الذكي لعلوم التجويد والقرآن.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadMessages() {
      if (!sessionId) return
      const { data } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      if (data && data.length > 0) {
        setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })))
      }
    }
    loadMessages()
  }, [sessionId])

  const handleSendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Save to DB (optional step)
    if (sessionId) {
      await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'user', content: input })
    }

    // Call API (simplified)
    const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
    })
    const data = await res.json()
    const assistantMsg = { role: 'assistant' as const, content: data.message }
    setMessages(prev => [...prev, assistantMsg])
    
    if (sessionId) {
      await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: assistantMsg.content })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[750px] border-2 border-primary/20 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 shadow-2xl relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {m.content}
                    </div>
                </div>
            ))}
        </div>
        <div className="p-4 border-t">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} />
            <Button onClick={handleSendMessage} disabled={loading}>إرسال</Button>
        </div>
    </div>
  )
}
