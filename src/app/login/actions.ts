'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const role = formData.get('role') as string

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
