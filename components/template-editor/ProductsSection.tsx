'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { Package, Loader2 } from 'lucide-react'

interface ProductsSectionProps {
  storeId: string
  iframeRef?: React.RefObject<HTMLIFrameElement>
}

export default function ProductsSection({ storeId, iframeRef }: ProductsSectionProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [storeId])

  const loadData = async () => {
    const supabase = createClient()
    
    // Carregar configurações
    const { data: settingsData } = await supabase
      .from('store_settings')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle()

    if (settingsData) {
      setSettings(settingsData)
      setFeaturedProducts(settingsData.featured_products || [])
    }

    // Carregar produtos
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })

    if (productsData) {
      setProducts(productsData)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Atualizar configurações
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          store_id: storeId,
          featured_products: featuredProducts,
          featured_section_title: settings?.featured_section_title || 'Destaques',
          products_per_row_mobile: settings?.products_per_row_mobile || 1,
          products_per_row: settings?.products_per_row || 4,
          products_display_mode: settings?.products_display_mode || 'grid',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'store_id'
        })

      if (error) throw error

      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId: string) => {
    setFeaturedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Título da Seção */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título
        </label>
        <input
          type="text"
          value={settings?.featured_section_title || 'Destaques'}
          onChange={(e) => {
            const newTitle = e.target.value
            setSettings({
              ...settings,
              featured_section_title: newTitle
            })
            // Atualizar preview em tempo real
            if (iframeRef?.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                type: 'PREVIEW_UPDATE',
                updateType: 'featured_section_title',
                data: newTitle,
              }, '*')
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Destaques"
        />
      </div>

      {/* Mostrar produtos como */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mostrar produtos como:
        </label>
        <select
          value={settings?.products_display_mode || 'grid'}
          onChange={(e) => setSettings({
            ...settings,
            products_display_mode: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="grid">Grade</option>
          <option value="list">Lista</option>
        </select>
      </div>

      {/* Produtos por linha - Mobile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantidade de produtos por linha em celulares
        </label>
        <select
          value={settings?.products_per_row_mobile || 1}
          onChange={(e) => {
            const newValue = parseInt(e.target.value)
            setSettings({
              ...settings,
              products_per_row_mobile: newValue
            })
            // Atualizar preview em tempo real
            if (iframeRef?.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                type: 'PREVIEW_UPDATE',
                updateType: 'products_per_row_mobile',
                data: newValue,
              }, '*')
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value={1}>1 produto</option>
          <option value={2}>2 produtos</option>
        </select>
      </div>

      {/* Produtos por linha - Desktop */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantidade de produtos por linha em computadores
        </label>
        <select
          value={settings?.products_per_row || 4}
          onChange={(e) => {
            const newValue = parseInt(e.target.value)
            setSettings({
              ...settings,
              products_per_row: newValue
            })
            // Atualizar preview em tempo real
            if (iframeRef?.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                type: 'PREVIEW_UPDATE',
                updateType: 'products_per_row',
                data: newValue,
              }, '*')
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value={1}>1 produto</option>
          <option value={2}>2 produtos</option>
          <option value={3}>3 produtos</option>
          <option value={4}>4 produtos</option>
        </select>
      </div>

      {/* Escolher produtos em destaque */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Escolha os produtos em destaque
        </label>
        <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
          {products.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={featuredProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 text-[#004DF0] border-gray-300 rounded focus:ring-[#004DF0]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.price ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Sem preço'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-4 py-2 bg-[#004DF0] text-white rounded-lg font-medium hover:bg-[#0039B3] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar alterações'
        )}
      </button>
    </div>
  )
}


