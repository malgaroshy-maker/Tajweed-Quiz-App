import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function StudentJoinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  async function joinQuiz(formData: FormData) {
    'use server'
    const code = formData.get('code') as string
    if (code) {
      redirect(`/take-quiz/${code.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/student" className="text-muted-foreground hover:text-primary transition-colors">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold">الانضمام لاختبار</h1>
      </div>

      <Card className="border-primary/50 border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">أدخل رمز الاختبار</CardTitle>
          <CardDescription>
            أدخل الرمز المكون من 6 أحرف الذي شاركه معك معلمك لبدء الاختبار.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={joinQuiz} className="space-y-4">
            <Input 
              name="code" 
              placeholder="مثال: ABC123" 
              required 
              className="uppercase text-center font-mono tracking-widest text-2xl h-16" 
              maxLength={6} 
              autoFocus
            />
            <Button type="submit" className="w-full h-12 text-lg">
              دخول الاختبار
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg border text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">هل تواجه مشكلة؟</p>
        <ul className="list-disc list-inside space-y-1">
          <li>تأكد من كتابة الرمز بشكل صحيح.</li>
          <li>تأكد أن المعلم قد قام بنشر الاختبار.</li>
          <li>اطلب من المعلم تزويدك برابط مباشر إذا استمرت المشكلة.</li>
        </ul>
      </div>
    </div>
  )
}
