import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { getAiApiKeys } from '@/lib/ai-env'

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

  const provider = profile?.ai_provider || 'gemini'

  const { topic, difficulty, count, questionTypes } = await req.json()

  if (!topic || !difficulty || !count) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const selectedTypes = questionTypes && questionTypes.length > 0 
    ? questionTypes.join(', ') 
    : 'multiple_choice, true_false, fill_in_blank, voice_recitation, tajweed_rule'

  const systemPrompt = `أنت خبير ومجاز في علم التجويد والقراءات القرآنية ومعلم متمرس للقرآن الكريم. 
قم بتوليد ${count} أسئلة تجويد دقيقة عن موضوع "${topic}" بمستوى صعوبة "${difficulty}".
الأسئلة يجب أن تكون باللغة العربية مع مراعاة دقة ضبط الآيات القرآنية ورسم المصحف.
الأنواع المسموح بتوليدها: ${selectedTypes}.

قم بإرجاع النتيجة بصيغة JSON فقط متوافقة مع هذا الهيكل:
[
  {
    "text": "نص السؤال هنا (إذا كان آية قرآنية، ضعها مضبوطة بالشكل)",
    "type": "multiple_choice | true_false | fill_in_blank | voice_recitation | tajweed_rule",
    "tajweed_rule": "اسم الحكم التجويدي مثل: إظهار حلقي / إدغام بغنة / قلقلة كبرى / مد لازم",
    "surah_number": 1, 
    "ayah_number": 2,
    "options": [
      { "text": "الخيار الصحيح", "is_correct": true },
      { "text": "خيار خاطئ 1", "is_correct": false },
      { "text": "خيار خاطئ 2", "is_correct": false },
      { "text": "خيار خاطئ 3", "is_correct": false }
    ],
    "explanation": "شرح تفصيلي لحكم التجويد والدليل من تحفة الأطفال أو الشاطبية إن أمكن"
  }
]
ملاحظة لأسئلة fill_in_blank: يجب وضع خيار واحد فقط في options مع is_correct: true يحتوي على الكلمة الصحيحة (أو عدة مرادفات مفصولة بعلامة |).
ملاحظة لأسئلة voice_recitation: نص السؤال يطلب من الطالب قراءة آية معينة مع تطبيق الحكم، وoptions تكون فارغة أو تحتوي معايير التقييم.
النتيجة يجب أن تكون مصفوفة JSON صالحة فقط بدون أي نصوص تمهيدية أو علامات Markdown.`

  try {
    let parsedData;
    let generated = false;

    const { geminiApiKey: gApiKey, openrouterApiKey: oApiKey } = getAiApiKeys(profile)

    if (provider === 'gemini') {
      if (!gApiKey) {
        if (!oApiKey) {
          return NextResponse.json({ error: 'مفتاح Gemini API غير متوفر. يرجى ضبطه في إعدادات الحساب.' }, { status: 400 })
        }
      } else {
        const ai = new GoogleGenAI({ apiKey: gApiKey, httpOptions: { timeout: 18000 } })
        const requestedModel = profile?.gemini_model || 'gemini-3.7-flash'
        const candidateModels = Array.from(new Set([
          requestedModel,
          'gemini-3.1-flash-lite',
          'gemini-3-flash-preview',
          'gemini-3.7-flash',
          'gemini-3.6-flash',
          'gemini-3.5-flash',
          'gemini-3.5-flash-lite'
        ]))

        for (const modelName of candidateModels) {
          try {
            const isThinkingSupported = modelName.includes('3.7')
            const genConfig: Record<string, unknown> = {
              responseMimeType: 'application/json',
              temperature: 0.3,
            }
            if (isThinkingSupported) {
              genConfig.thinkingConfig = {
                thinkingLevel: ThinkingLevel.LOW
              }
            }

            const response = await ai.models.generateContent({
              model: modelName,
              contents: systemPrompt,
              config: genConfig
            })

            const textResult = response.text || '[]'
            parsedData = JSON.parse(textResult)
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              generated = true
              break
            }
          } catch (err: any) {
            console.warn(`[AI Generate] Gemini candidate '${modelName}' unavailable (${err?.status || err?.message}). Trying next fallback...`)
          }
        }
      }
    }

    // If OpenRouter selected or all Gemini candidates failed
    if (!generated) {
      const selectedModel = profile?.openrouter_model || 'auto-quality-free'

      if (!oApiKey) {
        if (provider === 'gemini') {
          return NextResponse.json({ 
            error: 'خوادم Google تواجه ضغطاً مؤقتاً (503/504). يرجى المحاولة بعد قليل أو إضافة مفتاح OpenRouter في الإعدادات كاحتياطي تلقائي.' 
          }, { status: 503 })
        }
        return NextResponse.json({ error: 'مفتاح OpenRouter API غير متوفر. يرجى ضبطه في إعدادات الحساب.' }, { status: 400 })
      }

      const requestBody: Record<string, unknown> = {
        messages: [{ role: 'user', content: systemPrompt }]
      }

      if (selectedModel === 'auto-quality-free') {
        requestBody.models = [
          "nvidia/nemotron-3.5-lightning:free",
          "nvidia/nemotron-3-super-120b-a12b:free",
          "minimax/minimax-m3:free",
          "minimax/minimax-m2.7:free",
          "openrouter/free"
        ]
      } else {
        requestBody.model = selectedModel
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tajweed-quiz-app.vercel.app',
          'X-Title': 'Al-Qalam Tajweed Quiz App',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const err = await response.text()
        return NextResponse.json({ error: `خطأ من مزود الذكاء الاصطناعي: ${err}` }, { status: response.status })
      }

      const data = await response.json()
      let textResult = data.choices?.[0]?.message?.content || '[]'

      textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim()
      parsedData = JSON.parse(textResult)
    }

    return NextResponse.json({ questions: parsedData })

  } catch (error: unknown) {
    console.error('AI Generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء توليد الأسئلة';
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
