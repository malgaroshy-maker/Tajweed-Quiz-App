'use client'

import { useState } from 'react'
import { AIChatSidebar } from './ai-chat-sidebar'
import { AIChatWindow } from './ai-chat-window' // I will rename the old one
import { useSearchParams } from 'next/navigation'

export function AIChatManager() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || undefined
  const [key, setKey] = useState(0) // Used to force-rerender the chat window on session change

  const handleNewChat = () => {
    // Logic to start new chat
    window.location.href = '/teacher/ai'
  }

  return (
    <div className="flex flex-1 gap-6 h-full overflow-hidden">
      <AIChatSidebar currentSessionId={sessionId} onNewChat={handleNewChat} />
      <div className="flex-1 overflow-hidden">
        <AIChatWindow key={key + (sessionId || 'new')} sessionId={sessionId} />
      </div>
    </div>
  )
}
