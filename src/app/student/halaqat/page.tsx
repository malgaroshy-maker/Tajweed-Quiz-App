import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus, BookOpen, Clock, ShieldCheck, ArrowRight } from 'lucide-react'
import { joinHalaqahAction } from './actions'
import Link from 'next/link'

export default async function StudentHalaqatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch halaqat joined by student
  const { data: memberships } = await supabase
    .from('halaqah_members')
    .select(`
      id,
      joined_at,
      halaqat (
        id,
        name,
        description,
        code,
        profiles:teacher_id (
          first_name,
          last_name
        ),
        quizzes (
          id,
          title,
          description,
          share_code,
          time_limit_minutes,
          is_published
        )
      )
    `)
    .eq('student_id', user.id)
    .order('joined_at', { ascending: false })

  const halaqatList = memberships?.map(m => m.halaqat).filter(Boolean) || []

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          حلقاتي وفصولي التعليمية
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          انضم إلى حلقات معلمك التجويدية للوصول إلى الاختبارات المخصصة والتقييمات الصوتية المباشرة.
        </p>
      </div>

      {/* Join Card */}
      <Card className="parchment-card rounded-[2.5rem] shadow-xl border-2 border-[#d4c3a3]/70">
        <CardContent className="p-8">
          <form action={joinHalaqahAction} className="space-y-4 max-w-xl">
            <div>
              <Label htmlFor="code" className="text-sm font-black text-primary block mb-2">
                رمز الانضمام للحلقة (مقدم من المعلم)
              </Label>
              <div className="flex gap-3">
                <Input
                  id="code"
                  name="code"
                  placeholder="مثال: H-AB12"
                  required
                  className="rounded-2xl h-14 text-xl font-mono uppercase tracking-widest bg-white/60 dark:bg-black/20 border-2 border-[#d4c3a3]"
                />
                <Button
                  type="submit"
                  className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base shrink-0 shadow-lg"
                >
                  انضمام الآن
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Joined Halaqat Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          الحلقات الملتحق بها ({halaqatList.length})
        </h2>

        {halaqatList.length === 0 ? (
          <Card className="parchment-card rounded-3xl p-10 text-center border-2 border-dashed border-[#d4c3a3]/70">
            <p className="text-muted-foreground font-bold">
              لم تلتحق بأي حلقة بعد. اطلب رمز الحلقة من معلمك واكتبه في الحقل أعلاه.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {halaqatList.map((h: any) => {
              const teacherName = h.profiles
                ? `المعلم: ${h.profiles.first_name || ''} ${h.profiles.last_name || ''}`.trim()
                : 'معلم معتمد'

              const publishedQuizzes = (h.quizzes || []).filter((q: any) => q.is_published)

              return (
                <Card key={h.id} className="parchment-card rounded-[2.5rem] shadow-xl border-2 border-[#d4c3a3]/60 flex flex-col justify-between">
                  <CardHeader className="p-6 pb-3">
                    <CardTitle className="text-2xl font-black text-primary">{h.name}</CardTitle>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">{teacherName}</p>
                    {h.description && (
                      <CardDescription className="text-sm mt-2 font-medium text-muted-foreground">
                        {h.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-6 pt-0 space-y-4">
                    <div className="border-t border-border/40 pt-4 space-y-3">
                      <p className="text-xs font-black text-foreground flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                        الاختبارات المتاحة لهذه الحلقة ({publishedQuizzes.length}):
                      </p>

                      {publishedQuizzes.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">لا توجد اختبارات مخصصة حالياً.</p>
                      ) : (
                        <div className="space-y-2">
                          {publishedQuizzes.map((quiz: any) => (
                            <Link
                              key={quiz.id}
                              href={`/take-quiz/${quiz.share_code}`}
                              className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors group"
                            >
                              <div>
                                <span className="font-black text-sm text-foreground block group-hover:text-primary transition-colors">
                                  {quiz.title}
                                </span>
                                {quiz.time_limit_minutes && (
                                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    محدد بوقت: {quiz.time_limit_minutes} دقيقة
                                  </span>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-primary rotate-180 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
