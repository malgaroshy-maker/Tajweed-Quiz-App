'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, User, Send, Loader2, Sparkles, Plus, Copy, Check, Save, FileUp, FileText, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function AIChatContent() {
  const searchParams = useSearchParams()
  const suggestFor = searchParams.get('suggest_quiz_for')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, questions?: any[] }[]>([
    { role: 'assistant', content: 'السلام عليكم! أنا مساعدك الذكي لعلوم التجويد والقرآن. يمكنك طرح أي سؤال، أو رفع ملف PDF، أو لصق نص من كتاب وسأساعدك في استخراج أسئلة اختبار منه مباشرة.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const initialTriggerRef = useRef(false)

  useEffect(() => {
    async function triggerInitialSuggestion() {
      if (suggestFor && !initialTriggerRef.current) {
        initialTriggerRef.current = true
        setLoading(true)
        
        const { data: q } = await supabase.from('questions').select('text').eq('id', suggestFor).single()
        if (q) {
          const userMsg = `أريد إنشاء 3 أسئلة مراجعة جديدة تركز على نفس الحكم التجويدي لهذا السؤال: "${q.text}"`
          setInput(userMsg)
          handleSendMessage(userMsg)
        } else {
          setLoading(false)
        }
      }
    }
    triggerInitialSuggestion()
  }, [suggestFor])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('يرجى رفع ملف PDF فقط')
        return
      }
      setSelectedFile(file)
    }
  }

  const parsePDF = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    setUploading(true)
    try {
      const res = await fetch('/api/ai/parse-pdf', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.text) {
        const textPreview = data.text.slice(0, 2000) + (data.text.length > 2000 ? "..." : "")
        setInput(prev => prev + "\n\n[محتوى ملف PDF]:\n" + textPreview)
      }
    } catch (e) {
      alert('فشل في قراءة ملف PDF')
    } finally {
      setUploading(false)
      setSelectedFile(null)
    }
  }

  const handleSendMessage = async (msgOverride?: string) => {
    const textToSend = msgOverride || input
    if (!textToSend.trim() && !selectedFile) return

    if (selectedFile) {
      await parsePDF(selectedFile)
      return 
    }

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }]
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
      
      let content = data.message
      let questions = data.questions || []
      
      if (!questions.length) {
        const jsonMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            questions = parsed.questions || []
            content = content.replace(jsonMatch[0], "").trim()
          } catch (e) {}
        }
      }
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: content || "إليك الأسئلة المقترحة:",
        questions: questions
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
    <div className="flex flex-col h-[750px] border-2 border-primary/20 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl relative">
      <div className="bg-primary p-6 text-primary-foreground flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl leading-none tracking-tight">المساعد الذكي</span>
            <span className="text-[10px] opacity-70 font-black uppercase tracking-[0.2em] mt-1.5">Al-Qalam Intelligence v2</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">Active</div>
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-[#f8f8f5] parchment-texture scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'animate-in fade-in slide-in-from-right-4 duration-500'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-110 ${
              m.role === 'assistant' 
                ? 'bg-primary text-white border-2 border-white/20' 
                : 'bg-white border-2 border-primary/20 text-primary'
            }`}>
              {m.role === 'assistant' ? <Bot className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>
            <div className={`flex flex-col gap-4 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-6 rounded-[2rem] leading-relaxed shadow-xl text-lg font-medium transition-all ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none border-b-4 border-primary/20' 
                  : 'bg-white border-2 border-primary/10 text-slate-900 rounded-tl-none ring-1 ring-primary/5'
              }`}>
                {m.content}
              </div>
              
              {m.questions && m.questions.length > 0 && (
                <div className="grid gap-5 mt-2 w-full animate-in zoom-in-95 duration-500 delay-200">
                  {m.questions.map((q: any, idx: number) => (
                    <Card key={idx} className="bg-white/90 backdrop-blur-md border-2 border-primary/10 hover:border-primary/40 transition-all rounded-[2rem] overflow-hidden shadow-2xl group">
                      <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            سؤال مقترح الذكي
                          </div>
                          <span className="text-[10px] bg-muted px-2 py-1 rounded font-bold text-muted-foreground uppercase">{q.type}</span>
                        </div>
                        <p className="font-black text-xl text-slate-900 leading-relaxed font-quran bg-primary/5 p-4 rounded-2xl border border-primary/5">{q.text}</p>
                        <Button 
                          size="lg" 
                          variant="default" 
                          className="w-full gap-3 h-14 text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" 
                          onClick={() => saveToBank(q)}
                        >
                          <Save className="w-5 h-5" />
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
          <div className="flex gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center animate-pulse shadow-lg">
              <Bot className="w-7 h-7" />
            </div>
            <div className="bg-white border-2 border-primary/10 p-6 rounded-[2rem] rounded-tl-none shadow-xl flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-base font-black text-slate-500 animate-pulse uppercase tracking-[0.2em]">جاري التحليل...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-8 border-t-2 border-primary/10 bg-white space-y-5 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] z-10">
        {selectedFile && (
          <div className="flex items-center justify-between p-4 bg-primary/5 border-2 border-primary/20 rounded-3xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 truncate max-w-[250px]">{selectedFile.name}</span>
                <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">جاهز لاستخراج البيانات</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="relative group">
            <Textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="اكتبي سؤالاً، أو ارفعي ملف PDF للتحليل..." 
              className="min-h-[140px] p-6 pb-16 resize-none border-2 border-muted hover:border-primary/40 focus-visible:border-primary rounded-[2.5rem] text-slate-900 font-bold text-lg bg-[#fcfcfc] shadow-inner transition-all placeholder:text-slate-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <div className="absolute bottom-5 right-8 flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="application/pdf" 
                className="hidden" 
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-12 w-12 rounded-2xl hover:bg-primary/10 text-primary transition-all shadow-sm border border-primary/5"
                title="رفع ملف PDF"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={() => handleSendMessage()} 
            disabled={loading || uploading || (!input.trim() && !selectedFile)}
            className="w-full h-16 rounded-[2rem] font-black text-xl gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {selectedFile ? (
              <><Sparkles className="w-7 h-7 animate-pulse" /> استخراج النصوص وتحليلها</>
            ) : loading ? (
              <><Loader2 className="w-7 h-7 animate-spin" /> جاري التفكير بعمق...</>
            ) : (
              <><Send className="w-7 h-7 -rotate-90 ml-1" /> إرسال للمساعد</>
            )}
          </Button>
        </div>
        <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-[0.3em] px-4 opacity-50">
          Neural Architecture for Tajweed Excellence
        </p>
      </div>
    </div>
  )
}

export function AIChat() {
  return (
    <Suspense fallback={<div className="h-[750px] flex items-center justify-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-muted">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>}>
      <AIChatContent />
    </Suspense>
  )
}
