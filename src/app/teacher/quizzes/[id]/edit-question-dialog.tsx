'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { updateQuestion } from '@/app/teacher/quizzes/[id]/update-question-action'

interface Option {
  id: string | number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  quiz_id: string;
  type: string;
  text: string;
  topic?: string;
  explanation?: string;
  options?: Option[];
}

export function EditQuestionDialog({ question }: { question: Question }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState(question.type)
  const [options, setOptions] = useState(question.options || [])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    formData.append('type', type)
    formData.append('options', JSON.stringify(options))
    await updateQuestion(question.id, question.quiz_id, formData)
    setLoading(false)
    setOpen(false)
  }

  const addOption = () => {
    setOptions([...options, { id: Math.random(), text: '', is_correct: false }])
  }

  const removeOption = (id: string | number) => {
    setOptions(options.filter((o: Option) => o.id !== id))
  }

  const updateOption = (id: string | number, field: string, value: string | boolean) => {
    setOptions(options.map((o: Option) => o.id === id ? { ...o, [field]: value } : o))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-8 h-8 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-md">
        <Edit2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل السؤال</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>نوع السؤال</Label>
            <Select value={type} onValueChange={(v) => { if (v) setType(v) }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">اختيار من متعدد</SelectItem>
                <SelectItem value="true_false">صح أو خطأ</SelectItem>
                <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
                <SelectItem value="fill_in_blank">إكمال الفراغ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">نص السؤال</Label>
            <Textarea id="text" name="text" defaultValue={question.text} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">الموضوع (اختياري)</Label>
            <Input id="topic" name="topic" defaultValue={question.topic} placeholder="مثال: نون ساكنة، مد، مخارج..." />
          </div>

          {type === 'multiple_choice' && (
            <div className="space-y-4 border-t pt-4">
              <Label>الخيارات</Label>
              {options.map((opt: Option, i: number) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input type="radio" name="correct_option" checked={opt.is_correct} onChange={() => {
                    setOptions(options.map((o: Option, idx: number) => ({ ...o, is_correct: idx === i })))
                  }} className="w-4 h-4" />
                  <Input value={opt.text} onChange={(e) => updateOption(opt.id, 'text', e.target.value)} required />
                  <Button variant="ghost" size="icon" onClick={() => removeOption(opt.id)} type="button"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" onClick={addOption} variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 ml-2" /> إضافة خيار</Button>
            </div>
          )}

          {type === 'true_false' && (
            <div className="space-y-4 border-t pt-4">
              <Label>الإجابة الصحيحة</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="correct_option" value="true" defaultChecked={options.find((o: Option) => o.text === 'صح')?.is_correct} className="w-4 h-4" /> صح
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="correct_option" value="false" defaultChecked={options.find((o: Option) => o.text === 'خطأ')?.is_correct} className="w-4 h-4" /> خطأ
                </label>
              </div>
            </div>
          )}

          {type === 'fill_in_blank' && (
            <div className="space-y-4 border-t pt-4">
              <Label htmlFor="fill_answer">الإجابة الصحيحة</Label>
              <Input 
                id="fill_answer" 
                name="fill_answer" 
                defaultValue={options.find((o: Option) => o.is_correct)?.text || ''} 
                required 
              />
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="explanation">شرح الإجابة (اختياري)</Label>
            <Textarea id="explanation" name="explanation" defaultValue={question.explanation} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
