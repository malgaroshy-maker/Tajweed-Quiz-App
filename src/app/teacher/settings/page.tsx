import { createClient } from '@/utils/supabase/server'
import { SettingsPageClient } from './client-page'

const CURATED_OPENROUTER_MODELS = [
  { id: 'auto-quality-free', name: '⚡ التوجيه الذكي التلقائي (الأسرع والأعلى دقة مجاناً)', description: 'توجيه فوري لأسرع وأدق نموذج مجاني في التجويد (Nemotron Lightning/Super)' },
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'NVIDIA Nemotron 3.5 Lightning (~350ms - دقة 100%)', description: 'أعلى دقة في أحكام التجويد وصياغة الأسئلة مع سرعة فائقة' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA Nemotron Super 120B (عملاق الاستدلال اللغوي)', description: 'نموذج ضخم 120 مليار معامل لصياغة التعليلات التجويدية العميقة' },
  { id: 'minimax/minimax-m3:free', name: 'MiniMax M3 (سياق ضخم 1M - للملازم والكتب)', description: 'مناسب لتحليل النصوص والكتب التجويدية الطويلة' },
  { id: 'minimax/minimax-m2.7:free', name: 'MiniMax M2.7 (خفيف ومتوازن)', description: 'نموذج سريع ومستقر للأسئلة المباشرة' },
  { id: 'openrouter/free', name: 'موجّه النماذج المجانية المفتوح (OpenRouter Free Router)', description: 'توزيع الحمل على جميع النماذج المجانية المتاحة' }
]

async function getOpenRouterModels() {
  return CURATED_OPENROUTER_MODELS
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

  return (
    <SettingsPageClient 
      profile={profile} 
      freeModels={allModels} 
      paidModels={[]}
      geminiModels={geminiModels}
    />
  )
}