'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + error.message)
  }

  // Find user's role to redirect appropriately
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'teacher') {
      redirect('/teacher')
    } else {
      redirect('/student')
    }
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const invitation_code = formData.get('invitation_code') as string

  let role = 'student'
  if (invitation_code) {
    const { data: codeData } = await adminSupabase
        .from('invitation_codes')
        .select('used')
        .eq('code', invitation_code)
        .single()
    
    if (codeData && !codeData.used) {
        role = 'teacher'
    } else {
        // If code is provided but invalid/used, we should probably stop here
        // but to maintain original flow we'll just continue as student.
        // Actually, if a user puts a code and it fails, it's confusing if they just become a student.
        // Let's add a small error redirect.
        if (invitation_code) {
            return redirect('/login?error=كود الدعوة غير صالح أو مستخدم مسبقاً')
        }
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        role,
      },
    },
  })

  if (error) {
    redirect('/login?error=' + error.message)
  }

  if (data.user && role === 'teacher' && invitation_code) {
    await adminSupabase.from('invitation_codes').update({ used: true }).eq('code', invitation_code)
  }

  if (data.user && !data.session) {
    redirect('/login?message=يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب')
  }

  if (data.user) {
    if (role === 'teacher') {
      redirect('/teacher')
    } else {
      redirect('/student')
    }
  }

  redirect('/')
}
