import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TemplateEditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Este layout não renderiza o menu lateral do dashboard
  // O editor de tema tem seu próprio layout completo em tela cheia
  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      {children}
    </div>
  )
}


