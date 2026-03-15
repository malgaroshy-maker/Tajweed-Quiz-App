import { NextResponse } from 'next/server'
const PDFParser = require('pdf2json')

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    const pdfParser = new PDFParser();

    return new Promise((resolve) => {
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('PDF Parser error:', errData)
        resolve(NextResponse.json({ error: 'Failed to parse PDF', details: String(errData) }, { status: 500 }));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        // Extract text from the parsed JSON structure
        const text = pdfData.Pages.map((page: any) => 
          page.Texts.map((text: any) => decodeURIComponent(text.R[0].T)).join(' ')
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
