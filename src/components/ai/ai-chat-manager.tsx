'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIChatSidebar } from './ai-chat-sidebar'
import { AIChatWindow } from './ai-chat-window'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { MessageSquare, History } from 'lucide-react'

export function AIChatManager() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || undefined
  const [activeTab, setActiveTab] = useState('chat')

  const handleNewChat = () => {
    window.location.href = '/teacher/ai?new=true'
  }

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col md:flex-row bg-white dark:bg-[#212121] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5">
      {/* Desktop Sidebar (Left in RTL, but we'll use standard flex order) */}
      <div className="hidden md:block h-full border-l border-slate-200 dark:border-white/5 order-last">
        <AIChatSidebar currentSessionId={sessionId} onNewChat={handleNewChat} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Tabs */}
        <div className="md:hidden border-b border-slate-200 dark:border-white/5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-12">
                    <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-primary/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
                        <MessageSquare className="w-4 h-4" />
                        المحادثة
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-primary/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
                        <History className="w-4 h-4" />
                        السجل
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'chat' ? (
                <AIChatWindow sessionId={sessionId} />
            ) : (
                <div className="md:hidden h-full">
                    <AIChatSidebar currentSessionId={sessionId} onNewChat={handleNewChat} />
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
