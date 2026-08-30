import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

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

    if (provider === 'gemini') {
      const gApiKey = profile?.gemini_api_key || process.env.GEMINI_API_KEY
      if (!gApiKey) {
        return NextResponse.json({ error: 'مفتاح Gemini API غير متوفر. يرجى ضبطه في الإعدادات.' }, { status: 400 })
      }

      const ai = new GoogleGenAI({ apiKey: gApiKey })
      const modelName = profile?.gemini_model || 'gemini-3.7-flash'

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
        lastParts.push({
          inlineData: {
            mimeType: file.type || 'application/pdf',
            data: file.data
          }
        })
      }

      lastParts.push({ text: lastMsg ? lastMsg.content : 'مرحباً' })

      contents.push({
        role: 'user',
        parts: lastParts
      })

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.4
        }
      })

      aiResponse = response.text || ""

    } else {
      // OpenRouter fallback
      const oApiKey = profile?.openrouter_api_key || process.env.OPENROUTER_API_KEY
      const selectedModel = profile?.openrouter_model || 'auto-quality-free'

      if (!oApiKey) {
        return NextResponse.json({ error: 'مفتاح OpenRouter API غير متوفر.' }, { status: 400 })
      }

      const finalMessages = [...messages];

      if (file) {
        let extractedText = "";
        if (file.type === 'application/pdf') {
          extractedText = await parsePdfBase64(file.data);
        } else {
          extractedText = "[تم إرفاق ملف/صورة، يرجى التبديل لمزود Gemini للتحليل البصري المباشر]";
        }

        const lastMsgIndex = finalMessages.length - 1;
        finalMessages[lastMsgIndex] = {
          ...finalMessages[lastMsgIndex],
          content: finalMessages[lastMsgIndex].content + `\n\n[محتوى الملف المرفق: ${file.name}]\n${extractedText.slice(0, 50000)}`
        };
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel === 'auto-quality-free' ? 'google/gemini-3.7-flash' : selectedModel,
          messages: [{ role: 'system', content: systemPrompt }, ...finalMessages],
        }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error.message || "OpenRouter API Error");
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
