import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { FolderPlus, FolderOpen, Trash2 } from 'lucide-react'
import { createFolder, deleteFolder, renameFolder } from './actions'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RenameDialog } from '@/components/RenameDialog'

export default async function FoldersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: folders } = await supabase
    .from('folders')
    .select('*')
    .eq('teacher_id', user?.id)
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">مجلداتي</h2>
          <p className="text-primary/70 mt-2 text-lg font-medium">تنظيم اختباراتك في مجلدات خاصة لسهولة الوصول</p>
        </div>
      </div>

      <Card className="parchment-card border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8">
          <form action={createFolder} className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 pr-2">اسم المجلد الجديد</label>
                <Input name="name" placeholder="مثلاً: أحكام النون الساكنة..." required className="h-14 rounded-2xl border-2 border-primary/10 bg-white/50 focus-visible:ring-primary font-bold shadow-inner" />
            </div>
            <Button type="submit" className="h-14 px-10 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.05] transition-premium gap-3">
              <FolderPlus className="w-6 h-6" />
              إنشاء المجلد
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {folders?.length === 0 ? (
          <div className="col-span-full text-center py-24 parchment-card rounded-[4rem] border-4 border-dashed border-[#d4c3a3]/50">
             <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <FolderOpen className="w-12 h-12 text-primary opacity-20" />
            </div>
            <h3 className="text-3xl font-black text-slate-400">لا توجد مجلدات بعد</h3>
            <p className="text-slate-400 mt-4 text-lg font-bold">ابدأ بتنظيم عملك بإنشاء أول مجلد لك</p>
          </div>
        ) : (
          folders?.map((folder) => (
            <Card key={folder.id} className="parchment-card border-none shadow-lg transition-premium hover:scale-[1.05] hover:shadow-2xl rounded-[2.5rem] overflow-hidden group cursor-pointer">
              <CardContent className="p-8 flex items-center justify-between">
                <a href={`/teacher/folders/${folder.id}`} className="flex items-center gap-6 text-xl flex-1 group-hover:text-primary transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-premium">
                    <FolderOpen className="w-8 h-8" />
                  </div>
                  <span className="font-black text-slate-800 dark:text-white group-hover:text-primary">{folder.name}</span>
                </a>
                <div className="flex gap-2">
                    <RenameDialog id={folder.id} currentName={folder.name} onRename={renameFolder} />
                    <form action={deleteFolder.bind(null, folder.id)}>
                      <Button variant="ghost" size="icon" type="submit" className="h-12 w-12 rounded-2xl text-destructive hover:bg-red-50 transition-premium border border-transparent hover:border-red-100">
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
