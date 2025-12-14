import { createClient } from '@/lib/supabase/server'

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    return false
  }

  return true
}

export async function getCurrentAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  return admin
}


