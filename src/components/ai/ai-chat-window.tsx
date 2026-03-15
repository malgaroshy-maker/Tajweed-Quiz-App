'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, User, Send, Loader2, FileUp, FileText, X, Save, Plus } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

interface Question {
    text: string;
    type: string;
    options: { text: string; is_correct: boolean }[];
    explanation: string;
    topic: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    questions?: Question[];
}

export function AIChatWindow({ sessionId }: { sessionId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'السلام عليكم! أنا مساعدكِ الذكي لعلوم التجويد والقرآن.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    async function loadMessages() {
      if (!currentSessionId) return
      const { data } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true })
      
      if (data && data.length > 0) {
        setMessages(data.map((m: { role: string; content: string }) => {
            let content = m.content
            let questions: Question[] = []
            const qMatch = content.match(/<questions>([\s\S]*?)<\/questions>/)
            if (qMatch) {
                try {
                    questions = JSON.parse(qMatch[1])
                    content = content.replace(qMatch[0], "").trim()
                } catch (e) {
                    console.error("Failed to parse questions", e)
                }
            }
            return { role: m.role as 'user' | 'assistant', content, questions }
        }))
      }
    }
    loadMessages()
  }, [currentSessionId, supabase])

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

  const saveToBank = async (q: Question) => {
    try {
      const res = await fetch('/api/ai/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      if (res.ok) {
        alert('تم حفظ السؤال بنجاح في بنك الأسئلة')
      }
    } catch {
      alert('فشل حفظ السؤال')
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return

    let activeSessionId = currentSessionId
    if (!activeSessionId) {
        const { data: { user } } = await supabase.auth.getUser()
        const titleText = input ? input.slice(0, 30) + "..." : (selectedFile ? `ملف: ${selectedFile.name}` : "محادثة جديدة")
        const { data: session } = await supabase.from('ai_chat_sessions').insert({ 
            teacher_id: user?.id, 
            title: titleText 
        }).select().single()
        
        if (session) {
            activeSessionId = session.id
            setCurrentSessionId(activeSessionId)
        }
    }
    
    // Convert file to base64 if it exists
    let fileData = null
    if (selectedFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the data:application/pdf;base64, prefix
                const base64Data = result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = error => reject(error);
        });

        fileData = {
            name: selectedFile.name,
            type: selectedFile.type,
            data: base64
        }
    }

    // Add file name to message content if there's a file
    const displayMsg = selectedFile ? `[مرفق ملف: ${selectedFile.name}]\n${input}`.trim() : input.trim()
    
    const userMsg: ChatMessage = { role: 'user', content: displayMsg }
    
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    if (activeSessionId) {
      await supabase.from('ai_chat_messages').insert({ session_id: activeSessionId, role: 'user', content: displayMsg })
    }

    // Keep the actual request input clean
    const requestMessages = [...messages, userMsg]

    try {
        const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: requestMessages, file: fileData }),
        })
        const data = await res.json()
        
        if (!res.ok) {
           throw new Error(data.error || 'حدث خطأ غير معروف')
        }

        let content = data.message
        let questions: Question[] = []
        const qMatch = content.match(/<questions>([\s\S]*?)<\/questions>/)
        if (qMatch) {
            try {
                questions = JSON.parse(qMatch[1])
                content = content.replace(qMatch[0], "").trim()
            } catch (e) {
                console.error("Failed to parse questions", e)
            }
        }
        
        const assistantMsg: ChatMessage = { role: 'assistant', content, questions }
        setMessages(prev => [...prev, assistantMsg])
        
        if (activeSessionId) {
          await supabase.from('ai_chat_messages').insert({ session_id: activeSessionId, role: 'assistant', content: data.message })
          
          if (messages.length === 1) { 
              await fetch('/api/ai/generate-title', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId: activeSessionId, firstMessage: displayMsg }),
              })
          }
        }
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
        alert(errorMessage)
    } finally {
        setLoading(false)
        setSelectedFile(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#212121] overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b dark:border-white/5 bg-white dark:bg-[#212121] shrink-0">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/teacher/ai?new=true'} className="text-slate-500"><Plus className="w-5 h-5"/></Button>
          <span className="font-black text-sm">المساعد الذكي</span>
          <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Chat Area (Flex 1) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Empty State / Welcome */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-col items-center justify-center p-6 text-center h-full">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <Bot className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">كيف يمكنني مساعدتكِ اليوم؟</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto">
                    أنا مساعدكِ الذكي لعلوم التجويد والقرآن. يمكنكِ رفع ملفات PDF أو الصور لاستخراج الأسئلة منها.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-2xl px-4">
                    {[
                        "استخرجي 5 أسئلة من هذا الملف",
                        "اشرحي لي أحكام النون الساكنة",
                        "ولدي لي اختبار عن الإدغام",
                        "راجعي هذه الصورة واستخرجي منها سؤالاً"
                    ].map((hint, i) => (
                        <button 
                            key={i} 
                            onClick={() => setInput(hint)}
                            className="p-4 bg-white dark:bg-[#2f2f2f] border border-slate-200 dark:border-white/10 rounded-2xl text-right text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-premium shadow-sm"
                        >
                            {hint}
                        </button>
                    ))}
                </div>
            </div>
          )}
        
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 space-y-8">
            {messages.map((m, i) => (
            <div key={i} className={`flex gap-5 group ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg mt-1">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                )}
                
                <div className={`flex flex-col gap-3 ${m.role === 'user' ? 'max-w-[85%]' : 'max-w-full flex-1'}`}>
                    <div className={`text-lg leading-[1.8] transition-premium ${
                        m.role === 'user' 
                        ? 'bg-slate-100 dark:bg-[#2f2f2f] text-slate-900 dark:text-white px-5 py-3 rounded-[2rem] shadow-sm' 
                        : 'text-slate-800 dark:text-slate-200 font-medium'
                    }`}>
                        <div className="whitespace-pre-wrap font-quran">{m.content}</div>
                    </div>

                    {m.questions && m.questions.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2">الأسئلة المقترحة:</p>
                            {m.questions.map((q: Question, qIdx: number) => (
                                <div key={qIdx} className='p-6 bg-white dark:bg-[#2f2f2f] rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 transition-premium hover:border-primary/40 group/q'>
                                    <div className="flex-1 text-right">
                                        <span className='font-black text-lg text-slate-900 dark:text-white leading-relaxed font-quran'>{q.text}</span>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-[9px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">{q.topic || 'عام'}</span>
                                            <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full uppercase">{q.type}</span>
                                        </div>
                                    </div>
                                    <Button size='lg' variant='outline' className="rounded-2xl font-black border-2 border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-premium shrink-0 h-12 shadow-sm" onClick={() => saveToBank(q)}>
                                        <Save className='w-5 h-5 ml-2'/> حفظ في البنك
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {m.role === 'user' && (
                    <div className="w-9 h-9 rounded-full bg-slate-800 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-md mt-1">
                        <User className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>
            ))}
            {loading && (
                <div className="flex gap-5">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 py-4">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-white dark:bg-[#212121] shrink-0 border-t dark:border-white/5">
        <div className="max-w-3xl mx-auto relative group">
            {selectedFile && (
                <div className="mb-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-100 dark:bg-[#2f2f2f] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-between gap-4 max-w-sm ml-auto">
                        <div className='flex items-center gap-3 overflow-hidden'>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-primary"/>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="rounded-full hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors h-8 w-8 shrink-0"><X className="w-4 h-4" /></Button>
                    </div>
                </div>
            )}
            
            <div className="bg-slate-100 dark:bg-[#2f2f2f] rounded-[2rem] border border-transparent focus-within:border-primary/20 dark:focus-within:border-white/20 transition-premium shadow-lg flex flex-col p-2 pr-4 pl-2">
                <Textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="اكتبي رسالة للقلم..." 
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none min-h-[56px] max-h-[200px] text-lg font-medium py-4 px-4 custom-scrollbar leading-relaxed text-slate-800 dark:text-white"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                        }
                    }}
                />
                
                <div className="flex items-center justify-between pb-1 px-2">
                    <div className="flex items-center gap-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*" className="hidden" />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-full hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-premium" 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={loading}
                        >
                            <FileUp className="w-5 h-5" />
                        </Button>
                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-white/10 mx-1" />
                    </div>
                    
                    <Button 
                        onClick={handleSendMessage} 
                        disabled={loading || (!input.trim() && !selectedFile)} 
                        className={`h-10 w-10 rounded-full transition-premium shadow-md ${
                            (input.trim() || selectedFile) && !loading
                            ? 'bg-primary text-white scale-110 shadow-primary/20' 
                            : 'bg-slate-300 dark:bg-white/10 text-white dark:text-slate-500'
                        }`}
                    >
                        {loading ? <Loader2 className='animate-spin h-4 w-4'/> : <Send className="w-4 h-4" /> }
                    </Button>
                </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-bold">قد يقدم القلم إجابات غير دقيقة، يرجى التحقق من المعلومات المهمة.</p>
        </div>
      </div>
    </div>
  )
}
