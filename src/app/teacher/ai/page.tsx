import { AIChat } from '@/components/ai-chat'
import { Sparkles } from 'lucide-react'

export default function AIStandalonePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      <div className="flex flex-col items-center text-center space-y-6 mb-12">
        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 animate-pulse group-hover:scale-150 transition-transform" />
          <Sparkles className="w-12 h-12 text-primary relative z-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900">المساعد الذكي</h1>
          <p className="text-xl text-primary font-bold uppercase tracking-[0.3em] opacity-60">Al-Qalam Intelligence</p>
        </div>
        <p className="text-lg text-slate-600 max-w-2xl leading-relaxed font-medium">
          مرحباً بكِ في المركز العصبي لـ "القلم". هنا يمكنكِ استخراج أسئلة من ملفات الـ PDF، تحويل النصوص إلى اختبارات، أو الحصول على استشارات تجويدية فورية.
        </p>
      </div>

      <AIChat />
    </div>
  )
}
