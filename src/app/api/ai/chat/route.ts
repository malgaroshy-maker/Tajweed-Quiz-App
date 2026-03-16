import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
    
    // Dynamic import to avoid loading canvas dependencies unless necessary
    const PDFParser = (await import('pdf2json')).default;
    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => reject(new Error(String(errData))));
        pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: { Texts: { R: { T: string }[] }[] }[] }) => {
            const extractedText = pdfData.Pages.map(page => 
                page.Texts.map(textItem => {
                    let text = decodeURIComponent(textItem.R[0].T);
                    // Basic heuristic to reverse RTL strings (like Arabic) that pdf2json extracts backwards
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

  const provider = profile?.ai_provider || 'openrouter'
  const { messages, file }: { messages: ChatMessage[], file?: FileData } = await req.json()

  const systemPrompt = `أنت خبير في علم التجويد ومعلم للقرآن الكريم. تجيب على أسئلة المعلمات بأسلوب تربوي، مبسط، وواضح.
  
  إذا تم تزويدك بنص من كتاب أو ملف، قم بتحليله واستخراج أحكام التجويد منه.
  يمكنك أيضاً اقتراح أسئلة اختبار (Multiple Choice, True/False, Fill in Blank).
  
  اجعل ردودك واضحة ومباشرة للمعلم. لا تستخدم تنسيق JSON في صلب رسالتك.
  إذا اقترحت أسئلة، ضعها في نهاية رسالتك داخل وسم خاص هكذا:
  <questions>
  [{"text": "...", "type": "multiple_choice", "options": [{"text": "...", "is_correct": true}, ...], "explanation": "...", "topic": "..."}]
  </questions>
  هذا الوسم لن يظهر للمعلم بشكل سيء، وسأقوم أنا بمعالجته لحفظ الأسئلة.`

  try {
    let aiResponse = "";

    if (provider === 'gemini') {
      const gApiKey = profile?.gemini_api_key || process.env.GEMINI_API_KEY
      if (!gApiKey) {
        return NextResponse.json({ error: 'Gemini API Key is missing.' }, { status: 400 })
      }
      
      const genAI = new GoogleGenerativeAI(gApiKey)
      const model = genAI.getGenerativeModel({ model: profile?.gemini_model || 'gemini-2.0-flash' })
      
      const history = messages.slice(0, -1).map((m: ChatMessage) => ({
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
      
      let result;
      if (file) {
          const filePart = {
              inlineData: {
                  data: file.data,
                  mimeType: file.type
              }
          };
          result = await chat.sendMessage([filePart, lastMessage]);
      } else {
          result = await chat.sendMessage(lastMessage)
      }
      
      aiResponse = result.response.text() || ""

    } else {
      // OpenRouter
      const oApiKey = profile?.openrouter_api_key || process.env.OPENROUTER_API_KEY
      const selectedModel = profile?.openrouter_model || 'auto-quality-free'
      if (!oApiKey) {
        return NextResponse.json({ error: 'OpenRouter API Key is missing.' }, { status: 400 })
      }
      
      const finalMessages = [...messages];
      
      // If there's a file, we must extract text manually because OpenRouter doesn't natively support files (mostly)
      if (file) {
          let extractedText = "";
          if (file.type === 'application/pdf') {
              extractedText = await parsePdfBase64(file.data);
          } else {
              extractedText = "[تم إرفاق صورة، ولكن المزود الحالي لا يدعم قراءة الصور. يرجى استخدام Gemini لقراءة الصور.]";
          }
          
          const lastMsgIndex = finalMessages.length - 1;
          finalMessages[lastMsgIndex] = {
              ...finalMessages[lastMsgIndex],
              content: finalMessages[lastMsgIndex].content + `\n\n[محتوى الملف المرفق: ${file.name}]\n${extractedText.slice(0, 100000)}`
          };
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel === 'auto-quality-free' ? 'meta-llama/llama-3.3-70b-instruct:free' : selectedModel,
          messages: [{ role: 'system', content: systemPrompt }, ...finalMessages],
        }),
      })
      const data = await response.json()
      
      if (data.error) {
          throw new Error(data.error.message || "OpenRouter API Error");
      }
      
      aiResponse = data.choices[0].message.content
    }

    return NextResponse.json({ message: aiResponse })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
