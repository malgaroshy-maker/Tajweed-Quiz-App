'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, FolderOpen, Users, Loader2, Library } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

// Types
type Quiz = {
    id: string;
    title: string;
    description: string;
    share_code: string;
    teacher_name: string;
    teacher_id: string;
    folder_name: string;
    folder_id: string | null;
};

export default function StudentQuizzesLibrary() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  // Navigation State: null = Teachers, 'teacher_id' = Folders, 'folder_id' = Quizzes
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null) // 'none' for loose quizzes

  useEffect(() => {
    const fetchQuizzes = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('quizzes')
        .select(`
          id, title, description, share_code, teacher_id, folder_id,
          profiles:teacher_id(first_name, last_name),
          folders:folder_id(name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (data) {
        const formatted: Quiz[] = data.map(q => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p: any = Array.isArray(q.profiles) ? q.profiles[0] : q.profiles;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const f: any = Array.isArray(q.folders) ? q.folders[0] : q.folders;
            return {
                id: q.id,
                title: q.title,
                description: q.description || '',
                share_code: q.share_code,
                teacher_id: q.teacher_id,
                teacher_name: p ? `أ. ${p.first_name} ${p.last_name}` : 'معلم غير معروف',
                folder_id: q.folder_id,
                folder_name: f?.name || null // Keep null explicitly to separate loose quizzes
            }
        });
        setQuizzes(formatted)
      }
      setLoading(false)
    }
    fetchQuizzes()
  }, [])

  if (loading) {
      return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  // Derived Views
  const teachersMap = new Map<string, { id: string, name: string, count: number }>();
  quizzes.forEach(q => {
      if (!teachersMap.has(q.teacher_id)) {
          teachersMap.set(q.teacher_id, { id: q.teacher_id, name: q.teacher_name, count: 0 })
      }
      teachersMap.get(q.teacher_id)!.count++;
  })
  const teachersList = Array.from(teachersMap.values());

  // Render Logic
  if (selectedFolderId !== null && selectedTeacherId !== null) {
      // LEVEL 3: Quizzes inside a folder (or loose)
      const folderQuizzes = quizzes.filter(q => q.teacher_id === selectedTeacherId && (selectedFolderId === 'none' ? q.folder_id === null : q.folder_id === selectedFolderId));
      const folderName = selectedFolderId === 'none' ? 'اختبارات عامة' : folderQuizzes[0]?.folder_name || '';

      return (
        <div className="space-y-8 pb-10 animate-in slide-in-from-left-8 duration-300">
            <Button variant="ghost" onClick={() => setSelectedFolderId(null)} className="gap-2 text-primary font-black hover:bg-primary/10 rounded-2xl h-12 px-6 transition-premium">
                <ArrowRight className="w-5 h-5" />
                عودة للمجلدات
            </Button>
            <div className="flex items-center gap-4 bg-primary/5 px-6 py-4 rounded-[2rem] w-fit border border-primary/10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{folderName}</h3>
            </div>
            
            <div className="grid gap-6">
                {folderQuizzes.length === 0 ? (
                    <div className="text-center py-20 parchment-card rounded-[3rem] border-2 border-dashed border-[#d4c3a3]">
                        <p className="text-slate-500 font-bold">لا توجد اختبارات هنا.</p>
                    </div>
                ) : folderQuizzes.map(quiz => (
                    <Card key={quiz.id} className="parchment-card border-none shadow-md hover:shadow-xl transition-premium group overflow-hidden rounded-[2.5rem]">
                        <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-center justify-between p-8 gap-8">
                            <div className="flex items-center gap-6 text-right w-full sm:w-auto">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-premium shadow-inner shrink-0">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-primary transition-colors">{quiz.title}</p>
                                {quiz.description && (
                                <p className="text-sm text-slate-500 font-bold line-clamp-1 mt-1">{quiz.description}</p>
                                )}
                            </div>
                            </div>
                            <Link href={`/take-quiz/${quiz.share_code}`} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-14 px-10 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-premium bg-slate-900 text-white hover:scale-105">ابدأ الاختبار</Button>
                            </Link>
                        </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )
  }

  if (selectedTeacherId !== null) {
      // LEVEL 2: Folders & Loose Quizzes of a Teacher
      const teacherQuizzes = quizzes.filter(q => q.teacher_id === selectedTeacherId);
      const teacherName = teacherQuizzes[0]?.teacher_name || '';
      
      const foldersMap = new Map<string, { id: string, name: string, count: number }>();
      const looseQuizzes: Quiz[] = [];

      teacherQuizzes.forEach(q => {
          if (q.folder_id && q.folder_name) {
             if (!foldersMap.has(q.folder_id)) {
                 foldersMap.set(q.folder_id, { id: q.folder_id, name: q.folder_name, count: 0 })
             }
             foldersMap.get(q.folder_id)!.count++;
          } else {
             looseQuizzes.push(q);
          }
      })
      const foldersList = Array.from(foldersMap.values());

      return (
        <div className="space-y-8 pb-10 animate-in slide-in-from-left-8 duration-300">
            <Button variant="ghost" onClick={() => setSelectedTeacherId(null)} className="gap-2 text-primary font-black hover:bg-primary/10 rounded-2xl h-12 px-6 transition-premium">
                <ArrowRight className="w-5 h-5" />
                عودة للمعلمين
            </Button>
            <div className="flex items-center gap-4 bg-primary/5 px-6 py-4 rounded-[2rem] w-fit border border-primary/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                    <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{teacherName}</h3>
            </div>
            
            {foldersList.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-xl font-black text-primary/80 px-2">المجلدات</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {foldersList.map(f => (
                            <Card key={f.id} onClick={() => setSelectedFolderId(f.id)} className="parchment-card border-none shadow-md hover:shadow-xl transition-premium group overflow-hidden rounded-[2.5rem] cursor-pointer">
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-premium">
                                            <FolderOpen className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-primary">{f.name}</h4>
                                            <p className="text-sm text-slate-500 font-bold">{f.count} اختبارات</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {looseQuizzes.length > 0 && (
                <div className="space-y-4 pt-6">
                    <h4 className="text-xl font-black text-primary/80 px-2">اختبارات أخرى</h4>
                    <div className="grid gap-6">
                        {looseQuizzes.map(quiz => (
                            <Card key={quiz.id} className="parchment-card border-none shadow-md hover:shadow-xl transition-premium group overflow-hidden rounded-[2.5rem]">
                                <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row items-center justify-between p-8 gap-8">
                                    <div className="flex items-center gap-6 text-right w-full sm:w-auto">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-premium shadow-inner shrink-0">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-primary transition-colors">{quiz.title}</p>
                                        {quiz.description && (
                                        <p className="text-sm text-slate-500 font-bold line-clamp-1 mt-1">{quiz.description}</p>
                                        )}
                                    </div>
                                    </div>
                                    <Link href={`/take-quiz/${quiz.share_code}`} className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full h-14 px-10 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-premium bg-slate-900 text-white hover:scale-105">ابدأ الاختبار</Button>
                                    </Link>
                                </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )
  }

  // LEVEL 1: Teachers List
  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">مكتبة الاختبارات</h1>
          <p className="text-primary/70 mt-2 text-lg font-medium">تصفح اختبارات معلميك بكل سهولة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachersList.length === 0 ? (
          <div className="col-span-full text-center py-24 parchment-card rounded-[4rem] border-4 border-dashed border-[#d4c3a3]/50">
             <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <Library className="w-12 h-12 text-primary opacity-20" />
            </div>
            <h3 className="text-3xl font-black text-slate-400">لا توجد اختبارات متاحة</h3>
            <p className="text-slate-400 mt-4 text-lg font-bold">بانتظار قيام المعلمين بنشر اختباراتهم.</p>
          </div>
        ) : (
            teachersList.map((teacher) => (
            <Card key={teacher.id} onClick={() => setSelectedTeacherId(teacher.id)} className="parchment-card border-none shadow-lg transition-premium hover:scale-[1.05] hover:shadow-2xl rounded-[2.5rem] overflow-hidden group cursor-pointer">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-6 text-xl flex-1 group-hover:text-primary transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-premium">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="font-black text-slate-800 dark:text-white group-hover:text-primary block">{teacher.name}</span>
                    <span className="text-sm font-bold text-slate-500 mt-1 block">{teacher.count} اختبار متاح</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
