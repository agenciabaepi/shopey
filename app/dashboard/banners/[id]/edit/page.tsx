'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage, deleteImage } from '@/lib/supabase/storage'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/hooks/useConfirm'

export default function EditBannerPage() {
  const router = useRouter()
  const params = useParams()
  const bannerId = params.id as string
  const toast = useToast()
  const { confirm, ConfirmComponent } = useConfirm()
  
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [banner, setBanner] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    isCarousel: false,
  })

  useEffect(() => {
    loadData()
  }, [bannerId])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (storeData) {
      setStore(storeData)
    }

    const { data: bannerData } = await supabase
      .from('banners')
      .select('*')
      .eq('id', bannerId)
      .single()

    if (bannerData) {
      setBanner(bannerData)
      setImagePreview(bannerData.image_url)
      setFormData({
        title: bannerData.title || '',
        subtitle: bannerData.subtitle || '',
        imageUrl: bannerData.image_url || '',
        linkUrl: bannerData.link_url || '',
        isActive: bannerData.is_active ?? true,
        isCarousel: bannerData.is_carousel ?? false,
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return

    setUploadingImage(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        setUploadingImage(false)
        return
      }

      // Deletar imagem antiga se existir
      if (banner?.image_url) {
        await deleteImage(banner.image_url)
      }

      // Upload da nova imagem
      const imageUrl = await uploadImage(file, 'banners', user.id)

      if (!imageUrl) {
        toast.error('Erro ao fazer upload da imagem')
        setUploadingImage(false)
        return
      }

      setImagePreview(imageUrl)
      setFormData({ ...formData, imageUrl })
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, imageUrl: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.imageUrl) {
      toast.warning('Por favor, envie uma imagem para o banner')
      return
    }

    if (!store || !banner) {
      toast.error('Dados não encontrados')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('banners')
        .update({
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          image_url: formData.imageUrl,
          link_url: formData.linkUrl || null,
          is_active: formData.isActive,
          is_carousel: formData.isCarousel,
        })
        .eq('id', bannerId)

      if (error) {
        toast.error('Erro ao atualizar banner: ' + error.message)
        setLoading(false)
        return
      }

      toast.success('Banner atualizado com sucesso!')
      router.push('/dashboard/banners')
    } catch (error: any) {
      toast.error('Erro ao atualizar banner: ' + error.message)
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Excluir banner',
      message: 'Tem certeza que deseja excluir este banner? Esta ação não pode ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    })
    
    if (!confirmed) return

    try {
      const supabase = createClient()

      // Deletar imagem do storage
      if (banner?.image_url) {
        await deleteImage(banner.image_url)
      }

      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId)

      if (error) {
        toast.error('Erro ao excluir banner: ' + error.message)
        return
      }

      toast.success('Banner excluído com sucesso!')
      router.push('/dashboard/banners')
    } catch (error: any) {
      toast.error('Erro ao excluir banner: ' + error.message)
    }
  }

  if (!banner) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <>
      <ConfirmComponent />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/banners"
          className="text-[#004DF0] hover:text-[#0038B8] mb-4 inline-block"
        >
          ← Voltar para banners
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 font-avenir">Editar Banner</h1>
        <p className="mt-2 text-gray-600">Edite as informações do banner</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem do Banner *
          </label>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Preview do banner"
                  width={600}
                  height={300}
                  className="rounded-lg object-cover border border-gray-200 max-h-64"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Nenhuma imagem selecionada</p>
                <p className="text-sm text-gray-400">Formatos: JPG, PNG, GIF. Máximo: 5MB</p>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="banner-image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="banner-image-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'Trocar imagem' : 'Enviar imagem'}
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              id="title"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
              placeholder="Título do banner"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              id="subtitle"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
              placeholder="Subtítulo do banner"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Link (opcional)
          </label>
          <input
            type="url"
            id="linkUrl"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
            placeholder="https://exemplo.com"
            value={formData.linkUrl}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            URL para onde o banner deve redirecionar ao ser clicado
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#004DF0] focus:ring-[#004DF0]"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">Banner ativo</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#004DF0] focus:ring-[#004DF0]"
              checked={formData.isCarousel}
              onChange={(e) => setFormData({ ...formData, isCarousel: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">Incluir no carrossel</span>
          </label>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
          >
            Excluir Banner
          </button>
          <div className="flex gap-4">
            <Link
              href="/dashboard/banners"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.imageUrl}
              className="px-6 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </div>
      </form>
      </div>
    </>
  )
}

