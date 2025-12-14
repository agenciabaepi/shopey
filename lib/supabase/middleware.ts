import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase não configurado no middleware')
      // Retornar resposta sem autenticação se as variáveis não estiverem configuradas
      return response
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options as CookieOptions)
            })
          },
        },
      }
    )

    // IMPORTANTE: Apenas refrescar a sessão - isso é tudo que o middleware precisa fazer
    // O middleware NÃO deve fazer redirecionamentos complexos
    await supabase.auth.getUser()

  // Proteger rotas do dashboard - redirecionar apenas se não autenticado
  if (!request.nextUrl.pathname.startsWith('/auth') && 
      !request.nextUrl.pathname.startsWith('/_next') &&
      !request.nextUrl.pathname.startsWith('/[slug]') &&
      request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  // Proteger rotas admin - redirecionar para login admin se não autenticado
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Permitir rotas de preview (validação de segurança feita na própria página)
  // Não redirecionar para login - a página de preview valida o acesso internamente
  // Isso permite que o iframe carregue sem ser redirecionado
  if (request.nextUrl.pathname.startsWith('/preview/')) {
    return response
  }

  // Permitir rotas de loja pública (slug)
  if (request.nextUrl.pathname.match(/^\/[^\/]+$/)) {
    // Não é /auth, /dashboard, /admin, /api, etc - provavelmente é um slug de loja
    return response
  }

  return response
  } catch (error) {
    console.error('Erro no middleware:', error)
    // Em caso de erro, retornar resposta padrão para não quebrar a aplicação
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
