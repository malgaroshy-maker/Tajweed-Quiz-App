'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFolder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const name = formData.get('name') as string
  const parent_id = formData.get('parent_id') as string | null

  await supabase
    .from('folders')
    .insert({ teacher_id: user.id, name, parent_id })

  revalidatePath('/teacher/folders')
}

export async function deleteFolder(id: string) {
  const supabase = await createClient()
  await supabase.from('folders').delete().eq('id', id)
  
  revalidatePath('/teacher/folders')
}

export async function renameFolder(id: string, newName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await supabase
    .from('folders')
    .update({ name: newName })
    .eq('id', id)
    .eq('teacher_id', user.id)

  revalidatePath('/teacher/folders')
}
