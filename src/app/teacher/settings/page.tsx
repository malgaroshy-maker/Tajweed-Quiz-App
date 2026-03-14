import { createClient } from '@/utils/supabase/server'
import { SettingsPageClient } from './client-page'

async function getOpenRouterModels() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch models:', error)
    return []
  }
}

async function getGeminiModels(apiKey: string | null) {
  if (!apiKey) return []
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (!res.ok) return []
    const data = await res.json()
    // Filter to only text generation models
    return (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => ({
        id: m.name.replace('models/', ''),
        name: m.displayName,
        description: m.description
      }))
  } catch (error) {
    console.error('Failed to fetch Gemini models:', error)
    return []
  }
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('openrouter_api_key, openrouter_model, gemini_api_key, gemini_model, ai_provider')
    .eq('id', user?.id)
    .single()

  const allModels = await getOpenRouterModels()
  const geminiModels = await getGeminiModels(profile?.gemini_api_key)
  
  // Filter and sort models
  const freeModels = allModels
    .filter((m: any) => parseFloat(m.pricing?.prompt || '1') === 0 && parseFloat(m.pricing?.completion || '1') === 0)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const paidModels = allModels
    .filter((m: any) => parseFloat(m.pricing?.prompt || '1') > 0 || parseFloat(m.pricing?.completion || '1') > 0)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  return (
    <SettingsPageClient 
      profile={profile} 
      freeModels={freeModels} 
      paidModels={paidModels}
      geminiModels={geminiModels}
    />
  )
}