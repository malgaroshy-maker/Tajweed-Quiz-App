import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Heart, Code, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen parchment-texture bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden" dir="rtl">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-8 right-8 z-10">
        <Button variant="ghost" asChild className="gap-3 text-primary font-black hover:bg-primary/10 rounded-2xl h-12 px-6 transition-premium border border-primary/5 bg-white/50 backdrop-blur-sm shadow-sm">
          <Link href="/">
            <ArrowRight className="w-5 h-5" />
            العودة للرئيسية
          </Link>
        </Button>
      </div>

      <div className="max-w-3xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
        
        {/* Decorative Header Icon */}
        <div className="flex justify-center">
          <div className="w-28 h-28 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden group rotate-3 transition-premium hover:rotate-0">
            <div className="absolute inset-0 bg-white/10 group-hover:scale-150 transition-transform duration-700" />
            <BookOpen className="w-14 h-14 text-white relative z-10" />
          </div>
        </div>

        <Card className="parchment-card border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[3.5rem] overflow-hidden transition-premium hover:scale-[1.01]">
          <CardContent className="p-10 md:p-16 text-center space-y-10">
            <div className="space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-xs opacity-50">قصة المشروع</span>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">عن مَنصة القَلَم</h1>
            </div>
            
            <div className="space-y-8">
              <p className="text-2xl md:text-3xl leading-[1.6] text-slate-800 dark:text-slate-200 font-bold font-quran">
                تم تصميم هذا التطبيق كإهداء ومساندة لأمي الغالية <span className="text-primary font-black underline decoration-primary/20 underline-offset-8">الشيخة سناء أبو العيد</span> – حفظها الله وبارك في علمها – لتيسير إنشاء الاختبارات التعليمية التي تعين الطلاب على ضبط علوم القرآن الكريم وأحكام التجويد بأسلوب عصري ومنظم.
              </p>
              
              <p className="text-xl md:text-2xl leading-relaxed text-slate-500 dark:text-slate-400 italic font-medium max-w-2xl mx-auto">
                &ldquo;نسأل الله الإخلاص والقبول، وأن يكون هذا العمل صدقة جارية ونوراً لكل من يسعى لتعلم كتاب الله وإتقانه.&rdquo;
              </p>
            </div>

            {/* Subtle Islamic Geometric Divider */}
            <div className="flex items-center justify-center gap-6 py-6">
              <div className="h-[3px] flex-1 bg-gradient-to-l from-transparent via-primary/30 to-transparent rounded-full" />
              <div className="relative">
                <div className="w-10 h-10 rotate-45 border-4 border-primary/20 flex items-center justify-center rounded-lg">
                  <div className="w-4 h-4 rotate-45 bg-primary/40 rounded-sm" />
                </div>
              </div>
              <div className="h-[3px] flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
            </div>

            <div className="pt-6 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 bg-primary/5 px-4 py-2 rounded-full">
                <Code className="w-4 h-4" />
                هندسة وتطوير
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                مـحمد الجـروشي
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Heart */}
        <div className="flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-premium group">
          <div className="flex items-center gap-3 font-black text-sm tracking-widest text-primary">
            <span>صُنع بـكُل</span>
            <div className="relative">
                <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover:scale-125 transition-premium" />
                <div className="absolute inset-0 bg-red-400 blur-md rounded-full opacity-0 group-hover:opacity-40 transition-premium" />
            </div>
            <span>لخِـدمة أهـل القـرآن</span>
          </div>
          <div className="w-12 h-1 bg-primary/20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
