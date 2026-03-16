'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, MessageSquare, Loader2, Trash2, Edit2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"

export function AIChatSidebar({ currentSessionId, onNewChat }: { currentSessionId?: string, onNewChat: () => void }) {
  const [sessions, setSessions] = useState<{ id: string, title: string, updated_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const fetchSessions = useCallback(async () => {
    const supabaseClient = createClient()
    const { data } = await supabaseClient
      .from('ai_chat_sessions')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
    if (data) setSessions(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchSessions();
      }
    }
    load();
    return () => { isMounted = false }
  }, [fetchSessions])

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('هل أنتِ متأكدة من حذف هذه المحادثة؟')) return
    await supabase.from('ai_chat_sessions').delete().eq('id', id)
    fetchSessions()
    if (currentSessionId === id) router.push('/teacher/ai')
  }

  const renameSession = async (id: string, newTitle: string) => {
    await supabase.from('ai_chat_sessions').update({ title: newTitle }).eq('id', id)
    setEditingId(null)
    fetchSessions()
  }

  return (
    <div className="w-64 bg-[#f8f8f5] dark:bg-[#1a1a0b] text-slate-900 dark:text-white h-full flex flex-col transition-all duration-300 shadow-2xl border-l border-primary/10 parchment-texture">
      <div className="p-4 flex flex-col gap-4 border-b border-primary/10">
        <Button 
          onClick={onNewChat} 
          className="w-full justify-between gap-2 font-black rounded-xl bg-primary hover:bg-primary/90 text-white h-12 shadow-md group transition-premium"
        >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shadow-inner transition-premium group-hover:scale-110">
                <Plus className="w-5 h-5" />
             </div>
             <span className="text-sm">محادثة جديدة</span>
          </div>
          <Edit2 className="w-4 h-4 opacity-70" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 space-y-4 custom-scrollbar pb-10">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-2 mt-4">المحادثات السابقة</p>
            {sessions.map(s => (
              <div key={s.id} className={`group flex items-center gap-1 px-3 rounded-xl transition-premium h-11 ${currentSessionId === s.id ? 'bg-primary/10 shadow-sm' : 'hover:bg-primary/5'}`}>
                {editingId === s.id ? (
                  <div className="flex w-full items-center gap-2">
                      <Input 
                          value={editTitle} 
                          onChange={(e) => setEditTitle(e.target.value)} 
                          className="h-8 text-xs bg-white border-primary/20 text-slate-900 focus:ring-primary" 
                          autoFocus
                          onKeyDown={(e) => {
                              if (e.key === 'Enter') renameSession(s.id, editTitle)
                              if (e.key === 'Escape') setEditingId(null)
                          }}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-green-500/20" onClick={() => renameSession(s.id, editTitle)}>
                          <Check className="w-4 h-4 text-green-600"/>
                      </Button>
                  </div>
                ) : (
                  <>
                      <Button
                          variant="ghost"
                          className="flex-1 justify-start gap-3 text-right overflow-hidden h-full px-0 hover:bg-transparent"
                          onClick={() => router.push(`/teacher/ai?session=${s.id}`)}
                      >
                          <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${currentSessionId === s.id ? 'text-primary' : 'text-slate-400 dark:text-white/40 group-hover:text-primary'}`} />
                          <span className={`truncate text-sm font-bold transition-colors ${currentSessionId === s.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                              {s.title || 'محادثة جديدة'}
                          </span>
                      </Button>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-premium translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => { setEditingId(s.id); setEditTitle(s.title) }}>
                          <Edit2 className="w-3.5 h-3.5"/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 text-slate-400 hover:text-red-600" onClick={(e) => deleteSession(s.id, e)}>
                          <Trash2 className="w-3.5 h-3.5"/>
                        </Button>
                      </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-primary/10 bg-white/50 dark:bg-[#1a1a0b]">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white cursor-pointer transition-premium border border-transparent hover:border-primary/10 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs shadow-md">
                  أ
              </div>
              <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">حساب المعلم</p>
                  <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-widest font-black">Free Plan</p>
              </div>
          </div>
      </div>
    </div>
  )
}
