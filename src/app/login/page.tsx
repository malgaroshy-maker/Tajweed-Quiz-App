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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">مرحباً بك في معلم التجويد</CardTitle>
          <CardDescription>قم بتسجيل الدخول أو إنشاء حساب جديد</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-md bg-primary/15 p-3 text-sm text-primary text-center">
              {message}
            </div>
          )}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">حساب جديد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form action={login} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">البريد الإلكتروني</Label>
                  <Input id="email-login" name="email" type="email" required placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">كلمة المرور</Label>
                  <Input id="password-login" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">دخول</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form action={signup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">الاسم الأول</Label>
                    <Input id="first_name" name="first_name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">اسم العائلة</Label>
                    <Input id="last_name" name="last_name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">البريد الإلكتروني</Label>
                  <Input id="email-signup" name="email" type="email" required placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">كلمة المرور</Label>
                  <Input id="password-signup" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">نوع الحساب</Label>
                  <select
                    id="role"
                    name="role"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="student" className="text-foreground bg-background">طالب</option>
                    <option value="teacher" className="text-foreground bg-background">معلم</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">إنشاء الحساب</Button>
              </form>
            </TabsContent>
          </Tabs>
          <GuestEntryForm />
        </CardContent>
      </Card>
    </div>
  )
}
