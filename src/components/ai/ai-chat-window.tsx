'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, User, Send, Loader2, FileUp, FileText, X, Plus, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

export function AIChatWindow({ sessionId }: { sessionId?: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'السلام عليكم! أنا مساعدكِ الذكي لعلوم التجويد والقرآن.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setSelectedFile(file)
    } else {
        alert('يرجى اختيار ملف PDF أو صورة')
    }
  }

  const parseFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      const res = await fetch('/api/ai/parse-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.text) {
        setInput(prev => prev + "\n\n[محتوى الملف]:\n" + data.text.slice(0, 10000))
      }
    } catch {
      alert('فشل في قراءة الملف')
    } finally {
      setUploading(false)
      setSelectedFile(null)
    }
  }

  const handleSendMessage = async () => {
    if (selectedFile) {
        await parseFile(selectedFile)
        return
    }
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
    <div className="flex flex-col h-full bg-[#f8f8f5] dark:bg-slate-950 parchment-texture rounded-3xl overflow-hidden shadow-inner border border-primary/10">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${m.role === 'assistant' ? 'bg-primary text-white' : 'bg-white border border-primary/20 text-primary'}`}>
              {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] p-5 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'}`}>
                {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-primary/10">
        {selectedFile && (
            <div className="flex items-center justify-between p-3 mb-4 bg-white rounded-xl border border-primary/20">
                <div className='flex items-center gap-2 text-sm font-bold'><FileText className="w-4 h-4"/> {selectedFile.name}</div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}><X className="w-4 h-4" /></Button>
            </div>
        )}
        <div className="flex items-end gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-primary/20 shadow-sm">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*" className="hidden" />
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <FileUp className="w-5 h-5 text-primary" />
            </Button>
            <Textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="اكتبي سؤالاً أو ارفعي ملفاً..." 
                className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none min-h-[40px] max-h-[120px]"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                    }
                }}
            />
            <Button onClick={handleSendMessage} disabled={loading || uploading} className="h-10 w-10 rounded-xl bg-primary">
                {uploading ? <Loader2 className='animate-spin'/> : <Send className="w-5 h-5" />}
            </Button>
        </div>
      </div>
    </div>
  )
}
