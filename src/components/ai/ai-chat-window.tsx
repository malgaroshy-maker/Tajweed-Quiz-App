'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, User, Send, Loader2, Sparkles, FileText, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

export function AIChatWindow({ sessionId }: { sessionId?: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'السلام عليكم! أنا مساعدكِ الذكي لعلوم التجويد والقرآن.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadMessages() {
      if (!currentSessionId) return
      const { data } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true })
      
      if (data && data.length > 0) {
        setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })))
      }
    }
    loadMessages()
  }, [currentSessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    let activeSessionId = currentSessionId
    if (!activeSessionId) {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: session } = await supabase.from('ai_chat_sessions').insert({ 
            teacher_id: user?.id, 
            title: input.slice(0, 30) + "..." 
        }).select().single()
        
        if (session) {
            activeSessionId = session.id
            setCurrentSessionId(activeSessionId)
        }
    }
    
    const userMsg = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    if (activeSessionId) {
      await supabase.from('ai_chat_messages').insert({ session_id: activeSessionId, role: 'user', content: userMsg.content })
    }

    const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
    })
    const data = await res.json()
    const assistantMsg = { role: 'assistant' as const, content: data.message }
    setMessages(prev => [...prev, assistantMsg])
    
    if (activeSessionId) {
      await supabase.from('ai_chat_messages').insert({ session_id: activeSessionId, role: 'assistant', content: assistantMsg.content })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full border-2 border-primary/20 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-primary text-white' : 'bg-white border-2 border-primary'}`}>
              {m.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t-2 border-primary/10 bg-white dark:bg-slate-900">
        <div className="flex items-end gap-2">
            <Textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="اكتبي سؤالاً..." 
                className="flex-1 rounded-2xl resize-none"
            />
            <Button onClick={handleSendMessage} disabled={loading} className="h-12 w-12 rounded-2xl">
                <Send className="w-5 h-5" />
            </Button>
        </div>
      </div>
    </div>
  )
}
