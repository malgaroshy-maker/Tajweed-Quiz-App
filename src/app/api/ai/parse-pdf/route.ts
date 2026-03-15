import { NextResponse } from 'next/server'
// Using a dynamic import for pdf2json to ensure compatibility in serverless environments
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Dynamically import pdf2json to bypass build-time module resolution issues
    const PDFParser = (await import('pdf2json')).default;
    const pdfParser = new PDFParser();

    return new Promise((resolve) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF Parser error:', errData)
        resolve(NextResponse.json({ error: 'Failed to parse PDF', details: String(errData) }, { status: 500 }));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        // Extract text from the parsed JSON structure
        const text = pdfData.Pages.map((page: any) => 
          page.Texts.map((textItem: any) => decodeURIComponent(textItem.R[0].T)).join(' ')
        ).join('\n');
        
        resolve(NextResponse.json({ text }));
      });

      pdfParser.parseBuffer(buffer);
    });

  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to parse PDF', details: errorMessage }, { status: 500 })
  }
}
