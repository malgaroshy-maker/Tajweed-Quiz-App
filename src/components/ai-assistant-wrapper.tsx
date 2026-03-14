'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIAssistant } from '@/components/ai-assistant'
import { AIChat } from '@/components/ai-chat'
import { BookOpen, MessageCircle } from 'lucide-react'

export function AIAssistantWrapper({ quizId }: { quizId: string }) {
  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generate" className="gap-2">
          <BookOpen className="w-4 h-4" />
          توليد الأسئلة
        </TabsTrigger>
        <TabsTrigger value="chat" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          محادثة AI
        </TabsTrigger>
      </TabsList>
      <TabsContent value="generate">
        <AIAssistant quizId={quizId} />
      </TabsContent>
      <TabsContent value="chat">
        <AIChat />
      </TabsContent>
    </Tabs>
  )
}
