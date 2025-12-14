'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { XCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('lucas@hotmail.com')
  const [password, setPassword] = useState('hering')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
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

      // Verificar onboarding
      const { data: store } = await supabase
        .from('stores')
        .select('onboarding_completed')
        .eq('user_id', data.user.id)
        .maybeSingle()

      // Redirecionar baseado no onboarding
      const redirectPath = store?.onboarding_completed ? '/dashboard' : '/onboarding'
      
      // Aguardar um pouco para garantir que os cookies foram salvos
      setTimeout(() => {
        window.location.href = redirectPath
      }, 500)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <Logo variant="black" href="/" className="h-10 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-avenir">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/auth/register" className="font-medium text-[#004DF0] hover:text-[#0038B8]">
              criar uma nova conta
            </Link>
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleLogin}
          noValidate
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Erro ao fazer login</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004DF0] focus:border-[#004DF0] disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004DF0] focus:border-[#004DF0] disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004DF0] hover:bg-[#0038B8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004DF0] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/register" 
              className="text-sm text-[#004DF0] hover:text-[#0038B8]"
            >
              Não tem uma conta? Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
