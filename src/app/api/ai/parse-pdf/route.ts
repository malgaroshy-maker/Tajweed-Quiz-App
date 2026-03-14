import { NextResponse } from 'next/server'

// Polyfill browser globals to satisfy pdf.js dependencies
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (global as any).ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {};
}
if (typeof (global as any).Path2D === 'undefined') {
  (global as any).Path2D = class Path2D {};
}

// Ensure Canvas polyfill is minimal to satisfy PDFJS
if (typeof (global as any).HTMLCanvasElement === 'undefined') {
    (global as any).HTMLCanvasElement = class HTMLCanvasElement {};
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Require as CJS to ensure compatibility
    const pdf = require('pdf-parse');
    
    // The library returns a promise that resolves to the parsed data
    const data = await pdf(buffer, {
        // Option to disable image parsing to avoid canvas dependencies
        pagerender: (pageData: any) => {
            return pageData.getTextContent().then((textContent: any) => {
                let text = "";
                for (let item of textContent.items) {
                    text += item.str + " ";
                }
                return text;
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
