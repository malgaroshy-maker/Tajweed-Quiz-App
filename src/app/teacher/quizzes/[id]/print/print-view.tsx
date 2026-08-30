'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, CheckSquare, Sparkles, BookOpen, Clock } from 'lucide-react'
import { getTajweedRuleById } from '@/lib/tajweed-rules'

interface PrintExamViewProps {
  quiz: {
    id: string
    title: string
    description?: string | null
    time_limit_minutes?: number | null
    created_at: string
  }
  questions: any[]
  teacherName: string
  halaqahName: string
}

export function PrintExamView({
  quiz,
  questions,
  teacherName,
  halaqahName
}: PrintExamViewProps) {
  const [showAnswerKey, setShowAnswerKey] = useState(false)

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showAnswerKey ? "default" : "outline"}
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="rounded-xl font-bold gap-2 text-xs h-10"
          >
            <CheckSquare className="w-4 h-4" />
            {showAnswerKey ? "إخفاء نموذج الإجابة" : "عرض نموذج الإجابة (Answer Key)"}
          </Button>
        </div>

        <Button
          type="button"
          onClick={handlePrint}
          className="rounded-xl font-black bg-primary text-primary-foreground gap-2 h-10 px-6 shadow-md"
        >
          <Printer className="w-4 h-4" />
          طباعة الورقة / حفظ PDF
        </Button>
      </div>

      {/* Main Printable Exam Sheet (A4 High Resolution) */}
      <div className="bg-white text-slate-950 p-8 sm:p-12 rounded-[2rem] border-2 border-[#d4c3a3] shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none space-y-8">
        {/* Calligraphy Bismillah Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
          <div className="text-2xl font-quran font-bold text-slate-800">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-2 pt-2">
            <span>منصة القلم للتعليم القرآني والتجويد</span>
            <span>الحلقة: {halaqahName}</span>
            <span>المعلم: {teacherName}</span>
          </div>
        </div>

        {/* Exam Title & Student Metadata Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-quran text-slate-900">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-xs text-slate-600 mt-1">{quiz.description}</p>
              )}
            </div>

            {quiz.time_limit_minutes && (
              <div className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 shrink-0">
                الزمن المخصص: {quiz.time_limit_minutes} دقيقة
              </div>
            )}
          </div>

          {/* Student Info Filling Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-400 bg-slate-50/60 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">اسم الطالب:</span>
              <div className="flex-1 border-b-2 border-dotted border-slate-400 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">التاريخ:</span>
              <div className="flex-1 border-b-2 border-dotted border-slate-400 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">الدرجة النهائية:</span>
              <div className="flex-1 border-b-2 border-dotted border-slate-400 h-5 text-center font-mono font-bold">
                / {questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Body */}
        <div className="space-y-8 pt-2">
          {questions.map((q, idx) => {
            const tajweedMeta = q.tajweed_rule ? getTajweedRuleById(q.tajweed_rule) : null

            return (
              <div key={q.id} className="space-y-3 pb-6 border-b border-slate-200 last:border-b-0">
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-lg font-bold font-quran leading-relaxed text-slate-900">
                        {q.text}
                      </p>
                      {q.surah_number && q.ayah_number && (
                        <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                          [سورة رقم {q.surah_number} - آية {q.ayah_number}]
                        </span>
                      )}
                    </div>
                  </div>

                  {tajweedMeta && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded border border-slate-400 text-slate-700 shrink-0">
                      {tajweedMeta.nameAr}
                    </span>
                  )}
                </div>

                {/* Question Formats */}
                {/* MCQ / True-False / Audio MCQ */}
                {(q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'audio_mcq' || q.type === 'tajweed_rule') && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-10 pt-1">
                    {q.options.map((opt: any, optIdx: number) => {
                      const bubbleLetter = ['أ', 'ب', 'ج', 'د'][optIdx] || (optIdx + 1)
                      const isCorrect = opt.is_correct && showAnswerKey

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm font-quran ${isCorrect ? 'bg-emerald-100 border-emerald-600 font-bold text-emerald-950' : 'border-slate-300 bg-white'}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 ${isCorrect ? 'bg-emerald-600 text-white' : ''}`}>
                            {bubbleLetter}
                          </div>
                          <span className="flex-1">{opt.text}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Fill in Blank */}
                {q.type === 'fill_in_blank' && (
                  <div className="pr-10 pt-2 space-y-2">
                    <div className="w-full h-10 border-b-2 border-slate-400 bg-slate-50/50 flex items-center px-4 text-xs font-bold text-slate-500">
                      مكان كتابة إجابة الطالب ..........................................................................................
                    </div>
                    {showAnswerKey && q.options?.[0] && (
                      <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-300">
                        الإجابة النموذجية: {q.options[0].text}
                      </div>
                    )}
                  </div>
                )}

                {/* Voice / Oral Recitation */}
                {q.type === 'voice_recitation' && (
                  <div className="pr-10 pt-2">
                    <div className="p-3 rounded-lg border border-slate-400 bg-slate-50 text-xs flex items-center justify-between">
                      <span className="font-bold text-slate-700">تقييم التلاوة الشفوية / المشافهة:</span>
                      <div className="flex gap-4 font-bold">
                        <span>[ ] متقن (درجة كاملة)</span>
                        <span>[ ] يحتاج مراجعة (0)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Answer Key Explanation if enabled */}
                {showAnswerKey && q.explanation && (
                  <div className="pr-10 pt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-300 italic">
                    <span className="font-bold text-slate-800">توجيه المعلم: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Exam Footer */}
        <div className="pt-8 border-t-2 border-slate-900 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>انتهت الأسئلة بحمد الله تعالى وتوفيقه</span>
          <span>توقيع المعلم: ..............................</span>
        </div>
      </div>
    </div>
  )
}
