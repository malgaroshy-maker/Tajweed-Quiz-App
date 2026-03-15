import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GuestEntryForm } from '@/components/guest-entry-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams.error as string | undefined
  const message = resolvedParams.message as string | undefined

  return (
    <div className="flex min-h-screen items-center justify-center p-6 parchment-texture bg-background">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3 transition-premium hover:rotate-0">
                <span className="text-white font-quran text-5xl font-black">ق</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">مِنصة القَلَم</h1>
            <p className="text-primary/70 text-xl font-bold italic">بوابتكِ المتكاملة لعلوم التجويد والقرآن</p>
        </div>

        <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden transition-premium hover:scale-[1.005]">
          <CardHeader className="text-center p-10 pb-6">
            <CardTitle className="text-2xl font-black text-slate-900">مرحباً بكِ في رحاب العلم</CardTitle>
            <CardDescription className="text-slate-500 font-bold mt-2">قم بتسجيل الدخول أو إنشاء حساب جديد للبدء</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            {error && (
              <div className="mb-6 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive text-center font-bold border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-6 rounded-2xl bg-primary/10 p-4 text-sm text-primary text-center font-bold border border-primary/20 animate-in fade-in slide-in-from-top-2">
                {message}
              </div>
            )}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-primary/5 p-1.5 rounded-2xl h-14">
                <TabsTrigger value="login" className="rounded-xl font-black text-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-premium">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-black text-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-premium">حساب جديد</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <form action={login} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email-login" className="text-primary font-black uppercase tracking-widest text-xs pr-2">البريد الإلكتروني</Label>
                    <Input id="email-login" name="email" type="email" required placeholder="name@example.com" className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary font-bold shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password-login" className="text-primary font-black uppercase tracking-widest text-xs pr-2">كلمة المرور</Label>
                    <Input id="password-login" name="password" type="password" required className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary font-bold shadow-inner" />
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-white font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-premium">دخول</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <form action={signup} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="first_name" className="text-primary font-black uppercase tracking-widest text-xs pr-2">الاسم الأول</Label>
                      <Input id="first_name" name="first_name" required className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary font-bold shadow-inner" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="last_name" className="text-primary font-black uppercase tracking-widest text-xs pr-2">اسم العائلة</Label>
                      <Input id="last_name" name="last_name" required className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary font-bold shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email-signup" className="text-primary font-black uppercase tracking-widest text-xs pr-2">البريد الإلكتروني</Label>
                    <Input id="email-signup" name="email" type="email" required placeholder="name@example.com" className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary font-bold shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password-signup" className="text-primary font-black uppercase tracking-widest text-xs pr-2">كلمة المرور</Label>
                    <Input id="password-signup" name="password" type="password" required className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary font-bold shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="invitation_code" className="text-primary font-black uppercase tracking-widest text-xs pr-2">كود دعوة المعلمة</Label>
                        <span className="text-[10px] font-black text-slate-400 italic">(اختياري للمدرسات فقط)</span>
                    </div>
                    <Input id="invitation_code" name="invitation_code" placeholder="أدخلي الكود الممنوح لكِ..." className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary font-bold shadow-inner bg-primary/5" />
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-white font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-premium">إنشاء الحساب</Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-[#d4c3a3]/30"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#fffdf5] px-4 font-black text-slate-400 tracking-widest">أو الدخول السريع</span></div>
            </div>

            <GuestEntryForm />
          </CardContent>
        </Card>
        
        <p className="text-center text-slate-400 font-bold text-sm tracking-wide">
            © {new Date().getFullYear()} منصة القلم لعلوم التجويد - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  )
}
