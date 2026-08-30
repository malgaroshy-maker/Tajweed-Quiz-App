import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { getAiApiKeys } from '@/lib/ai-env'

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FileData {
  name: string;
  type: string;
  data: string; // base64
}

// Helper to extract text from PDF for OpenRouter fallback
async function parsePdfBase64(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');
  const PDFParser = (await import('pdf2json')).default;
  const pdfParser = new PDFParser();

  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => reject(new Error(String(errData))));
    pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: { Texts: { R: { T: string }[] }[] }[] }) => {
      const extractedText = pdfData.Pages.map(page => 
        page.Texts.map(textItem => {
          let text = decodeURIComponent(textItem.R[0].T);
          if (/[\u0600-\u06FF]/.test(text)) {
            text = text.split('').reverse().join('');
          }
          return text;
        }).join(' ')
      ).join('\n');
      resolve(extractedText);
    });
    pdfParser.parseBuffer(buffer);
  });
}

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

  const provider = profile?.ai_provider || 'gemini'
  const { messages, file }: { messages: ChatMessage[], file?: FileData } = await req.json()

  const systemPrompt = `أنت المساعد الذكي المتخصص في علم التجويد والقراءات القرآنية التابع لمنصة "القلم".
تجيب على أسئلة المعلمين والمعلمات والطلاب بأسلوب تربوي رصين، مبسط، ومدعوم بالأدلة من متون التجويد (تحفة الأطفال، الجزرية، الشاطبية).

إذا تم تزويدك بصفحة مصحف، صورة، أو نص من كتاب، قم بتحليل أحكام التجويد بدقة واستخراج الحروف والشواهد.
يمكنك اقتراح أسئلة اختبار متنوعة (MCQ, True/False, Fill in Blank, Voice Recitation).

إذا اقترحت أسئلة، ضعها في نهاية رسالتك داخل وسم خاص هكذا:
<questions>
[{"text": "...", "type": "multiple_choice", "tajweed_rule": "...", "options": [{"text": "...", "is_correct": true}, ...], "explanation": "...", "topic": "..."}]
</questions>`

  try {
    let aiResponse = "";
    let generated = false;

    const { geminiApiKey: gApiKey, openrouterApiKey: oApiKey } = getAiApiKeys(profile)

    if (provider === 'gemini') {
      if (!gApiKey) {
        // If Gemini selected but key not configured, check if OpenRouter is available
        if (!oApiKey) {
          return NextResponse.json({ error: 'مفتاح Gemini API غير متوفر. يرجى ضبطه في الإعدادات.' }, { status: 400 })
        }
      } else {
        const ai = new GoogleGenAI({ apiKey: gApiKey, httpOptions: { timeout: 18000 } })
        const requestedModel = profile?.gemini_model || 'gemini-3.7-flash'
        const candidateModels = Array.from(new Set([
          requestedModel,
          'gemini-3.5-flash-lite',
          'gemini-3.5-flash',
          'gemini-3.7-flash',
          'gemini-3.6-flash'
        ]))

        // Build contents array for GoogleGenAI
        const contents = []

        // Add prior message history
        for (const m of messages.slice(0, -1)) {
          contents.push({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })
        }

        // Format last message with optional multimodal file
        const lastMsg = messages[messages.length - 1]
        const lastParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = []

        if (file && file.data) {
          const rawBase64 = file.data.includes(',') ? file.data.split(',')[1] : file.data;
          const cleanBase64 = rawBase64.replace(/\s/g, '');
          const mimeType = file.type || (file.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

          lastParts.push({
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          })
        }

        lastParts.push({ text: lastMsg ? lastMsg.content : 'مرحباً' })

        contents.push({
          role: 'user',
          parts: lastParts
        })

        for (const modelName of candidateModels) {
          try {
            const isThinkingSupported = modelName.includes('3.7')
            const callConfig: Record<string, unknown> = {
              systemInstruction: systemPrompt,
              temperature: 0.4,
            }
            if (isThinkingSupported) {
              callConfig.thinkingConfig = {
                thinkingLevel: ThinkingLevel.LOW
              }
            }

            const response = await ai.models.generateContent({
              model: modelName,
              contents: contents,
              config: callConfig
            })

            if (response.text) {
              aiResponse = response.text
              generated = true
              break
            }
          } catch (err: any) {
            console.warn(`[AI Chat] Gemini candidate '${modelName}' unavailable (${err?.status || err?.message}). Trying next fallback...`)
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
        return NextResponse.json({ error: 'مفتاح OpenRouter API غير متوفر. يرجى ضبطه في الإعدادات.' }, { status: 400 })
      }

      const finalMessages = [...messages];

      if (file && file.data) {
        const isImage = (file.type && file.type.startsWith('image/')) || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name || '');
        const rawBase64 = file.data.includes(',') ? file.data.split(',')[1] : file.data;
        const cleanBase64 = rawBase64.replace(/\s/g, '');

        if (isImage) {
          const mimeType = file.type || 'image/jpeg';
          const dataUri = `data:${mimeType};base64,${cleanBase64}`;
          const lastMsgIndex = finalMessages.length - 1;
          const userText = finalMessages[lastMsgIndex]?.content || "يرجى تحليل هذه الصورة واستخراج وتطبيق أحكام التجويد منها:";
          
          (finalMessages as any)[lastMsgIndex] = {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: dataUri } }
            ]
          };
        } else {
          let extractedText = "";
          if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
            extractedText = await parsePdfBase64(cleanBase64);
          }
          const lastMsgIndex = finalMessages.length - 1;
          finalMessages[lastMsgIndex] = {
            ...finalMessages[lastMsgIndex],
            content: finalMessages[lastMsgIndex].content + `\n\n[محتوى الملف المرفق: ${file.name}]\n${extractedText.slice(0, 50000)}`
          };
        }
      }

      const requestPayload: Record<string, unknown> = {
        messages: [{ role: 'system', content: systemPrompt }, ...finalMessages],
      };

      if (selectedModel === 'auto-quality-free') {
        const hasImage = file && ((file.type && file.type.startsWith('image/')) || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name || ''));
        if (hasImage) {
          requestPayload.models = [
            "minimax/minimax-m3:free",
            "openrouter/free",
            "nvidia/nemotron-3.5-lightning:free",
            "nvidia/nemotron-3-super-120b-a12b:free"
          ];
        } else {
          requestPayload.models = [
            "nvidia/nemotron-3.5-lightning:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "minimax/minimax-m3:free",
            "minimax/minimax-m2.7:free",
            "openrouter/free"
          ];
        }
      } else {
        requestPayload.model = selectedModel;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tajweed-quiz-app.vercel.app',
          'X-Title': 'Al-Qalam Tajweed Quiz App',
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()
      if (data.error) {
        console.error("[OpenRouter Error Response]:", data.error);
        return NextResponse.json({ 
          error: `خطأ من مزود الذكاء الاصطناعي: ${data.error.message || 'تعذر معالجة الطلب'}` 
        }, { status: response.status || 500 });
      }

      aiResponse = data.choices?.[0]?.message?.content || ""
    }

    return NextResponse.json({ message: aiResponse })
  } catch (error: unknown) {
    console.error("AI Chat Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء المحادثة مع المساعد الذكي';
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
