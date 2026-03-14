import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch user's custom API key and model preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('openrouter_api_key, openrouter_model, gemini_api_key, gemini_model, ai_provider')
    .eq('id', user.id)
    .single()

  const provider = profile?.ai_provider || 'openrouter'

  const { topic, difficulty, count } = await req.json()

  if (!topic || !difficulty || !count) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const systemPrompt = `أنت خبير في علم التجويد ومعلم للقرآن الكريم. 
قم بتوليد ${count} أسئلة عن موضوع "${topic}" بمستوى صعوبة "${difficulty}".
الأسئلة يجب أن تكون باللغة العربية.
قم بإرجاع النتيجة بصيغة JSON فقط كالتالي:
[
  {
    "text": "نص السؤال هنا",
    "type": "multiple_choice",
    "options": [
      { "text": "خيار 1", "is_correct": true },
      { "text": "خيار 2", "is_correct": false },
      { "text": "خيار 3", "is_correct": false },
      { "text": "خيار 4", "is_correct": false }
    ],
    "explanation": "شرح الإجابة"
  }
]
استخدم أنواع أسئلة متعددة إن أمكن مثل multiple_choice أو true_false.
النتيجة يجب أن تحتوي على مصفوفة JSON فقط بدون أي نصوص إضافية أو علامات Markdown.`

  try {
    let parsedData;

    if (provider === 'gemini') {
      const gApiKey = profile?.gemini_api_key || process.env.GEMINI_API_KEY
      if (!gApiKey) {
        return NextResponse.json({ error: 'Gemini API Key is missing. Please configure it in Settings.' }, { status: 400 })
      }

      const genAI = new GoogleGenerativeAI(gApiKey)
      const model = genAI.getGenerativeModel({ model: profile?.gemini_model || 'gemini-2.0-flash' })
      const response = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })

      const textResult = response.response.text() || "[]"
      parsedData = JSON.parse(textResult)

    } else {
      // OpenRouter logic
      const oApiKey = profile?.openrouter_api_key || process.env.OPENROUTER_API_KEY
      const selectedModel = profile?.openrouter_model || 'auto-quality-free'

      if (!oApiKey) {
        return NextResponse.json({ error: 'OpenRouter API Key is missing. Please configure it in Settings.' }, { status: 400 })
      }

      const requestBody: any = {
        messages: [{ role: 'user', content: systemPrompt }]
      }

      if (selectedModel === 'auto-quality-free') {
        requestBody.models = [
          "meta-llama/llama-3.3-70b-instruct:free",
          "qwen/qwen3-next-80b-a3b-instruct:free",
          "google/gemma-3-27b-it:free"
        ]
      } else {
        requestBody.model = selectedModel
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const err = await response.text()
        return NextResponse.json({ error: `API error: ${err}` }, { status: response.status })
      }

      const data = await response.json()
      let textResult = data.choices[0].message.content

      // Cleanup potential markdown formatting
      textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim()
      parsedData = JSON.parse(textResult)
    }

    return NextResponse.json({ questions: parsedData })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
