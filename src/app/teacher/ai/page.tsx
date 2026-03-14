import { AIAssistantWrapper } from '@/components/ai-assistant-wrapper'
import { BrainCircuit } from 'lucide-react'

export default function AIStandalonePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-full">
          <BrainCircuit className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">المساعد الذكي لعلوم القرآن</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          أداة متقدمة مصممة خصيصاً لمعلمي القرآن الكريم لتوليد أسئلة دقيقة وشاملة في أحكام التجويد والتلاوة، أو للدردشة المباشرة حول الأحكام.
        </p>
      </div>

      <AIAssistantWrapper quizId="bank" />
    </div>
  )
}
