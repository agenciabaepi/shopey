import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!store) {
    redirect('/onboarding')
  }

  // Get statistics
  const [productsResult, categoriesResult, bannersResult, visitsResult, clicksResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }).eq('store_id', store.id),
    supabase.from('categories').select('id', { count: 'exact' }).eq('store_id', store.id),
    supabase.from('banners').select('id', { count: 'exact' }).eq('store_id', store.id),
    supabase.from('visits').select('id', { count: 'exact' }).eq('store_id', store.id),
    supabase.from('whatsapp_clicks').select('id', { count: 'exact' }).eq('store_id', store.id),
  ])

  const stats = {
    products: productsResult.count || 0,
    categories: categoriesResult.count || 0,
    banners: bannersResult.count || 0,
    visits: visitsResult.count || 0,
    clicks: clicksResult.count || 0,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-avenir">Dashboard</h1>
        <p className="mt-2 text-gray-600">Bem-vindo, {store.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Produtos</div>
              <div className="mt-2 text-3xl font-bold text-[#004DF0]">{stats.products}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Categorias</div>
              <div className="mt-2 text-3xl font-bold text-[#004DF0]">{stats.categories}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Banners</div>
              <div className="mt-2 text-3xl font-bold text-[#004DF0]">{stats.banners}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Visitas</div>
              <div className="mt-2 text-3xl font-bold text-[#004DF0]">{stats.visits}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Cliques WhatsApp</div>
              <div className="mt-2 text-3xl font-bold text-[#004DF0]">{stats.clicks}</div>
            </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Links rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/products"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#004DF0] hover:bg-[#004DF0]/5 transition"
          >
            <div className="font-semibold text-gray-900">Gerenciar Produtos</div>
            <div className="text-sm text-gray-600 mt-1">Adicione, edite ou remova produtos</div>
          </Link>
          <Link
            href="/dashboard/categories"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#004DF0] hover:bg-[#004DF0]/5 transition"
          >
            <div className="font-semibold text-gray-900">Gerenciar Categorias</div>
            <div className="text-sm text-gray-600 mt-1">Organize seus produtos em categorias</div>
          </Link>
          <Link
            href="/dashboard/banners"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#004DF0] hover:bg-[#004DF0]/5 transition"
          >
            <div className="font-semibold text-gray-900">Gerenciar Banners</div>
            <div className="text-sm text-gray-600 mt-1">Configure os banners da sua loja</div>
          </Link>
          <Link
            href="/dashboard/settings"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#004DF0] hover:bg-[#004DF0]/5 transition"
          >
            <div className="font-semibold text-gray-900">Configurações</div>
            <div className="text-sm text-gray-600 mt-1">Personalize cores, layout e mais</div>
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sua loja</h2>
        <p className="text-gray-600 mb-4">
          Sua loja está disponível em:{' '}
          <a
            href={`/${store.slug}`}
            target="_blank"
            className="text-[#004DF0] hover:underline font-medium"
          >
            {store.slug}.shopey.app
          </a>
        </p>
        <Link
          href={`/${store.slug}`}
          target="_blank"
          className="inline-block px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8]"
        >
          Abrir loja em nova aba
        </Link>
      </div>
    </div>
  )
}
