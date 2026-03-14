import { NextResponse } from 'next/server'

// Polyfill browser globals *before* pdf-parse is imported,
// but they need to be available globally before any module execution tries to access them.
// Setting them at the top level is fine in Node, as long as it happens before pdf-parse is evaluated.
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (global as any).ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {};
}
if (typeof (global as any).Path2D === 'undefined') {
  (global as any).Path2D = class Path2D {};
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Dynamic import here ensures pdf-parse evaluation happens AFTER polyfills are set
    const pdfModule = await import('pdf-parse');
    const pdf = (pdfModule as any).default || pdfModule;
    
    const data = await pdf(buffer)

    return NextResponse.json({ text: data.text })
  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to parse PDF', details: errorMessage }, { status: 500 })
  }
}
