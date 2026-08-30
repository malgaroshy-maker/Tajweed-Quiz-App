import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Users, Plus, Copy, Trash2, BookOpen, ShieldCheck, GraduationCap, Clock } from 'lucide-react'
import { createHalaqahAction, deleteHalaqahAction, removeStudentFromHalaqahAction } from './actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default async function TeacherHalaqatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch teacher's halaqat
  const { data: halaqat } = await supabase
    .from('halaqat')
    .select(`
      id,
      name,
      description,
      code,
      created_at,
      halaqah_members (
        id,
        joined_at,
        student_id,
        profiles:student_id (
          id,
          first_name,
          last_name
        )
      ),
      quizzes (
        id,
        title
      )
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  const totalHalaqat = halaqat?.length || 0
  const totalStudents = halaqat?.reduce((sum, h) => sum + (h.halaqah_members?.length || 0), 0) || 0

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            حلقات وفصول التجويد
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            إدارة الحلقات الدراسية، ضم الطلاب برمز الانضمام، وتخصيص الاختبارات المحددة بوقت لكل حلقة.
          </p>
        </div>

        {/* Create Halaqah Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg gap-2 text-base">
              <Plus className="w-5 h-5" />
              إنشاء حلقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                إنشاء حلقة تجويد جديدة
              </DialogTitle>
              <DialogDescription>
                أدخل اسم الحلقة ووصفها لإنشاء رمز انضمام فريد يمكن للطلاب استخدامه.
              </DialogDescription>
            </DialogHeader>

            <form action={createHalaqahAction} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-sm">اسم الحلقة أو الفصل</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="مثال: حلقة الإتقان - المستوى الثاني"
                  required
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-sm">وصف الحلقة / المنهج المقرّر</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="مثال: دراسة أحكام النون الساكنة والتنوين مع متعة التطبيق العملي"
                  className="rounded-xl resize-none h-24"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="submit" className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground">
                  تأكيد وإنشاء الحلقة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="parchment-card rounded-3xl shadow-md border-2 border-[#d4c3a3]/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground">إجمالي الحلقات النشطة</p>
              <p className="text-3xl font-black text-primary mt-1">{totalHalaqat}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="parchment-card rounded-3xl shadow-md border-2 border-[#d4c3a3]/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground">إجمالي الطلاب الملتحقين</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="parchment-card rounded-3xl shadow-md border-2 border-[#d4c3a3]/60 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground">نظام الانضمام</p>
              <p className="text-sm font-bold text-foreground mt-1">رموز حصرية آمنة لكل حلقة</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Halaqat List */}
      {!halaqat || halaqat.length === 0 ? (
        <Card className="parchment-card rounded-3xl p-12 text-center border-2 border-dashed border-[#d4c3a3]/80 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">لم تقم بإنشاء أي حلقة تجويد حتى الآن</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            الحلقات تتيح لك تنظيم طلابك في مجموعات وفصول دراسية وتعيين اختبارات بوقت محدد وخاصة بكل حلقة.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {halaqat.map((h) => {
            const members = (h.halaqah_members || []) as unknown as Array<{
              id: string
              joined_at: string
              student_id: string
              profiles?: { id: string; first_name: string; last_name: string } | null
            }>

            return (
              <Card key={h.id} className="parchment-card rounded-[2.5rem] shadow-xl border-2 border-[#d4c3a3]/60 flex flex-col justify-between overflow-hidden">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-2xl font-black text-primary">{h.name}</CardTitle>
                      {h.description && (
                        <CardDescription className="text-sm mt-1 text-muted-foreground font-medium">
                          {h.description}
                        </CardDescription>
                      )}
                    </div>

                    {/* Delete action */}
                    <form action={deleteHalaqahAction.bind(null, h.id)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-600 rounded-xl"
                        title="حذف الحلقة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-5">
                  {/* Join Code Display */}
                  <div className="rounded-2xl p-4 bg-primary/5 border border-primary/20 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-black text-muted-foreground block">رمز انضمام الطلاب للحلقة:</span>
                      <span className="text-2xl font-black tracking-widest text-primary font-mono">{h.code}</span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard.writeText(h.code)
                          alert(`تم نسخ رمز الحلقة: ${h.code}`)
                        }
                      }}
                      className="rounded-xl border-[#d4c3a3] font-bold text-xs gap-1.5 hover:bg-primary/10"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      نسخ الرمز
                    </Button>
                  </div>

                  {/* Members & Quizzes Meta */}
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      {members.length} طلاب ملتحقين
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {h.quizzes?.length || 0} اختبارات مخصصة
                    </span>
                  </div>

                  {/* Members Roster Accordion / Preview */}
                  {members.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-black text-foreground">قائمة الطلاب المنضمين:</p>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {members.map((m) => {
                          const fullName = m.profiles
                            ? `${m.profiles.first_name || ''} ${m.profiles.last_name || ''}`.trim()
                            : 'طالب'

                          return (
                            <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-card/80 border border-border/50 text-xs">
                              <span className="font-bold text-foreground flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                {fullName || 'طالب مجهول'}
                              </span>

                              <form action={removeStudentFromHalaqahAction.bind(null, h.id, m.student_id)}>
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950 font-bold"
                                >
                                  إزالة
                                </Button>
                              </form>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
