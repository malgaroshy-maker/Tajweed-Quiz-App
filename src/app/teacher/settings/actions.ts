'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const provider = formData.get('provider') as string
  const openrouterKey = formData.get('openrouter_key') as string | null
  const openrouterModel = formData.get('openrouter_model') as string | null
  const geminiKey = formData.get('gemini_key') as string | null
  const geminiModel = formData.get('gemini_model') as string | null

  const updateData: Record<string, unknown> = {
    ai_provider: provider || 'gemini',
  }

  if (openrouterKey !== null) {
    updateData.openrouter_api_key = openrouterKey.trim() || null
  }
  if (openrouterModel !== null) {
    updateData.openrouter_model = openrouterModel.trim() || 'auto-quality-free'
  }
  if (geminiKey !== null) {
    updateData.gemini_api_key = geminiKey.trim() || null
  }
  if (geminiModel !== null) {
    updateData.gemini_model = geminiModel.trim() || 'gemini-3.7-flash'
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (!error) {
    revalidatePath('/teacher/settings')
    revalidatePath('/teacher/ai')
  }
}
