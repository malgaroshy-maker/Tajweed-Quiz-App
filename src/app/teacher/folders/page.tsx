import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { FolderPlus, FolderOpen, Trash2 } from 'lucide-react'
import { createFolder, deleteFolder } from './actions'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-foreground tracking-tight">مجلداتي</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createFolder} className="flex gap-2">
            <Input name="name" placeholder="اسم المجلد الجديد..." required className="max-w-xs" />
            <Button type="submit">
              <FolderPlus className="ml-2 h-4 w-4" />
              إضافة
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders?.length === 0 ? (
          <p className="text-muted-foreground col-span-full">لا توجد مجلدات بعد. قم بإنشاء مجلدك الأول!</p>
        ) : (
          folders?.map((folder) => (
            <Card key={folder.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <a href={`/teacher/folders/${folder.id}`} className="flex items-center gap-3 text-lg flex-1">
                  <FolderOpen className="text-blue-500" />
                  <span className="font-semibold">{folder.name}</span>
                </a>
                <form action={deleteFolder.bind(null, folder.id)}>
                  <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
