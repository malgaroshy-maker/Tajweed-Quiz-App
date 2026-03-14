import { NextResponse } from 'next/server'
// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const data = await pdf(buffer)

    return NextResponse.json({ text: data.text })
  } catch (error: any) {
    console.error('PDF parsing error:', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
