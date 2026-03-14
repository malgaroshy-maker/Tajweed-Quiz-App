import { AIChatManager } from '@/components/ai/ai-chat-manager'
import { Sparkles } from 'lucide-react'

export default function AIStandalonePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">المساعد الذكي</h1>
      </div>

      <AIChatManager />
    </div>
  )
}
