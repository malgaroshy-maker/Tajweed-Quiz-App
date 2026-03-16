"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export function GuestEntryForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!code.trim() || !name.trim()) {
      setError('الرجاء إدخال الرمز واسمك')
      return
    }
    // Redirect to quiz page with guest_name as query param
    const encodedName = encodeURIComponent(name.trim())
    router.push(`/take-quiz/${code.trim().toUpperCase()}?guest_name=${encodedName}`)
  }

  return (
    <Card className="mt-8 border-2 border-primary/10 bg-primary/5 rounded-[2.5rem] shadow-inner transition-premium hover:bg-primary/[0.08]">
      <CardHeader className="text-center p-8 pb-4">
        <CardTitle className="text-xl font-black text-primary">الدخول السريع كطالب</CardTitle>
        <CardDescription className="text-primary/60 font-bold">لا يحتاج لحساب - أدخل رمز الاختبار واسمك فقط</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center font-bold animate-in fade-in">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="guest-code" className="text-xs font-black text-primary/60 uppercase tracking-widest pr-2">رمز الاختبار</label>
            <Input 
              id="guest-code" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: ABC123" 
              maxLength={6} 
              required 
              className="h-14 rounded-2xl bg-white border-2 border-primary/10 focus-visible:ring-primary uppercase text-center tracking-[0.3em] font-black text-xl shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="guest-name" className="text-xs font-black text-primary/60 uppercase tracking-widest pr-2">اسمك الكريم</label>
            <Input 
              id="guest-name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="اكتب اسمك هنا..." 
              required 
              className="h-14 rounded-2xl bg-white border-2 border-primary/10 focus-visible:ring-primary font-bold text-lg shadow-inner"
            />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-lg hover:scale-[1.02] transition-premium">بدء الاختبار الآن</Button>
        </form>
      </CardContent>
    </Card>
  )
}
