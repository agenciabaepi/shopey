import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function BannersPage() {
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

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('store_id', store.id)
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-avenir">Banners</h1>
          <p className="mt-2 text-gray-600">Gerencie os banners da sua loja</p>
        </div>
        <Link
          href="/dashboard/banners/new"
          className="px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8]"
        >
          + Novo Banner
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {banners && banners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {banner.image_url && (
                        <div className="h-16 w-24">
                          <Image
                            src={banner.image_url}
                            alt={banner.title || 'Banner'}
                            width={96}
                            height={64}
                            className="h-16 w-24 rounded object-cover"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{banner.title || '-'}</div>
                      {banner.subtitle && (
                        <div className="text-sm text-gray-500">{banner.subtitle}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          banner.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {banner.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/banners/${banner.id}/edit`}
                        className="text-[#004DF0] hover:text-[#0038B8]"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum banner cadastrado ainda.</p>
            <Link
              href="/dashboard/banners/new"
              className="text-[#004DF0] hover:text-[#0038B8] font-medium"
            >
              Criar primeiro banner →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
