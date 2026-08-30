'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinHalaqahAction(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const rawCode = (formData.get('code') as string)?.trim().toUpperCase()
  if (!rawCode) return

  // Find the halaqah by code
  const { data: halaqah } = await supabase
    .from('halaqat')
    .select('id, name')
    .eq('code', rawCode)
    .single()

  if (!halaqah) return

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('halaqah_members')
    .select('id')
    .eq('halaqah_id', halaqah.id)
    .eq('student_id', user.id)
    .single()

  if (existingMember) return

  // Join halaqah
  await supabase
    .from('halaqah_members')
    .insert({
      halaqah_id: halaqah.id,
      student_id: user.id
    })

  revalidatePath('/student/halaqat')
  revalidatePath('/student')
}
