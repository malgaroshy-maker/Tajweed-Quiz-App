'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

function generateHalaqahCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'H-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createHalaqahAction(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!name) return

  const code = generateHalaqahCode()

  await supabase
    .from('halaqat')
    .insert({
      teacher_id: user.id,
      name,
      description,
      code
    })

  revalidatePath('/teacher/halaqat')
}

export async function deleteHalaqahAction(halaqahId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('halaqat')
    .delete()
    .eq('id', halaqahId)
    .eq('teacher_id', user.id)

  revalidatePath('/teacher/halaqat')
}

export async function removeStudentFromHalaqahAction(halaqahId: string, studentId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // Verify teacher owns the halaqah
  const { data: halaqah } = await supabase
    .from('halaqat')
    .select('id')
    .eq('id', halaqahId)
    .eq('teacher_id', user.id)
    .single()

  if (!halaqah) return

  await supabase
    .from('halaqah_members')
    .delete()
    .eq('halaqah_id', halaqahId)
    .eq('student_id', studentId)

  revalidatePath('/teacher/halaqat')
}
