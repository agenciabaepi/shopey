'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/hooks/useConfirm'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  image_url_mobile: string | null
  link_url: string | null
  is_active: boolean
  order_index: number
}

export default function BannersSection({ storeId }: { storeId: string }) {
  const toast = useToast()
  const { confirm, ConfirmComponent } = useConfirm()
  const router = useRouter()
  const params = useParams()
  const templateId = params?.id as string
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [storeId])

  const loadBanners = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('store_id', storeId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar banners: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Excluir banner',
      message: 'Tem certeza que deseja excluir este banner?',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Banner excluído com sucesso!')
      loadBanners()
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Banner ${!currentStatus ? 'ativado' : 'desativado'}!`)
      loadBanners()
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message)
    }
  }

  const handleNewBanner = () => {
    if (templateId) {
      router.push(`/dashboard/templates/${templateId}/edit/banners/new`)
    }
  }

  const handleEditBanner = (bannerId: string) => {
    if (templateId) {
      router.push(`/dashboard/templates/${templateId}/edit/banners/${bannerId}`)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando...</div>
  }

  return (
    <>
      <ConfirmComponent />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Banners</h3>
          <button
            onClick={handleNewBanner}
            className="px-3 py-1.5 bg-[#004DF0] text-white text-sm rounded-lg hover:bg-[#0038B8] flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            <p>Nenhum banner cadastrado</p>
            <button
              onClick={handleNewBanner}
              className="text-[#004DF0] hover:underline mt-2 inline-block"
            >
              Criar primeiro banner
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Preview */}
                <div className="relative h-32 bg-gray-100">
                  <Image
                    src={banner.image_url}
                    alt={banner.title || 'Banner'}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  {banner.title && (
                    <p className="text-sm font-medium text-gray-900">{banner.title}</p>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner.id, banner.is_active)}
                      className={`text-xs px-2 py-1 rounded ${
                        banner.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => handleEditBanner(banner.id)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

