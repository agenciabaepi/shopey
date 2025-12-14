'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage, deleteImage } from '@/lib/supabase/storage'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    is_unlimited_stock: false,
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    loadData()
  }, [productId])

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

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productData) {
      setProduct(productData)
      setImagePreview(productData.image_url)
      setImageUrl(productData.image_url || '')
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        category_id: productData.category_id || '',
        stock_quantity: productData.stock_quantity?.toString() || '',
        is_unlimited_stock: productData.is_unlimited_stock ?? false,
        is_active: productData.is_active ?? true,
        is_featured: productData.is_featured ?? false,
      })
    }

    // Load categories
    if (storeData) {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('name')

      if (categoriesData) setCategories(categoriesData)
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

      // Deletar imagem antiga se existir
      if (product?.image_url) {
        await deleteImage(product.image_url)
      }

      // Upload da nova imagem
      const uploadedUrl = await uploadImage(file, 'products', user.id)

      if (!uploadedUrl) {
        alert('Erro ao fazer upload da imagem')
        setUploadingImage(false)
        return
      }

      setImagePreview(uploadedUrl)
      setImageUrl(uploadedUrl)
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
    setImageUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!imageUrl) {
      alert('Por favor, envie uma imagem para o produto. A imagem é obrigatória.')
      if (fileInputRef.current) {
        fileInputRef.current.focus()
      }
      return
    }

    if (!store || !product) {
      alert('Dados não encontrados')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          category_id: formData.category_id || null,
          stock_quantity: formData.is_unlimited_stock ? null : parseInt(formData.stock_quantity) || 0,
          is_unlimited_stock: formData.is_unlimited_stock,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
        })
        .eq('id', productId)

      if (error) {
        alert('Erro ao atualizar produto: ' + error.message)
        setLoading(false)
        return
      }

      alert('Produto atualizado com sucesso!')
      router.push('/dashboard/products')
    } catch (error: any) {
      alert('Erro ao atualizar produto: ' + error.message)
      setLoading(false)
    }
  }

  if (!product) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="text-[#004DF0] hover:text-[#0038B8] mb-4 inline-block"
        >
          ← Voltar para produtos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-avenir">Editar Produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Imagem do produto *
          </label>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Preview do produto"
                  width={300}
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
                <p className="text-sm text-gray-400">Formatos: JPG, PNG, GIF, WEBP. Máximo: 5MB</p>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="product-image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="product-image-upload"
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

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome do produto *
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Hambúrguer Artesanal"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva seu produto de forma atrativa..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Preço *
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="29.90"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              id="category_id"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#004DF0] focus:ring-[#004DF0]"
              checked={formData.is_unlimited_stock}
              onChange={(e) => setFormData({ ...formData, is_unlimited_stock: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">Estoque ilimitado</span>
          </label>
        </div>

        {!formData.is_unlimited_stock && (
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
              Quantidade em estoque
            </label>
            <input
              type="number"
              id="stock_quantity"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#004DF0] focus:ring-[#004DF0]"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">Produto ativo</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#004DF0] focus:ring-[#004DF0]"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">Destaque na vitrine</span>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/products"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !imageUrl}
            className="px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Salvando...
              </>
            ) : (
              'Salvar alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

