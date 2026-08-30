'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Award, Printer, Sparkles, Download, CheckCircle2 } from 'lucide-react'

interface CertificateDialogProps {
  studentName: string
  quizTitle: string
  score: number
  totalQuestions: number
  completionDate: string
}

export function CertificateDialog({
  studentName,
  quizTitle,
  score,
  totalQuestions,
  completionDate
}: CertificateDialogProps) {
  const [open, setOpen] = useState(false)

  const percentage = Math.round((score / totalQuestions) * 100)
  const isHonor = percentage >= 90
  const formattedDate = new Date(completionDate).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const printCertificate = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-16 px-8 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all gap-3"
        >
          <Award className="w-6 h-6 text-yellow-100 animate-pulse" />
          <span>عرض شهادة الإتمام والتفوق 📜</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-2 sm:p-6 rounded-[2.5rem] bg-card border-2 border-amber-500/40">
        <DialogHeader className="p-2 sm:p-4 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            شهادة الإتقان والتميز التجويدي
          </DialogTitle>

          <Button
            type="button"
            onClick={printCertificate}
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            طباعة الشهادة / PDF
          </Button>
        </DialogHeader>

        {/* Certificate Canvas Area */}
        <div id="certificate-print-area" className="p-6 sm:p-12 m-2 rounded-[2rem] bg-[#fcf9f2] text-slate-900 border-8 border-double border-[#b8860b] shadow-2xl relative overflow-hidden space-y-8 select-none">
          {/* Islamic Corner Ornaments */}
          <div className="absolute top-2 right-2 w-16 h-16 border-t-4 border-r-4 border-amber-600 rounded-tr-2xl opacity-60" />
          <div className="absolute top-2 left-2 w-16 h-16 border-t-4 border-l-4 border-amber-600 rounded-tl-2xl opacity-60" />
          <div className="absolute bottom-2 right-2 w-16 h-16 border-b-4 border-r-4 border-amber-600 rounded-br-2xl opacity-60" />
          <div className="absolute bottom-2 left-2 w-16 h-16 border-b-4 border-l-4 border-amber-600 rounded-bl-2xl opacity-60" />

          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Award className="w-96 h-96 text-amber-900" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-3 relative">
            <div className="text-xl sm:text-2xl font-quran font-bold text-amber-900">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div className="w-16 h-1 bg-amber-600/40 rounded-full mx-auto" />
            <h2 className="text-3xl sm:text-4xl font-black font-quran text-amber-950 tracking-wide">
              شَهَادَةُ إِتْقَانٍ وَتَفَوُّقٍ
            </h2>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-800">
              Al-Qalam Tajweed Mastery Certificate
            </p>
          </div>

          {/* Certificate Text Body */}
          <div className="text-center space-y-6 relative max-w-2xl mx-auto py-2">
            <p className="text-base sm:text-lg font-bold text-slate-700 leading-relaxed font-quran">
              تَشْهَدُ مَنَصَّةُ الْقَلَمِ لِلتَّعْلِيمِ الْقُرْآنِيِّ وَعِلْمِ التَّجْوِيدِ بِأَنَّ الطَّالِبَ/ـةَ:
            </p>

            {/* Student Name */}
            <div className="text-3xl sm:text-5xl font-black font-quran text-primary py-2 px-6 border-b-2 border-dashed border-amber-600/60 inline-block">
              {studentName}
            </div>

            <p className="text-base sm:text-lg font-bold text-slate-700 leading-relaxed font-quran">
              قَدْ أَتَمَّ بِنَجَاحٍ وَاقْتِدَارٍ اخْتِبَارَ: <span className="font-black text-amber-950 underline decoration-amber-500/60 decoration-2">&ldquo;{quizTitle}&rdquo;</span>
              <br />
              وَحَصَلَ عَلَى تَقْدِيرِ: <span className="text-emerald-700 font-black font-quran text-xl">({isHonor ? 'ممتاز مع مرتبة الشرف' : 'متقن ومتميز'})</span> بِنِسْبَةِ: <span className="font-mono font-black text-2xl text-primary">{percentage}%</span>
            </p>
          </div>

          {/* Certificate Footer with Seal */}
          <div className="pt-6 border-t border-amber-300/80 flex flex-wrap items-end justify-between gap-6 relative">
            <div className="text-xs font-bold text-slate-600 space-y-1">
              <div>تاريخ الإصدار: <span className="font-semibold text-slate-800">{formattedDate}</span></div>
              <div>الرقم المرجعي: <span className="font-mono text-slate-500">CERT-{score}{totalQuestions}-{Date.now().toString().slice(-6)}</span></div>
            </div>

            {/* Official Gold Seal Stamp */}
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-amber-600/80 bg-amber-500/10 flex flex-col items-center justify-center text-center p-2 shadow-inner">
              <Award className="w-6 h-6 text-amber-700" />
              <span className="text-[9px] font-black text-amber-900 uppercase tracking-tighter mt-1">مُعْتَمَدٌ مِنَ</span>
              <span className="text-[10px] font-black font-quran text-primary">الْقَلَمِ</span>
            </div>

            <div className="text-xs font-bold text-slate-600 text-left space-y-1">
              <div>لجنة الإشراف والتزكية:</div>
              <div className="text-sm font-quran font-bold text-primary">مقرأة القلم للتجويد والإتقان</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
