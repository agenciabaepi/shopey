'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
import { ArrowLeft, Upload, Loader2, X, Save } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import Image from 'next/image'
import Link from 'next/link'

// Usar a API nativa do navegador para Image (não o componente do Next.js)
const BrowserImage = typeof window !== 'undefined' ? window.Image : null

export default function EditBannerPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  const bannerId = params.bannerId as string
  const toast = useToast()
  
  const isNew = bannerId === 'new'
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingMobileImage, setUploadingMobileImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [mobileImageDimensions, setMobileImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileFileInputRef = useRef<HTMLInputElement>(null)
  const [store, setStore] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    isActive: true,
  })

  useEffect(() => {
    loadData()
  }, [])

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

    if (!isNew) {
      const { data: bannerData } = await supabase
        .from('banners')
        .select('*')
        .eq('id', bannerId)
        .single()

      if (bannerData) {
        setFormData({
          title: bannerData.title || '',
          subtitle: bannerData.subtitle || '',
          imageUrl: bannerData.image_url,
          mobileImageUrl: bannerData.image_url_mobile || '',
          linkUrl: bannerData.link_url || '',
          isActive: bannerData.is_active,
        })
        setImagePreview(bannerData.image_url)
        setMobileImagePreview(bannerData.image_url_mobile || null)
        
      // Load dimensions
      if (BrowserImage) {
        const img = new BrowserImage()
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height })
        }
        img.src = bannerData.image_url
        
        if (bannerData.image_url_mobile) {
          const mobileImg = new BrowserImage()
          mobileImg.onload = () => {
            setMobileImageDimensions({ width: mobileImg.width, height: mobileImg.height })
          }
          mobileImg.src = bannerData.image_url_mobile
        }
      }
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem (JPG, PNG, etc.)')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Imagem muito grande. Tamanho máximo: 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        setUploadingImage(false)
        return
      }

      const imageUrl = await uploadImage(file, 'banners', user.id)

      if (!imageUrl) {
        toast.error('Erro ao fazer upload da imagem')
        setUploadingImage(false)
        return
      }

      if (BrowserImage) {
        const img = new BrowserImage()
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height })
        }
        img.src = imageUrl
      }

      setImagePreview(imageUrl)
      setFormData({ ...formData, imageUrl })
      toast.success('Imagem enviada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem (JPG, PNG, etc.)')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Imagem muito grande. Tamanho máximo: 5MB')
      return
    }

    setUploadingMobileImage(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        setUploadingMobileImage(false)
        return
      }

      const imageUrl = await uploadImage(file, 'banners', user.id)

      if (!imageUrl) {
        toast.error('Erro ao fazer upload da imagem')
        setUploadingMobileImage(false)
        return
      }

      if (BrowserImage) {
        const img = new BrowserImage()
        img.onload = () => {
          setMobileImageDimensions({ width: img.width, height: img.height })
        }
        img.src = imageUrl
      }

      setMobileImagePreview(imageUrl)
      setFormData({ ...formData, mobileImageUrl: imageUrl })
      toast.success('Imagem mobile enviada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploadingMobileImage(false)
      if (mobileFileInputRef.current) {
        mobileFileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.imageUrl) {
      toast.warning('Por favor, envie uma imagem para o banner')
      return
    }

    if (!store) {
      toast.error('Loja não encontrada')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      if (isNew) {
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
            image_url_mobile: formData.mobileImageUrl || null,
            link_url: formData.linkUrl || null,
            is_active: formData.isActive,
            order_index: count || 0,
          })

        if (error) throw error
        toast.success('Banner criado com sucesso!')
      } else {
        const { error } = await supabase
          .from('banners')
          .update({
            title: formData.title || null,
            subtitle: formData.subtitle || null,
            image_url: formData.imageUrl,
            image_url_mobile: formData.mobileImageUrl || null,
            link_url: formData.linkUrl || null,
            is_active: formData.isActive,
          })
          .eq('id', bannerId)

        if (error) throw error
        toast.success('Banner atualizado com sucesso!')
      }

      router.push(`/dashboard/templates/${templateId}/edit`)
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/templates/${templateId}/edit`}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isNew ? 'Novo Banner' : 'Editar Banner'}
            </h1>
            <p className="text-xs text-gray-500">Configure seu banner</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Imagem Desktop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem do Banner (Desktop) *
              </label>
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-900 mb-1">📐 Tamanhos recomendados:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <strong>Banner principal (full width):</strong> 1920 x 600px ou 1920 x 800px</li>
                  <li>• <strong>Banner padrão:</strong> 728 x 90px ou 970 x 250px</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  💡 Dica: Use imagens em formato JPG ou PNG. Tamanho máximo: 5MB
                </p>
              </div>
              {imagePreview ? (
                <div className="space-y-2">
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setImageDimensions(null)
                        setFormData({ ...formData, imageUrl: '' })
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {imageDimensions && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
                      <strong>Dimensões:</strong> {imageDimensions.width} x {imageDimensions.height}px
                      {imageDimensions.width < 600 && (
                        <span className="ml-2 text-amber-600">⚠️ Imagem pode ficar pixelada em telas grandes</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Clique para fazer upload</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Selecionar imagem'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Imagem Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem do Banner Mobile (opcional)
              </label>
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-900 mb-1">📱 Dimensões ideais para banner mobile (sem cortes):</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <strong>Recomendação principal:</strong> <strong className="text-blue-900">414 x 276px</strong></li>
                  <li className="ml-4">- Largura 414px cobre a maioria dos smartphones (iPhone Plus, muitos Android)</li>
                  <li className="ml-4">- Proporção 3:2 funciona bem em todos os dispositivos</li>
                  <li>• <strong>Alternativa (mais compatível):</strong> <strong className="text-blue-900">430 x 287px</strong></li>
                  <li className="ml-4">- Cobre até dispositivos maiores como iPhone Pro Max</li>
                  <li>• <strong>Para telas menores:</strong> A imagem será redimensionada proporcionalmente</li>
                  <li className="mt-2 text-blue-700">💡 <strong>Importante:</strong> Use largura de 414px ou mais para evitar espaços laterais</li>
                  <li className="text-blue-700">💡 A imagem será exibida sem cortes, mantendo a proporção original</li>
                  <li className="text-blue-700">💡 Se não especificar, será usada a imagem desktop redimensionada</li>
                </ul>
              </div>
              {mobileImagePreview ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={mobileImagePreview}
                      alt="Preview Mobile"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMobileImagePreview(null)
                        setMobileImageDimensions(null)
                        setFormData({ ...formData, mobileImageUrl: '' })
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {mobileImageDimensions && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
                      <strong>Dimensões:</strong> {mobileImageDimensions.width} x {mobileImageDimensions.height}px
                      {mobileImageDimensions.width < 300 && (
                        <span className="ml-2 text-amber-600">⚠️ Imagem pode ficar pixelada</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs text-gray-600 mb-2">Opcional: Clique para fazer upload</p>
                  <input
                    ref={mobileFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMobileImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mobileFileInputRef.current?.click()}
                    disabled={uploadingMobileImage}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
                  >
                    {uploadingMobileImage ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Selecionar imagem mobile'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título (opcional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Título do banner"
              />
            </div>

            {/* Subtítulo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo (opcional)
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Subtítulo do banner"
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link (opcional)
              </label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>

            {/* Ativo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Banner ativo
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
              <Link
                href={`/dashboard/templates/${templateId}/edit`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.imageUrl}
                className="flex-1 px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isNew ? 'Criar banner' : 'Salvar alterações'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

