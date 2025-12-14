'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    setError(null)

    if (!name.trim()) {
      setError('Nome é obrigatório')
      return false
    }
    if (name.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres')
      return false
    }
    if (!email.trim()) {
      setError('Email é obrigatório')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido')
      return false
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }
    if (!whatsapp.trim()) {
      setError('WhatsApp é obrigatório')
      return false
    }
    const whatsappNumbers = whatsapp.replace(/\D/g, '')
    if (whatsappNumbers.length < 10) {
      setError('WhatsApp inválido. Digite pelo menos 10 dígitos')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return false
    }

    setLoading(true)

    try {
      // Verificar se Supabase está configurado
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase não configurado:', { supabaseUrl, supabaseKey })
        setError('Erro de configuração. Verifique as variáveis de ambiente.')
        setLoading(false)
        return false
      }

      const supabase = createClient()
      
      console.log('Tentando criar conta...', { email: email.trim() })
      
      // Register user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            whatsapp: whatsapp.replace(/\D/g, ''),
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      })

      console.log('Resposta do signUp:', { data, error: signUpError })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        
        // Mensagens de erro mais amigáveis
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setError('Este email já está cadastrado. Tente fazer login.')
        } else if (signUpError.message.includes('password')) {
          setError('A senha não atende aos requisitos de segurança.')
        } else if (signUpError.message.includes('email')) {
          setError('Email inválido. Verifique e tente novamente.')
        } else {
          setError(signUpError.message || 'Erro ao criar conta. Tente novamente.')
        }
        setLoading(false)
        return false
      }

      // Supabase pode retornar user mesmo se precisar confirmar email
      if (data?.user) {
        console.log('Resposta do Supabase:', { user: data?.user, session: data?.session })
        
        // Se tem sessão, usuário está logado
        if (data?.session) {
          setSuccess(true)
          setError(null)
          // Redireciona imediatamente usando window.location
          setTimeout(() => {
            window.location.href = '/onboarding'
          }, 500)
        } else {
          // Não tem sessão - pode precisar confirmar email ou Supabase não cria sessão automática
          // Vamos tentar fazer login automaticamente
          console.log('Tentando fazer login automático após cadastro...')
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          })

          if (loginError) {
            console.error('Erro ao fazer login automático:', loginError)
            
            if (loginError.message.includes('Email not confirmed')) {
              setSuccess(true)
              setError(null)
              // Mostra mensagem sobre confirmação de email
              setTimeout(() => {
                alert('Conta criada! Verifique seu email para confirmar antes de fazer login.')
                window.location.href = '/auth/login'
              }, 1500)
            } else {
              setError('Conta criada, mas não foi possível fazer login automaticamente. Tente fazer login manualmente.')
              setLoading(false)
            }
          } else if (loginData?.session) {
            // Login automático funcionou
            setSuccess(true)
            setError(null)
            setTimeout(() => {
              window.location.href = '/onboarding'
            }, 500)
          } else {
            // Conta criada mas sem sessão
            setSuccess(true)
            setError(null)
            setTimeout(() => {
              window.location.href = '/auth/login'
            }, 1500)
          }
        }
      } else {
        console.error('Nenhum dado retornado do Supabase')
        setError('Não foi possível criar a conta. Verifique sua conexão e tente novamente.')
        setLoading(false)
      }
      
      return false
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(err?.message || 'Erro inesperado. Por favor, tente novamente.')
      setLoading(false)
      return false
    }
  }

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers
      } else if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
      }
    }
    return value
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <Logo variant="black" href="/" className="h-10 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-avenir">
            Criar nova conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/auth/login" className="font-medium text-[#004DF0] hover:text-[#0038B8]">
              entrar na sua conta
            </Link>
          </p>
        </div>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Conta criada com sucesso!</p>
              <p className="text-sm">Redirecionando para configuração da loja...</p>
            </div>
          </div>
        )}

        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          noValidate
        >
          {error && !success && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Erro ao criar conta</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={3}
                disabled={loading || success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004DF0] focus:border-[#004DF0] disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading || success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004DF0] focus:border-[#004DF0] disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp *
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                required
                disabled={loading || success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004DF0] focus:border-[#004DF0] disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="(11) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">
                Usado para receber pedidos da sua loja
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading || success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004DF0] focus:border-[#004DF0] disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading || success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004DF0] focus:border-[#004DF0] disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">As senhas não coincidem</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004DF0] hover:bg-[#0038B8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004DF0] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando conta...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Conta criada!
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="#" className="text-[#004DF0] hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="#" className="text-[#004DF0] hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
