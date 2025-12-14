'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import Link from 'next/link'

export default function NewBannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    isCarousel: false,
    orderIndex: 0,
  })

  useEffect(() => {
    loadStore()
  }, [])

  const loadStore = async () => {
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
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return

    setUploadingImage(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Usuário não autenticado')
        setUploadingImage(false)
        return
      }

      // Upload da imagem
      const imageUrl = await uploadImage(file, 'banners', user.id)

      if (!imageUrl) {
        alert('Erro ao fazer upload da imagem')
        setUploadingImage(false)
        return
      }

      setImagePreview(imageUrl)
      setFormData({ ...formData, imageUrl })
    } catch (error: any) {
      alert('Erro ao fazer upload: ' + error.message)
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
      alert('Por favor, envie uma imagem para o banner')
      return
    }

    if (!store) {
      alert('Loja não encontrada')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Obter próximo order_index
      const { count } = await supabase
        .from('banners')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)

      const { error } = await supabase
        .from('banners')
        .insert({
          store_id: store.id,
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          image_url: formData.imageUrl,
          link_url: formData.linkUrl || null,
          is_active: formData.isActive,
          is_carousel: formData.isCarousel,
          order_index: count || 0,
        })

      if (error) {
        alert('Erro ao criar banner: ' + error.message)
        setLoading(false)
        return
      }

      alert('Banner criado com sucesso!')
      router.push('/dashboard/banners')
    } catch (error: any) {
      alert('Erro ao criar banner: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/banners"
          className="text-[#004DF0] hover:text-[#0038B8] mb-4 inline-block"
        >
          ← Voltar para banners
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 font-avenir">Novo Banner</h1>
        <p className="mt-2 text-gray-600">Adicione um novo banner para sua loja</p>
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

        <div className="flex justify-end gap-4">
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
              'Criar Banner'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

