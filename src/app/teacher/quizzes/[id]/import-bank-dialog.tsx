'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Library, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getBankQuestions, importQuestionsFromBank } from './question-actions'

interface BankQuestion {
  id: string;
  text: string;
  type: string;
  image_url?: string;
}

export function ImportFromBankDialog({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [questions, setQuestions] = useState<BankQuestion[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const loadQuestions = async () => {
    setLoading(true)
    const data = await getBankQuestions()
    // Filter out questions already in this quiz would be better, but for now show all
    setQuestions(data)
    setLoading(false)
  }

  const handleToggle = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleImport = async () => {
    if (selected.length === 0) return
    setImporting(true)
    const result = await importQuestionsFromBank(quizId, selected)
    setImporting(false)
    if (result.success) {
      setOpen(false)
      setSelected([])
    }
  }

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (val) loadQuestions()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Library className="w-4 h-4" />
          استيراد من بنك الأسئلة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>استيراد أسئلة</DialogTitle>
          <DialogDescription>
            اختر الأسئلة التي ترغب في إضافتها لهذا الاختبار من مكتبتك الخاصة.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="بحث في الأسئلة..." 
            className="pr-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أسئلة تطابق البحث.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div 
                key={q.id} 
                className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleToggle(q.id)}
              >
                <Checkbox 
                  checked={selected.includes(q.id)} 
                  onCheckedChange={() => handleToggle(q.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm leading-relaxed">{q.text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                      {q.type === 'multiple_choice' ? 'خيارات' : q.type === 'true_false' ? 'صح/خطأ' : 'نص'}
                    </span>
                    {q.image_url && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">بها صورة</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-sm font-medium">تم اختيار {selected.length} سؤال</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button 
              disabled={selected.length === 0 || importing} 
              onClick={handleImport}
              className="gap-2"
            >
              {importing && <Loader2 className="w-4 h-4 animate-spin" />}
              استيراد المختار
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
