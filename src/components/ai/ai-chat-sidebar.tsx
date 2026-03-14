'use client'

import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function AIChatSidebar({ currentSessionId, onNewChat }: { currentSessionId?: string, onNewChat: () => void }) {
  const [sessions, setSessions] = useState<{ id: string, title: string, created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setSessions(data)
      setLoading(false)
    }
    fetchSessions()
  }, [])

  return (
    <div className="w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4">
      <Button onClick={onNewChat} className="w-full justify-start gap-2 font-black rounded-xl">
        <Plus className="w-5 h-5" />
        محادثة جديدة
      </Button>
      
      <div className="space-y-1">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          sessions.map(s => (
            <Button
              key={s.id}
              variant={currentSessionId === s.id ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 text-right overflow-hidden"
              onClick={() => router.push(`/teacher/ai?session=${s.id}`)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">{s.title || 'محادثة بدون عنوان'}</span>
            </Button>
          ))
        )}
      </div>
    </div>
  )
}
