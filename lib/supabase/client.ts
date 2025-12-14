import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase não configurado. Verifique as variáveis de ambiente.')
    throw new Error('Supabase não está configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // createBrowserClient do @supabase/ssr já gerencia cookies automaticamente
  // Não precisa de configuração adicional - ele usa cookies por padrão
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
