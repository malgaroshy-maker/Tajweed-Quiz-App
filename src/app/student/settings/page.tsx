import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StudentSettingsClient } from './client-page'

export default async function StudentSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <StudentSettingsClient />
}
