'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIChatSidebar } from './ai-chat-sidebar'
import { AIChatWindow } from './ai-chat-window'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function AIChatManager() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || undefined
  const [activeTab, setActiveTab] = useState('chat')

  const handleNewChat = () => {
    window.location.href = '/teacher/ai'
  }

  return (
    <Tabs defaultValue="chat" className="h-full flex flex-col" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full justify-start rounded-none border-b border-primary/10 bg-transparent p-0 mb-4">
        <TabsTrigger value="chat" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
          المحادثة الحالية
        </TabsTrigger>
        <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
          سجل المحادثات
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="flex-1 overflow-hidden">
        <AIChatWindow sessionId={sessionId} />
      </TabsContent>

      <TabsContent value="history" className="flex-1 overflow-hidden">
        <AIChatSidebar currentSessionId={sessionId} onNewChat={handleNewChat} />
      </TabsContent>
    </Tabs>
  )
}
