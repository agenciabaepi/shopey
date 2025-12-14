'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { XCircle, Loader2, Shield } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.')
        } else {
          setError(loginError.message)
        }
        setLoading(false)
        return
      }

      if (!data?.user || !data?.session) {
        setError('Erro ao autenticar. Tente novamente.')
        setLoading(false)
        return
      }

      // Verificar se é admin
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (adminError || !admin) {
        await supabase.auth.signOut()
        setError('Acesso negado. Você não é um administrador.')
        setLoading(false)
        return
      }

      // Sucesso - redirecionar para dashboard admin
      toast.success('Login realizado com sucesso!')
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004DF0] to-[#0038B8] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[#004DF0]/10 p-3 rounded-full">
                <Shield className="w-8 h-8 text-[#004DF0]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Área Administrativa</h1>
            <p className="text-gray-600 text-sm">Acesso restrito a administradores</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004DF0] focus:border-transparent"
                placeholder="admin@shopey.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004DF0] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004DF0] text-white py-2 px-4 rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Entrar como Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/auth/login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Voltar para login de usuário
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


