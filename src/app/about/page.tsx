import { Card, CardContent } from "@/components/ui/card"
import { Heart, Code, ArrowRight, BookOpen, Sparkles, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans" dir="rtl">
      {/* Immersive Background Particles */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-primary blur-[150px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-32">
        {/* Navigation / Header */}
        <header className="flex justify-between items-center bg-white/40 dark:bg-black/20 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-sm sticky top-6 transition-premium">
          <div className="flex items-center gap-4 pr-2">
            <Logo className="w-10 h-10 text-primary drop-shadow-sm" />
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">تـرتيـل</span>
          </div>
          <Button variant="ghost" asChild className="gap-3 text-primary font-black hover:bg-primary/10 rounded-2xl h-12 px-6">
            <Link href="/">
              <ArrowRight className="w-5 h-5" />
              العودة للرئيسية
            </Link>
          </Button>
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4 animate-pulse" />
            إتقان وجمال في تلاوة القرآن
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
            ارتقِ بتعليمك <br/> 
            <span className="text-primary italic">بأحدث التقنيات</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-3xl mx-auto leading-relaxed">
            منصة ترتيل هي جسر يربط بين عراقة علوم التجويد وبين ذكاء التكنولوجيا الحديثة، لتوفير تجربة تعليمية فريدة وممتعة.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: BookOpen, title: "بنك شامل", desc: "إدارة آلاف الأسئلة في أحكام التجويد بمختلف أنواعها." },
                { icon: Sparkles, title: "ذكاء اصطناعي", desc: "استخراج ذكي للأسئلة من الصور والملفات في ثوانٍ." },
                { icon: Award, title: "لوحات صدارة", desc: "تحفيز الطلاب من خلال التنافس والتميز المعرفي." }
            ].map((feature, i) => (
                <Card key={i} className="parchment-card border-none shadow-xl rounded-[2.5rem] p-8 transition-premium hover:scale-[1.05] hover:shadow-primary/5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                        <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{feature.desc}</p>
                </Card>
            ))}
        </section>

        {/* The Story / Dedication */}
        <section className="relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[4rem] -rotate-1 scale-[1.02] transition-transform group-hover:rotate-0" />
            <Card className="parchment-card border-none shadow-2xl rounded-[4rem] overflow-hidden relative">
                <CardContent className="p-12 md:p-24 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 text-right">
                        <div className="space-y-4">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-xs opacity-50">الإهداء والقصة</span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">إهداء مبارك..</h2>
                        </div>
                        <p className="text-2xl md:text-3xl leading-[1.6] text-slate-800 dark:text-slate-200 font-bold font-quran italic">
                            &ldquo;تم تصميم هذا التطبيق كإهداء ومساندة لأمي الغالية <span className="text-primary font-black underline decoration-primary/20 underline-offset-8">الشيخة سناء أبو العيد</span> – حفظها الله وبارك في علمها – لتيسير إنشاء الاختبارات التعليمية التي تعين الطلاب على ضبط علوم القرآن الكريم وأحكام التجويد بأسلوب عصري ومنظم.&rdquo;
                        </p>
                        <div className="flex items-center gap-6 pt-6 opacity-60">
                            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/30" />
                            <Users className="w-8 h-8 text-primary" />
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/30" />
                        </div>
                    </div>
                    <div className="w-64 h-64 md:w-80 md:h-80 bg-primary rounded-[3rem] rotate-3 flex items-center justify-center shadow-3xl overflow-hidden group-hover:rotate-0 transition-premium shrink-0 border-8 border-white/20">
                        <Logo className="w-40 h-40 text-white" />
                    </div>
                </CardContent>
            </Card>
        </section>

        {/* Engineering Credit */}
        <footer className="text-center space-y-8 pt-10">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 bg-primary/5 px-6 py-2 rounded-full border border-primary/10">
              <Code className="w-4 h-4" />
              هندسة وتطوير
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              مـحمد الجـروشي
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 pt-12 opacity-40 hover:opacity-100 transition-premium group">
            <div className="flex items-center gap-3 font-black text-sm tracking-widest text-primary">
                <span>صُنع بـكُل</span>
                <div className="relative">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover:scale-125 transition-premium" />
                    <div className="absolute inset-0 bg-red-400 blur-md rounded-full opacity-0 group-hover:opacity-40 transition-premium" />
                </div>
                <span>لخِـدمة أهـل القـرآن</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">© {new Date().getFullYear()} Tarteel Educational Platform</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
