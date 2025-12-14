import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AnnouncementsPage() {
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

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('store_id', store.id)
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-avenir">Avisos e Promoções</h1>
          <p className="mt-2 text-gray-600">Gerencie as faixas de avisos da sua loja</p>
        </div>
        <Link
          href="/dashboard/announcements/new"
          className="px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8]"
        >
          + Novo Aviso
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {announcements && announcements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Texto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cores
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
                {announcements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="h-10 w-48 rounded flex items-center justify-center text-sm font-medium px-3"
                        style={{
                          backgroundColor: announcement.background_color || '#EC4899',
                          color: announcement.text_color || '#FFFFFF',
                        }}
                      >
                        {announcement.icon && <span className="mr-2">{announcement.icon}</span>}
                        <span className="truncate">{announcement.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {announcement.text}
                      </div>
                      {announcement.link_url && (
                        <div className="text-xs text-gray-500 mt-1">Link: {announcement.link_url}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: announcement.background_color || '#EC4899' }}
                          title={`Fundo: ${announcement.background_color || '#EC4899'}`}
                        />
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: announcement.text_color || '#FFFFFF' }}
                          title={`Texto: ${announcement.text_color || '#FFFFFF'}`}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          announcement.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {announcement.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/announcements/${announcement.id}/edit`}
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
            <p className="text-gray-500 mb-4">Nenhum aviso cadastrado ainda.</p>
            <Link
              href="/dashboard/announcements/new"
              className="text-[#004DF0] hover:text-[#0038B8] font-medium"
            >
              Criar primeiro aviso →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
