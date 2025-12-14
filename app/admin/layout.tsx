import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Shield, LogOut, Store, Users, BarChart3, Settings } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Verificar se é admin
  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#004DF0]" />
              <span className="text-lg font-bold text-gray-900">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/stores"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <Store className="w-5 h-5" />
              <span>Lojas</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <Users className="w-5 h-5" />
              <span>Usuários</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-lg font-semibold text-gray-900">Painel Administrativo</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  )
}


