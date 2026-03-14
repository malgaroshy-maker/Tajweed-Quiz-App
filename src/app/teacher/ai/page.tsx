import { AIChatManager } from '@/components/ai/ai-chat-manager'
import { Sparkles, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export default function AIStandalonePage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">المساعد الذكي</h1>
      </div>

      <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>}>
        <div className="flex-1 overflow-hidden">
          <AIChatManager />
        </div>
      </Suspense>
    </div>
  )
}
