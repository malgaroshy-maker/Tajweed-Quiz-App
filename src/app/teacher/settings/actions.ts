'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const provider = formData.get('provider') as string
  const openrouterKey = formData.get('openrouter_key') as string
  const openrouterModel = formData.get('openrouter_model') as string
  const geminiKey = formData.get('gemini_key') as string
  const geminiModel = formData.get('gemini_model') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      ai_provider: provider || 'openrouter',
      openrouter_api_key: openrouterKey || null,
      openrouter_model: openrouterModel || 'auto-quality-free',
      gemini_api_key: geminiKey || null,
      gemini_model: geminiModel || 'gemini-2.5-flash',
    })
    .eq('id', user.id)

  if (!error) {
    revalidatePath('/teacher/settings')
    revalidatePath('/teacher/ai')
  }
}
