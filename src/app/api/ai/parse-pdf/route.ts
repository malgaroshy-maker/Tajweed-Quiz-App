import { NextResponse } from 'next/server'
import * as pdfModule from 'pdf-parse'

// Polyfill browser globals for pdf.js (used by pdf-parse) in Node serverless
if (typeof global.DOMMatrix === 'undefined') (global as any).DOMMatrix = class DOMMatrix {};
if (typeof global.ImageData === 'undefined') (global as any).ImageData = class ImageData {};
if (typeof global.Path2D === 'undefined') (global as any).Path2D = class Path2D {};

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // cast module to any to bypass TS error for default export
    const pdf = (pdfModule as any).default || pdfModule
    
    const data = await pdf(buffer)

    return NextResponse.json({ text: data.text })
  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to parse PDF', details: errorMessage }, { status: 500 })
  }
}
