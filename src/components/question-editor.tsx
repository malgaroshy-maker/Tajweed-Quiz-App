'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addQuestion } from '@/app/teacher/quizzes/[id]/question-actions'
import { ImageIcon, X, Eye, Edit3, Sparkles, Check, Database, Volume2, Mic, Music } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import imageCompression from 'browser-image-compression'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SURAH_LIST, RECITERS, getEveryAyahAudioUrl, getSurahByNumber } from '@/lib/quran-audio'
import { TAJWEED_RULES, getTajweedRuleById } from '@/lib/tajweed-rules'
import { QuranAudioPlayer } from '@/components/quran-audio-player'

export function QuestionEditor({ quizId }: { quizId: string }) {
  const [type, setType] = useState('multiple_choice')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctOption, setCorrectOption] = useState<string | null>(null)
  const [explanation, setExplanation] = useState('')
  
  // Audio & Tajweed Metadata State
  const [enableAudio, setEnableAudio] = useState(false)
  const [selectedSurah, setSelectedSurah] = useState<number>(1)
  const [selectedAyah, setSelectedAyah] = useState<number>(1)
  const [selectedReciter, setSelectedReciter] = useState<string>('husary_murattal')
  const [selectedTajweedRule, setSelectedTajweedRule] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeAudioUrl = enableAudio ? getEveryAyahAudioUrl(selectedSurah, selectedAyah, selectedReciter) : null
  const currentSurahMeta = getSurahByNumber(selectedSurah)
  const currentTajweedMeta = selectedTajweedRule ? getTajweedRuleById(selectedTajweedRule) : null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    // Upload image client-side to avoid 413 error
    const file = fileInputRef.current?.files?.[0]
    let imageUrl = null
    
    if (file && file.size > 0) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Compress image before upload
        const compressOptions = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        }
        const compressedFile = await imageCompression(file, compressOptions)

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('quiz-images')
          .upload(filePath, compressedFile)
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('quiz-images')
            .getPublicUrl(filePath)
          imageUrl = publicUrl
        }
      }
    }
    
    if (imageUrl) {
      formData.append('image_url', imageUrl)
    }
    formData.delete('image')

    // Append audio and tajweed metadata
    if (enableAudio && activeAudioUrl) {
      formData.append('audio_url', activeAudioUrl)
      formData.append('surah_number', selectedSurah.toString())
      formData.append('ayah_number', selectedAyah.toString())
      formData.append('reciter_id', selectedReciter)
    }

    if (selectedTajweedRule) {
      formData.append('tajweed_rule', selectedTajweedRule)
    }

    formData.append('type', type)
    const result = await addQuestion(quizId, formData)
    setLoading(false)
    
    if (result.success) {
      setImagePreview(null)
      setQuestionText('')
      setOptions(['', '', '', ''])
      setCorrectOption(null)
      setExplanation('')
      setEnableAudio(false)
      setSelectedTajweedRule('')
      const form = document.getElementById('add-question-form') as HTMLFormElement
      form.reset()
    } else {
      alert(result.error || 'حدث خطأ أثناء حفظ السؤال')
    }
  }

  const editorForm = (
    <form id="add-question-form" action={handleSubmit} className="space-y-8">
      {/* Question Type & Difficulty */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-primary">نوع السؤال التجويدي</label>
          <Select value={type} onValueChange={(v) => { if (v) { setType(v); if (v === 'audio_mcq') setEnableAudio(true); } }}>
            <SelectTrigger className="w-full h-12 rounded-xl border-primary/20 bg-white/80 dark:bg-card">
              <SelectValue placeholder="اختر نوع السؤال" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">اختيار من متعدد (MCQ)</SelectItem>
              <SelectItem value="true_false">صح أو خطأ</SelectItem>
              <SelectItem value="fill_in_blank">إكمال الفراغ</SelectItem>
              <SelectItem value="audio_mcq">سؤال استماع للتلاوة واختيار الحكم 🎧</SelectItem>
              <SelectItem value="voice_recitation">سؤال تسجيل تلاوة صوتية للطالب 🎙️</SelectItem>
              <SelectItem value="tajweed_rule">تحديد واستخراج الحكم التجويدي 📜</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-primary">مستوى الصعوبة</label>
          <Select name="difficulty" defaultValue="medium">
            <SelectTrigger className="w-full h-12 rounded-xl border-primary/20 bg-white/80 dark:bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">مبتدئ (سهل)</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="hard">متقدم (دقيق)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Quran Audio Recitation Picker */}
      <section className="rounded-2xl p-5 border-2 border-[#d4c3a3]/70 bg-primary/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Volume2 className="w-5 h-5" />
            <span>إرفاق تلاوة قرآنية رسمية (EveryAyah)</span>
          </div>
          <Button
            type="button"
            variant={enableAudio ? "default" : "outline"}
            size="sm"
            onClick={() => setEnableAudio(!enableAudio)}
            className="rounded-xl h-8 text-xs font-bold"
          >
            {enableAudio ? "مفعّل" : "+ تفعيل التلاوة"}
          </Button>
        </div>

        {enableAudio && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">السورة</label>
              <Select
                value={selectedSurah.toString()}
                onValueChange={(val) => {
                  if (val) {
                    const num = parseInt(val)
                    setSelectedSurah(num)
                    setSelectedAyah(1)
                  }
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {SURAH_LIST.map((s) => (
                    <SelectItem key={s.number} value={s.number.toString()}>
                      {s.number}. {s.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">رقم الآية (1 - {currentSurahMeta?.ayahCount || 1})</label>
              <Input
                type="number"
                min={1}
                max={currentSurahMeta?.ayahCount || 7}
                value={selectedAyah}
                onChange={(e) => setSelectedAyah(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-10 rounded-xl bg-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">القارئ المعتمد</label>
              <Select value={selectedReciter} onValueChange={(val) => { if (val) setSelectedReciter(val) }}>
                <SelectTrigger className="h-10 rounded-xl bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECITERS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      {/* Tajweed Rule Picker */}
      <section className="rounded-2xl p-5 border-2 border-[#d4c3a3]/70 bg-card/60 space-y-3">
        <div className="flex items-center gap-2 font-bold text-primary text-sm">
          <Database className="w-4 h-4" />
          <span>الحكم التجويدي المستهدف (اختياري للتقارير والتحليل الذكي)</span>
        </div>

        <Select value={selectedTajweedRule} onValueChange={(val) => { if (val) setSelectedTajweedRule(val) }}>
          <SelectTrigger className="h-11 rounded-xl bg-card">
            <SelectValue placeholder="اختر الحكم التجويدي (إظهار، إدغام، قلقلة، مد...)" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {TAJWEED_RULES.map((rule) => (
              <SelectItem key={rule.id} value={rule.id}>
                {rule.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentTajweedMeta && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
            <span className="font-bold text-primary">{currentTajweedMeta.nameAr}:</span>
            <p className="text-muted-foreground">{currentTajweedMeta.description}</p>
          </div>
        )}
      </section>

      {/* Section: Ayah Image */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-primary flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            صورة مخطوطة الآية (اختياري)
          </label>
        </div>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/20 rounded-2xl p-6 bg-card/40 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-all"
        >
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border shadow-inner">
              <Image src={imagePreview} alt="Preview" fill className="object-contain" />
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">اضغط لرفع صورة الآية من المصحف</p>
                <p className="text-[11px] text-muted-foreground">صورة عالية الدقة (Max 5MB)</p>
              </div>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            name="image" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageChange}
          />
        </div>
      </section>

      {/* Section: Question Text */}
      <section className="space-y-2">
        <label htmlFor="text" className="text-sm font-bold text-primary flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          نص السؤال والآية القرآنية
        </label>
        <Textarea 
          id="text" 
          name="text" 
          required 
          placeholder={type === 'voice_recitation' ? 'اقرأ قوله تعالى: (مِن بَعْدِ مَا جَاءَتْهُمُ الْبَيِّنَاتُ) مراعياً حكم الإقلاب...' : 'مثلاً: ما حكم النون الساكنة في قوله تعالى: {مِن مَّالٍ}؟'} 
          className="w-full min-h-[100px] p-4 rounded-2xl border-primary/20 bg-card text-lg font-quran text-foreground"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </section>

      {/* Section: Options for MCQ / Audio MCQ / Tajweed Rule */}
      {(type === 'multiple_choice' || type === 'audio_mcq' || type === 'tajweed_rule') && (
        <section className="space-y-3">
          <label className="text-sm font-bold text-primary">الخيارات الأربعة (حدد الإجابة الصحيحة)</label>
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center gap-3">
                <div 
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${correctOption === num.toString() ? 'border-primary bg-primary text-primary-foreground font-black' : 'border-primary/30 bg-card'}`}
                  onClick={() => setCorrectOption(num.toString())}
                >
                  <input 
                    type="radio" 
                    name="correct_answer" 
                    value={num.toString()} 
                    required 
                    className="hidden"
                    checked={correctOption === num.toString()}
                    onChange={() => setCorrectOption(num.toString())}
                  />
                  {correctOption === num.toString() && <Check className="w-4 h-4" />}
                </div>
                <Input 
                  name={`option_${num}`} 
                  placeholder={`الخيار ${num}`} 
                  required={num <= 2}
                  className="flex-1 h-12 rounded-xl border-primary/20 bg-card font-semibold"
                  value={options[num-1]}
                  onChange={(e) => {
                    const newOptions = [...options]
                    newOptions[num-1] = e.target.value
                    setOptions(newOptions)
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* True / False Options */}
      {type === 'true_false' && (
        <section className="space-y-2">
          <label className="text-sm font-bold text-primary">الإجابة الصحيحة</label>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${correctOption === 'true' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-primary/20 bg-card'}`}>
              <input type="radio" name="correct_answer" value="true" required className="hidden" onChange={() => setCorrectOption('true')} />
              <span className="text-lg font-bold">صح (صواب)</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${correctOption === 'false' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-primary/20 bg-card'}`}>
              <input type="radio" name="correct_answer" value="false" required className="hidden" onChange={() => setCorrectOption('false')} />
              <span className="text-lg font-bold">خطأ</span>
            </label>
          </div>
        </section>
      )}

      {/* Fill in Blank Options */}
      {type === 'fill_in_blank' && (
        <section className="space-y-2">
          <label className="text-sm font-bold text-primary">الإجابة الصحيحة للفراغ</label>
          <Input 
            id="correct_answer" 
            name="correct_answer" 
            placeholder="الكلمة أو الحكم الصحيح (مثال: إدغام بغنة|ادغام بغنة)..." 
            required 
            className="w-full h-12 rounded-xl border-primary/20 bg-card"
            onChange={(e) => setCorrectOption(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            * يمكنك إضافة خيارات بديلة مفصولة بعلامة <span className="font-bold text-primary">|</span>
          </p>
        </section>
      )}

      {/* Voice Recitation Guidance */}
      {type === 'voice_recitation' && (
        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1.5">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Mic className="w-4 h-4" />
            سؤال تلاوة وتسجيل صوتي:
          </span>
          <p className="text-muted-foreground leading-relaxed">
            سيظهر للطالب زر تسجيل صوتي مباشر لتلاوة الآية، وسيتم حفظ التسجيل في لوحة المعلم للاستماع إليه وتقييمه يدوياً وترك الملاحظات.
          </p>
        </div>
      )}

      {/* Section: Explanation */}
      <section className="space-y-2">
        <label htmlFor="explanation" className="text-sm font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          شرح الإجابة وحكم التجويد (اختياري)
        </label>
        <Textarea 
          id="explanation" 
          name="explanation" 
          placeholder="شرح الحكم والدليل من منظومة تحفة الأطفال أو الجزرية..." 
          className="w-full min-h-[80px] p-3 rounded-xl border-primary/20 bg-card text-sm"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </section>

      <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-primary-foreground text-lg font-black rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all">
        {loading ? 'جاري الحفظ...' : 'حفظ السؤال في الاختبار'}
      </Button>
    </form>
  )

  const previewContent = (
    <div className="sticky top-20 space-y-4">
      <div className="flex items-center gap-2 px-2 text-muted-foreground">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">معاينة الطالب الحية (المخطوطة القرآنية)</span>
      </div>
      
      <div className="relative p-6 md:p-8 bg-[#fdfaf2] dark:bg-slate-900 rounded-[2.5rem] border-2 border-[#d4c3a3] shadow-2xl overflow-hidden min-h-[400px]">
        <div className="relative space-y-6">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
              {type === 'multiple_choice' ? 'خيارات متعددة' : type === 'audio_mcq' ? 'سؤال استماع وتجويد' : type === 'voice_recitation' ? 'تلاوة صوتية' : type === 'true_false' ? 'صح أو خطأ' : 'إكمال الفراغ'}
            </span>

            {currentTajweedMeta && (
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${currentTajweedMeta.bgColor} ${currentTajweedMeta.borderColor}`}>
                {currentTajweedMeta.nameAr}
              </span>
            )}
          </div>

          {/* Audio Recitation Player if enabled */}
          {enableAudio && activeAudioUrl && (
            <QuranAudioPlayer
              audioUrl={activeAudioUrl}
              surahNumber={selectedSurah}
              ayahNumber={selectedAyah}
              reciterId={selectedReciter}
            />
          )}

          {/* Ayah Image */}
          {imagePreview && (
            <div className="w-full max-w-sm mx-auto rounded-2xl border-2 border-[#d4c3a3]/50 p-2 bg-white shadow-sm overflow-hidden relative h-[180px]">
              <Image src={imagePreview} alt="Question Image" fill className="object-contain" />
            </div>
          )}

          {/* Question Text */}
          <h4 className="text-2xl md:text-3xl font-quran leading-loose text-center text-[#3d2e1e] dark:text-[#fdfaf2]">
            {questionText || "هنا سيظهر نص السؤال والآية الكريمة..."}
          </h4>

          {/* Options Preview */}
          <div className="grid gap-3">
            {(type === 'multiple_choice' || type === 'audio_mcq' || type === 'tajweed_rule') && (
              options.map((opt, i) => (
                <div key={i} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between font-bold text-base ${correctOption === (i+1).toString() ? 'border-primary bg-primary/10 text-primary' : 'border-[#d4c3a3]/40 bg-white/60 dark:bg-card/60'}`}>
                  <span>{opt || `الخيار ${i+1}`}</span>
                  <div className={`w-5 h-5 rounded-full border-2 ${correctOption === (i+1).toString() ? 'bg-primary border-primary' : 'border-[#d4c3a3]'}`} />
                </div>
              ))
            )}

            {type === 'true_false' && (
              <div className="flex gap-4">
                <div className={`flex-1 p-4 rounded-2xl border-2 text-center font-bold text-base ${correctOption === 'true' ? 'border-primary bg-primary/10 text-primary' : 'border-[#d4c3a3]/40 bg-white/60 dark:bg-card/60'}`}>صح</div>
                <div className={`flex-1 p-4 rounded-2xl border-2 text-center font-bold text-base ${correctOption === 'false' ? 'border-primary bg-primary/10 text-primary' : 'border-[#d4c3a3]/40 bg-white/60 dark:bg-card/60'}`}>خطأ</div>
              </div>
            )}

            {type === 'voice_recitation' && (
              <div className="p-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-center space-y-2">
                <Mic className="w-8 h-8 text-primary mx-auto animate-bounce" />
                <p className="text-sm font-bold text-primary">نافذة تسجيل التلاوة الصوتية ستظهر للطالب هنا</p>
              </div>
            )}

            {type === 'fill_in_blank' && (
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#d4c3a3] bg-white/50 dark:bg-card/50 text-center font-quran">
                مربع إدخال إجابة الطالب...
              </div>
            )}
          </div>

          {explanation && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                الشرح المرفق:
              </span>
              <p className="text-muted-foreground">{explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      <div className="hidden lg:grid grid-cols-2 gap-8 items-start">
        {editorForm}
        {previewContent}
      </div>

      <div className="lg:hidden">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-6 p-1 bg-muted rounded-xl">
            <TabsTrigger value="edit" className="rounded-lg font-bold">تعديل السؤال</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-lg font-bold">معاينة الطالب</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-0">
            {editorForm}
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            {previewContent}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
