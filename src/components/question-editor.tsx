'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addQuestion } from '@/app/teacher/quizzes/[id]/question-actions'
import { ImageIcon, X, Eye, Edit3, Sparkles, Check, Database } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function QuestionEditor({ quizId }: { quizId: string }) {
  const [type, setType] = useState('multiple_choice')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctOption, setCorrectOption] = useState<string | null>(null)
  const [explanation, setExplanation] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('quiz-images')
          .upload(filePath, file)
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('quiz-images')
            .getPublicUrl(filePath)
          imageUrl = publicUrl
        }
      }
    }
    
    // Add image URL to formData
    if (imageUrl) {
      formData.append('image_url', imageUrl)
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
      const form = document.getElementById('add-question-form') as HTMLFormElement
      form.reset()
    } else {
        alert(result.error || 'حدث خطأ أثناء حفظ السؤال')
    }
  }

  const editorForm = (
    <form id="add-question-form" action={handleSubmit} className="space-y-10">
      {/* Section: Ayah Image */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            مرجع مخطوطة الآية (اختياري)
          </h3>
          <span className="text-xs text-primary/60 bg-primary/10 px-2 py-1 rounded">Ayah Manuscript</span>
        </div>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/20 rounded-xl p-8 bg-white/50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-4 group hover:border-primary/40 transition-all cursor-pointer shadow-sm"
        >
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-inner">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700 dark:text-slate-200">اضغط للرفع أو السحب والإفلات</p>
                <p className="text-sm text-primary/60 dark:text-primary/80">صورة عالية الدقة (Max 5MB)</p>
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
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Edit3 className="w-6 h-6" />
          نص السؤال
        </h3>
        <Textarea 
          id="text" 
          name="text" 
          required 
          placeholder="مثلاً: ما حكم النون في كلمة من مأمن؟" 
          className="w-full min-h-[120px] p-4 rounded-xl border-primary/20 focus:ring-primary focus:border-primary bg-white/80 dark:bg-slate-800/80 text-lg font-quran shadow-sm text-slate-900 dark:text-slate-100"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </section>

      {/* Section: Answer Configuration */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">نوع الإجابة</h3>
          <Select value={type} onValueChange={(v) => { if (v) setType(v) }}>
            <SelectTrigger className="w-full h-12 p-3 rounded-lg border-primary/20 bg-white dark:bg-slate-800 shadow-sm focus:ring-primary focus:border-primary text-slate-900 dark:text-slate-100">
              <SelectValue placeholder="اختر نوع السؤال" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              <SelectItem value="multiple_choice">اختيار من متعدد</SelectItem>
              <SelectItem value="true_false">صح أو خطأ</SelectItem>
              <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
              <SelectItem value="fill_in_blank">إكمال الفراغ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">مستوى الصعوبة</h3>
          <div className="flex gap-2">
            <Select name="difficulty" defaultValue="medium">
              <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-800 border-primary/20 shadow-sm text-slate-900 dark:text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                <SelectItem value="easy">مبتدئ</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="hard">متقدم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Section: Options */}
      {type === 'multiple_choice' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">إدخال الخيارات</h3>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center gap-3">
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${correctOption === num.toString() ? 'border-primary bg-primary text-white' : 'border-primary/20 bg-white dark:bg-slate-700'}`}
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
                  {correctOption === num.toString() && <Check className="w-3 h-3" />}
                </div>
                <Input 
                  name={`option_${num}`} 
                  placeholder={`الخيار ${num}`} 
                  required={num <= 2}
                  className="flex-1 p-3 h-12 rounded-lg border-primary/20 bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100"
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

      {type === 'true_false' && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-primary">الإجابة الصحيحة</h3>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${correctOption === 'true' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-primary/20 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}>
              <input type="radio" name="correct_answer" value="true" required className="hidden" onChange={() => setCorrectOption('true')} />
              <span>صح</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${correctOption === 'false' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-primary/20 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}>
              <input type="radio" name="correct_answer" value="false" required className="hidden" onChange={() => setCorrectOption('false')} />
              <span>خطأ</span>
            </label>
          </div>
        </section>
      )}

      {type === 'fill_in_blank' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary">الإجابة الصحيحة</h3>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">نصيحة</span>
          </div>
          <Input 
            id="correct_answer" 
            name="correct_answer" 
            placeholder="الكلمة أو الجملة الصحيحة..." 
            required 
            className="w-full h-12 p-3 rounded-lg border-primary/20 bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100"
            onChange={(e) => setCorrectOption(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            * يمكنك إضافة أكثر من إجابة صحيحة بالفصل بينها بعلامة <span className="font-bold text-primary">|</span> (مثلاً: إدغام|ادغام).
            <br />
            * النظام يتجاهل التشكيل والهمزات تلقائياً عند التصحيح.
          </p>
        </section>
      )}

      {/* Section: Explanation */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          شرح الإجابة (اختياري)
        </h3>
        <Textarea 
          id="explanation" 
          name="explanation" 
          placeholder="لماذا هذه هي الإجابة الصحيحة؟..." 
          className="w-full min-h-[100px] p-4 rounded-xl border-primary/20 bg-white/80 dark:bg-slate-800/80 shadow-sm text-slate-900 dark:text-slate-100"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </section>

      {/* Section: Tajweed Rule Tags */}
      <section className="space-y-4 pb-12">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Database className="w-6 h-6" />
          وسم أحكام التجويد
        </h3>
        <div className="p-5 border border-primary/10 rounded-xl bg-white/40 dark:bg-slate-800/40 shadow-inner">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm font-bold">
              نون ساكنة <X className="w-3 h-3 cursor-pointer" />
            </span>
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm font-bold">
              إخفاء <X className="w-3 h-3 cursor-pointer" />
            </span>
            <span className="bg-primary/10 text-primary border-2 border-primary/20 px-4 py-1 rounded-full text-sm hover:bg-primary/20 cursor-pointer font-black transition-all">+ إضافة حكم</span>
          </div>
          <p className="text-xs text-primary/60 dark:text-primary/80 italic font-medium">يساعد الوسم المساعد الذكي على تقديم تعليقات أفضل للطلاب أثناء الاختبار.</p>
        </div>
      </section>

      <Button type="submit" disabled={loading} className="w-full h-16 bg-primary text-white text-xl font-black rounded-xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all">
        {loading ? 'جاري الحفظ...' : 'حفظ ونشر السؤال'}
      </Button>
    </form>
  )

  const previewContent = (
    <div className="sticky top-20 space-y-4">
      <div className="flex items-center gap-2 px-2 text-muted-foreground">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-bold">معاينة الطالب (المخطوطة)</span>
      </div>
      
      <div className="relative p-6 md:p-8 bg-[#fdfaf2] rounded-2xl border-2 border-[#d4c3a3] shadow-xl overflow-hidden min-h-[400px]">
        {/* Ornamental Background Elements */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
          <div className="absolute top-4 right-4 w-full h-full border-t-4 border-r-4 border-[#8b7355] rounded-tr-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 pointer-events-none">
          <div className="absolute bottom-4 left-4 w-full h-full border-b-4 border-l-4 border-[#8b7355] rounded-bl-3xl" />
        </div>

        <div className="relative space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {imagePreview && (
              <div className="w-full max-w-sm rounded-md border-2 border-[#d4c3a3]/50 p-1 bg-white shadow-sm overflow-hidden">
                <img src={imagePreview} alt="Queston Image" className="w-full h-auto object-contain" />
              </div>
            )}
            
            <h4 className="text-2xl md:text-3xl font-quran leading-loose text-[#3d2e1e]">
              {questionText || "هنا سيظهر نص السؤال..."}
            </h4>
          </div>

          <div className="grid gap-3">
            {type === 'multiple_choice' && (
              options.map((opt, i) => (
                <div key={i} className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between font-bold text-lg ${correctOption === (i+1).toString() ? 'border-[#8b7355] bg-[#8b7355]/5 text-[#3d2e1e]' : 'border-[#d4c3a3]/30 bg-white/50 text-[#8b7355]'}`}>
                  <span>{opt || `الخيار ${i+1}`}</span>
                  <div className={`w-5 h-5 rounded-full border-2 ${correctOption === (i+1).toString() ? 'bg-[#8b7355] border-[#8b7355]' : 'border-[#d4c3a3]'}`} />
                </div>
              ))
            )}

            {type === 'true_false' && (
              <div className="flex gap-4">
                <div className={`flex-1 p-4 rounded-xl border-2 text-center font-bold text-lg ${correctOption === 'true' ? 'border-[#8b7355] bg-[#8b7355]/5 text-[#3d2e1e]' : 'border-[#d4c3a3]/30 bg-white/50 text-[#8b7355]'}`}>صح</div>
                <div className={`flex-1 p-4 rounded-xl border-2 text-center font-bold text-lg ${correctOption === 'false' ? 'border-[#8b7355] bg-[#8b7355]/5 text-[#3d2e1e]' : 'border-[#d4c3a3]/30 bg-white/50 text-[#8b7355]'}`}>خطأ</div>
              </div>
            )}

            {type === 'fill_in_blank' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border-2 border-dashed border-[#d4c3a3] bg-white/50 text-center text-lg text-[#8b7355] font-quran italic">
                  {questionText.includes('[...]') 
                    ? questionText.split('[...]').map((part, i) => (
                        <span key={i}>
                          {part}
                          {i < questionText.split('[...]').length - 1 && (
                            <span className="inline-block w-24 border-b-2 border-[#8b7355] mx-1 h-6 align-bottom bg-[#8b7355]/10"></span>
                          )}
                        </span>
                      ))
                    : "اكتب [...] في نص السؤال لتحديد مكان الفراغ، أو سيظهر الفراغ أسفل السؤال."
                  }
                </div>
                {!questionText.includes('[...]') && (
                  <div className="w-full h-12 rounded-lg border-2 border-[#d4c3a3] bg-white/50 flex items-center px-4 text-[#d4c3a3] font-quran">
                    إجابة الطالب هنا...
                  </div>
                )}
                <div className="text-[10px] text-[#8b7355] font-bold text-center uppercase tracking-widest">
                  الإجابة الصحيحة: {correctOption?.split('|')[0] || "..."}
                </div>
              </div>
            )}
          </div>

          {explanation && (
            <div className="mt-8 p-4 bg-[#8b7355]/5 border border-[#8b7355]/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-[#3d2e1e] font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                شرح المعلم:
              </div>
              <p className="text-sm text-[#5c4a33] leading-relaxed italic">{explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-2 gap-8 items-start">
        {editorForm}
        {previewContent}
      </div>

      {/* Mobile Layout (Tabs) */}
      <div className="lg:hidden">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-6 p-1 bg-muted rounded-xl">
            <TabsTrigger value="edit" className="rounded-lg font-bold">تعديل السؤال</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-lg font-bold">معاينة</TabsTrigger>
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
