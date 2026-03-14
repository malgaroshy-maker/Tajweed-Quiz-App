import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify requester is a teacher
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const code = crypto.randomBytes(4).toString('hex').toUpperCase()
  const { error } = await supabase.from('invitation_codes').insert({ code })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ code })
}
