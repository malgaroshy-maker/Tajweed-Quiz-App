'use client'

import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Loader2, Trash2, Edit2, Check, X } from 'lucide-react'
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

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    setLoading(true)
    const { data } = await supabase
      .from('ai_chat_sessions')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
    if (data) setSessions(data)
    setLoading(false)
  }

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
    <div className="w-64 bg-white/50 dark:bg-slate-900/50 border-r border-primary/10 p-4 space-y-4 h-full flex flex-col">
      <Button onClick={onNewChat} className="w-full justify-start gap-2 font-black rounded-xl bg-primary text-white h-12 shadow-lg">
        <Plus className="w-5 h-5" />
        محادثة جديدة
      </Button>
      
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          sessions.map(s => (
            <div key={s.id} className={`group flex items-center gap-1 p-2 rounded-lg ${currentSessionId === s.id ? 'bg-primary/10' : 'hover:bg-primary/5'}`}>
              {editingId === s.id ? (
                <div className="flex w-full items-center gap-1">
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8 text-sm" />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => renameSession(s.id, editTitle)}><Check className="w-4 h-4 text-green-600"/></Button>
                </div>
              ) : (
                <>
                    <Button
                        variant="ghost"
                        className="flex-1 justify-start gap-3 text-right overflow-hidden h-10 px-2 text-slate-800 dark:text-slate-200"
                        onClick={() => router.push(`/teacher/ai?session=${s.id}`)}
                    >
                        <MessageSquare className="w-4 h-4 shrink-0 text-primary" />
                        <span className="truncate text-sm font-bold">{s.title || 'محادثة بدون عنوان'}</span>
                    </Button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(s.id); setEditTitle(s.title) }}><Edit2 className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={(e) => deleteSession(s.id, e)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
