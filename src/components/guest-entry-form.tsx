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
    <Card className="mt-6">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">الدخول كضيف</CardTitle>
        <CardDescription>لا يحتاج لحساب - أدخل رمز الاختبار واسمك</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="guest-code" className="text-sm font-medium">رمز الاختبار</label>
            <Input 
              id="guest-code" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: ABC123" 
              maxLength={6} 
              required 
              className="uppercase text-center tracking-widest"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="guest-name" className="text-sm font-medium">اسمك</label>
            <Input 
              id="guest-name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="الاسم الكريم" 
              required 
            />
          </div>
          <Button type="submit" className="w-full">بدء الاختبار</Button>
        </form>
      </CardContent>
    </Card>
  )
}
