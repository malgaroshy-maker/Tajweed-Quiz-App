import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const { PDFParse } = await import('pdf-parse')
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Instantiate PDFParse
    const parser = new PDFParse({ data: buffer })
    const data = await parser.getText()

    return NextResponse.json({ text: data.text })
  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to parse PDF', details: errorMessage }, { status: 500 })
  }
}
