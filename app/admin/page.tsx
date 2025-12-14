import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { Store, Users, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect('/admin/login')
  }

  // Get statistics
  const [
    storesResult,
    productsResult,
    visitsResult
  ] = await Promise.all([
    supabase.from('stores').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('visits').select('id', { count: 'exact' }),
  ])

  // Get users count from auth (simplified - count unique user_ids from stores)
  const { data: uniqueUsers } = await supabase
    .from('stores')
    .select('user_id')
  
  const uniqueUserIds = new Set(uniqueUsers?.map(s => s.user_id) || [])
  const usersCount = uniqueUserIds.size

  const stats = {
    stores: storesResult.count || 0,
    users: usersCount,
    products: productsResult.count || 0,
    visits: visitsResult.count || 0,
  }

  // Get recent stores
  const { data: recentStores } = await supabase
    .from('stores')
    .select('id, name, slug, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-2 text-gray-600">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Lojas</p>
              <p className="mt-2 text-3xl font-bold text-[#004DF0]">{stats.stores}</p>
            </div>
            <Store className="w-12 h-12 text-[#004DF0] opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.users}</p>
            </div>
            <Users className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">{stats.products}</p>
            </div>
            <Package className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Visitas</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">{stats.visits}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Recent Stores */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lojas Recentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentStores && recentStores.length > 0 ? (
            recentStores.map((store) => (
              <div key={store.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{store.name}</p>
                    <p className="text-sm text-gray-500">{store.slug}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {new Date(store.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Link
                      href={`/admin/stores/${store.id}`}
                      className="text-sm text-[#004DF0] hover:text-[#0038B8]"
                    >
                      Ver detalhes →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              Nenhuma loja cadastrada ainda
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


