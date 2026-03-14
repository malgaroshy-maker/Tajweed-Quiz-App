'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, PlusCircle, ListTodo } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ImportFromBankDialog } from './import-bank-dialog'
import { QuestionEditor } from '@/components/question-editor'
import { AIAssistantWrapper } from '@/components/ai-assistant-wrapper'

export function QuizTabs({ quizId, questions, children }: { quizId: string, questions: any[], children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('questions')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-muted/50 rounded-2xl mb-8">
        <TabsTrigger value="questions" className="rounded-xl font-bold gap-2 text-xs sm:text-sm">
          <ListTodo className="w-4 h-4" />
          <span className="hidden sm:inline">الأسئلة</span> ({questions?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="add" className="rounded-xl font-bold gap-2 text-xs sm:text-sm">
          <PlusCircle className="w-4 h-4" />
          إضافة
        </TabsTrigger>
        <TabsTrigger value="ai" className="rounded-xl font-bold gap-2 text-xs sm:text-sm">
          <Sparkles className="w-4 h-4" />
          المساعد
        </TabsTrigger>
      </TabsList>

      <TabsContent value="questions" className="space-y-4 outline-none">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black">الأسئلة الحالية</h2>
          <ImportFromBankDialog quizId={quizId} />
        </div>
        
        {questions?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-muted flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
              <ListTodo className="w-8 h-8 opacity-20" />
            </div>
            <p className="font-bold">لا توجد أسئلة بعد</p>
            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setActiveTab('add')}>
              ابدأ بإضافة سؤالك الأول
            </Button>
          </div>
        ) : (
          children
        )}
      </TabsContent>

      <TabsContent value="add" className="outline-none">
        <QuestionEditor quizId={quizId} />
      </TabsContent>

      <TabsContent value="ai" className="outline-none">
        <div className="max-w-2xl mx-auto">
          <AIAssistantWrapper quizId={quizId} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
