import { NextResponse } from 'next/server'
import PDFParser from 'pdf2json'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create an instance
    const pdfParser = new PDFParser();

    // Promisify the parsing process
    const text: string = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => {
        console.error('PDF Parser error:', errData)
        reject(new Error(String(errData)));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: { Texts: { R: { T: string }[] }[] }[] }) => {
        // Extract text from the parsed JSON structure
        const extractedText = pdfData.Pages.map(page => 
          page.Texts.map(textItem => decodeURIComponent(textItem.R[0].T)).join(' ')
        ).join('\n');
        
        resolve(extractedText);
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({ text });

  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to parse PDF', details: errorMessage }, { status: 500 })
  }
}
