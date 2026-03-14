import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

  const provider = profile?.ai_provider || 'openrouter'
  const systemPrompt = "قم بتلخيص الرسالة التالية إلى عنوان قصير (لا يتجاوز 3 كلمات) ليكون عنواناً لمحادثة. أجب فقط بالعنوان."

  try {
    let title = "محادثة جديدة";
    if (provider === 'gemini') {
        const gApiKey = profile?.gemini_api_key || process.env.GEMINI_API_KEY
        if (!gApiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 400 })
        const genAI = new GoogleGenerativeAI(gApiKey)
        const model = genAI.getGenerativeModel({ model: profile?.gemini_model || 'gemini-2.0-flash' })
        const result = await model.generateContent(`${systemPrompt}\n\nالرسالة: ${firstMessage}`)
        title = result.response.text() || title
    } else {
        const oApiKey = profile?.openrouter_api_key || process.env.OPENROUTER_API_KEY
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${oApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: firstMessage }],
            }),
        })
        const data = await response.json()
        title = data.choices[0].message.content
    }

    await supabase.from('ai_chat_sessions').update({ title: title.replace(/['"]/g, '') }).eq('id', sessionId)
    return NextResponse.json({ title })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
