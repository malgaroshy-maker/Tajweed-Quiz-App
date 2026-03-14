import { NextResponse } from 'next/server'
// Import as namespace or check named exports
import * as PDFParseModule from 'pdf-parse'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Access the default export or the class from the module
    // Based on common patterns, it might be PDFParseModule.default or PDFParseModule.PDFParse
    const pdfParser = (PDFParseModule as any).PDFParse || (PDFParseModule as any).default || PDFParseModule
    
    // Assuming PDFParse is a class as in the example I saw earlier
    const parser = new pdfParser({ data: buffer })
    const data = await parser.getText()

    return NextResponse.json({ text: data.text })
  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to parse PDF', details: errorMessage }, { status: 500 })
  }
}
