import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Check } from 'lucide-react'

export default async function TemplatesPage() {
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

  // Get store settings to know current template
  const { data: settings } = await supabase
    .from('store_settings')
    .select('template_id')
    .eq('store_id', store.id)
    .maybeSingle()

  const currentTemplateId = settings?.template_id || 'default'

  // Get all available templates
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('is_premium', { ascending: true })
    .order('name', { ascending: true })

  // Filter templates based on user plan
  const availableTemplates = templates?.filter((template) => {
    if (!template.is_premium) return true // Free templates always available
    if (store.plan === 'pro' || store.plan === 'enterprise') return true
    return false
  }) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-avenir">Templates e Layout</h1>
        <p className="mt-2 text-gray-600">Escolha e personalize o tema da sua loja</p>
      </div>

      {/* Current Template Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Layout Atual</h2>
            <p className="text-sm text-gray-600">
              {templates?.find((t) => t.id === currentTemplateId)?.name || 'Padrão'}
            </p>
          </div>
          <Link
            href={`/dashboard/templates/${currentTemplateId}/edit`}
            className="px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar Tema
          </Link>
        </div>
      </div>

      {/* Available Templates */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Temas Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTemplates.map((template) => {
            const isActive = template.id === currentTemplateId
            const isPremium = template.is_premium

            return (
              <div
                key={template.id}
                className={`
                  bg-white rounded-lg shadow border-2 overflow-hidden transition
                  ${isActive ? 'border-[#004DF0]' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                {/* Preview Image */}
                <div className="relative h-48 bg-gray-100">
                  {template.preview_image_url ? (
                    <Image
                      src={template.preview_image_url}
                      alt={template.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-sm">Sem preview</p>
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-2 right-2 bg-[#004DF0] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Ativo
                    </div>
                  )}
                  {isPremium && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      PRO
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description || 'Template moderno e responsivo'}
                  </p>

                  <div className="flex gap-2">
                    {isActive ? (
                      <Link
                        href={`/dashboard/templates/${template.id}/edit`}
                        className="flex-1 px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] text-center text-sm font-medium"
                      >
                        Editar
                      </Link>
                    ) : (
                      <>
                        <button
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                          disabled
                        >
                          {isPremium && store.plan === 'free' ? 'Upgrade' : 'Usar'}
                        </button>
                        <Link
                          href={`/dashboard/templates/${template.id}/edit`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                          Visualizar
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Premium Templates Locked */}
        {templates?.some((t) => t.is_premium && (store.plan === 'free')) && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              💡 <strong>Temas Premium:</strong> Faça upgrade para o plano Pro para desbloquear mais temas personalizados.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


