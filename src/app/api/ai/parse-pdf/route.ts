import { NextResponse } from 'next/server'

// Polyfill browser globals
if (typeof (global as any).DOMMatrix === 'undefined') (global as any).DOMMatrix = class DOMMatrix {};
if (typeof (global as any).ImageData === 'undefined') (global as any).ImageData = class ImageData {};
if (typeof (global as any).Path2D === 'undefined') (global as any).Path2D = class Path2D {};
if (typeof (global as any).HTMLCanvasElement === 'undefined') (global as any).HTMLCanvasElement = class HTMLCanvasElement {};

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Use the installed pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdf = require('pdf-parse');
    
    // Extract text specifically, avoiding rendering
    const data = await pdf(buffer, {
        pagerender: (pageData: any) => {
            return pageData.getTextContent().then((textContent: any) => {
                return textContent.items.map((item: any) => item.str).join(' ');
            });
        }
    })

    return NextResponse.json({ text: data.text })
  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to parse PDF', details: errorMessage }, { status: 500 })
  }
}
