import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, firstMessage } = await req.json()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('openrouter_api_key, openrouter_model, gemini_api_key, gemini_model, ai_provider')
    .eq('id', user.id)
    .single()

  const provider = profile?.ai_provider || 'gemini'
  const systemPrompt = "قم بتلخيص الرسالة التالية إلى عنوان قصير جداً باللغة العربية (3 إلى 4 كلمات كحد أقصى) ليكون عنواناً لجلسة محادثة تجويد. أجب بالنص النهائي للعنوان فقط دون علامات تنصيص."

  try {
    let title = "محادثة تجويد جديدة";
    let generated = false;

    if (provider === 'gemini') {
      const gApiKey = profile?.gemini_api_key || process.env.GEMINI_API_KEY
      if (!gApiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 400 })
      
      const ai = new GoogleGenAI({ apiKey: gApiKey, httpOptions: { timeout: 6000 } })
      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash']

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: `${systemPrompt}\n\nنص الرسالة: ${firstMessage}`,
          })

          if (response.text) {
            title = response.text
            generated = true
            break
          }
        } catch {
          // Try next candidate
        }
      }
    }

    if (!generated) {
      const oApiKey = profile?.openrouter_api_key || process.env.OPENROUTER_API_KEY
      const selectedModel = profile?.openrouter_model || 'auto-quality-free'

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${oApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel === 'auto-quality-free' ? 'openrouter/free' : selectedModel,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: firstMessage }],
        }),
      })
      const data = await response.json()
      title = data?.choices?.[0]?.message?.content || title
    }

    const cleanTitle = title.replace(/['"«»]/g, '').trim()
    await supabase.from('ai_chat_sessions').update({ title: cleanTitle }).eq('id', sessionId)
    return NextResponse.json({ title: cleanTitle })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
