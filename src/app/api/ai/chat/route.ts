import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('openrouter_api_key, openrouter_model, gemini_api_key, gemini_model, ai_provider')
    .eq('id', user.id)
    .single()

  const provider = profile?.ai_provider || 'openrouter'
  const { messages } = await req.json()

  const systemPrompt = `أنت خبير في علم التجويد ومعلم للقرآن الكريم. تجيب على أسئلة المعلمات بأسلوب تربوي، مبسط، وواضح.
  
  إذا تم تزويدك بنص من كتاب أو ملف، قم بتحليله واستخراج أحكام التجويد منه.
  يمكنك أيضاً اقتراح أسئلة اختبار (Multiple Choice, True/False, Fill in Blank).
  
  اجعل ردودك واضحة ومباشرة للمعلمة. لا تستخدم تنسيق JSON في صلب رسالتك.
  إذا اقترحت أسئلة، ضعها في نهاية رسالتك داخل وسم خاص هكذا:
  <questions>
  [{"text": "...", "type": "multiple_choice", "options": [{"text": "...", "is_correct": true}, ...], "explanation": "...", "topic": "..."}]
  </questions>
  هذا الوسم لن يظهر للمعلمة بشكل سيء، وسأقوم أنا بمعالجته لحفظ الأسئلة.`

  try {
    let aiResponse = "";

    if (provider === 'gemini') {
      const gApiKey = profile?.gemini_api_key || process.env.GEMINI_API_KEY
      if (!gApiKey) {
        return NextResponse.json({ error: 'Gemini API Key is missing.' }, { status: 400 })
      }
      
      const genAI = new GoogleGenerativeAI(gApiKey)
      const model = genAI.getGenerativeModel({ model: profile?.gemini_model || 'gemini-2.0-flash' })
      
      // Formatting messages for Gemini
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))

      const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "مفهوم، أنا جاهز للمساعدة." }] },
            ...history
        ]
      })

      const lastMessage = messages[messages.length - 1].content
      const result = await chat.sendMessage(lastMessage)
      aiResponse = result.response.text() || ""

    } else {
      // OpenRouter
      const oApiKey = profile?.openrouter_api_key || process.env.OPENROUTER_API_KEY
      const selectedModel = profile?.openrouter_model || 'auto-quality-free'
      if (!oApiKey) {
        return NextResponse.json({ error: 'OpenRouter API Key is missing.' }, { status: 400 })
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel === 'auto-quality-free' ? 'meta-llama/llama-3.3-70b-instruct:free' : selectedModel,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      })
      const data = await response.json()
      aiResponse = data.choices[0].message.content
    }

    return NextResponse.json({ message: aiResponse })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
