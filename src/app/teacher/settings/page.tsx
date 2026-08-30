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

const DEFAULT_GEMINI_MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (الأسرع والأكثر استقراراً - موصى به)', description: 'استجابة فائقة السرعة (1-3 ثوانٍ) واستقرار تام لإنشاء الأسئلة والمحادثة' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash (استدلال هجين وتفكير متقدم)', description: 'الجيل الثالث الأحدث مع قدرات تفكير عميقة للمسائل التجويدية المعقدة' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite (فائق الخفة للعمليات الفورية)', description: 'نموذج فائق الخفة والسرعة لعمليات التوليد وتلخيص العناوين' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (متوازن وعالي الأداء)', description: 'توازن ممتاز بين السرعة وجودة الصياغة التجويدية' },
]

async function getGeminiModels(apiKey: string | null) {
  if (!apiKey) return DEFAULT_GEMINI_MODELS
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (!res.ok) return DEFAULT_GEMINI_MODELS
    const data = await res.json()
    const fetched = (data.models || [])
      .filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: { name: string; displayName: string; description: string }) => ({
        id: m.name.replace('models/', ''),
        name: m.displayName || m.name.replace('models/', ''),
        description: m.description
      }))
    return fetched.length > 0 ? fetched : DEFAULT_GEMINI_MODELS
  } catch (error) {
    console.error('Failed to fetch Gemini models:', error)
    return DEFAULT_GEMINI_MODELS
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
  
  interface ModelPricing {
    prompt: string;
    completion: string;
  }

  interface Model {
    name: string;
    pricing: ModelPricing;
  }

  // Filter and sort models
  const freeModels = allModels
    .filter((m: Model) => parseFloat(m.pricing?.prompt || '1') === 0 && parseFloat(m.pricing?.completion || '1') === 0)
    .sort((a: Model, b: Model) => a.name.localeCompare(b.name))

  const paidModels = allModels
    .filter((m: Model) => parseFloat(m.pricing?.prompt || '1') > 0 || parseFloat(m.pricing?.completion || '1') > 0)
    .sort((a: Model, b: Model) => a.name.localeCompare(b.name))

  return (
    <SettingsPageClient 
      profile={profile} 
      freeModels={freeModels} 
      paidModels={paidModels}
      geminiModels={geminiModels}
    />
  )
}