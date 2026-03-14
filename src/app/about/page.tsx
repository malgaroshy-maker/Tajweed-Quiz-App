import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Heart, Code, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen parchment-texture bg-background flex flex-col items-center justify-center p-6 md:p-12 relative" dir="rtl">
      {/* Back Button */}
      <div className="absolute top-6 right-6">
        <Button variant="ghost" asChild className="gap-2 text-primary font-bold hover:bg-primary/10 rounded-xl">
          <Link href="/">
            <ArrowRight className="w-5 h-5" />
            العودة
          </Link>
        </Button>
      </div>
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Decorative Header Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 animate-pulse group-hover:scale-150 transition-transform" />
            <BookOpen className="w-10 h-10 text-primary relative z-10" />
          </div>
        </div>

        <Card className="border-2 border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardContent className="p-8 md:p-12 text-center space-y-8">
            <h1 className="text-4xl font-black text-primary tracking-tight">عن التطبيق</h1>
            
            <div className="space-y-6">
              <p className="text-xl md:text-2xl leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                تم تصميم هذا التطبيق لمساعدة أمي العزيزة <span className="text-primary font-black">الشيخة سناء</span> – حفظها الله وأطال في عمرها – في إنشاء اختبارات تعليمية تساعد الطالبات على فهم دروس القرآن الكريم وأحكام التجويد بطريقة سهلة ومنظمة.
              </p>
              
              <p className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-400 italic">
                نسأل الله أن يجعله عملاً نافعاً ومفيداً لكل طالبة تسعى لتعلم كتاب الله وإتقانه.
              </p>
            </div>

            {/* Subtle Islamic Geometric Divider */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/20" />
              <div className="relative">
                <div className="w-8 h-8 rotate-45 border-2 border-primary/30 flex items-center justify-center">
                  <div className="w-4 h-4 rotate-45 bg-primary/20" />
                </div>
              </div>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/20" />
            </div>

            <div className="pt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-xs mb-1">
                <Code className="w-4 h-4" />
                تطوير التطبيق
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                محمد الجروشي
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Heart */}
        <div className="flex items-center justify-center gap-2 text-primary/40 font-bold text-sm">
          <span>صنع بكل</span>
          <Heart className="w-4 h-4 fill-current text-red-500/50" />
          <span>للتعليم القرآني</span>
        </div>
      </div>
    </div>
  )
}
