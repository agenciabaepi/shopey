import { createClient } from '@/lib/supabase/server'
import StorePageClient from '@/app/[slug]/StorePageClient'
import PreviewGuard from '@/components/PreviewGuard'
import LivePreviewUpdater from '@/components/LivePreviewUpdater'
import { mergeWithDemoData } from '@/lib/demo-data-helper'

export default async function RealPreviewPage({ params }: { params: { storeId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // VALIDAÇÃO DE SEGURANÇA: Apenas o dono da loja pode ver o preview
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Acesso negado</p>
        </div>
      </div>
    )
  }

  // Verificar se o storeId pertence ao usuário
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', params.storeId)
    .eq('user_id', user.id)
    .single()

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loja não encontrada</p>
        </div>
      </div>
    )
  }

  // Get store settings
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', store.id)
    .maybeSingle()

  // If no settings exist, create default
  if (!settings) {
    await supabase.from('store_settings').insert({
      store_id: store.id,
      featured_products: [],
      featured_section_title: 'Destaques',
      products_display_mode: 'grid',
    })
  }

  // Get active announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get active banners
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get active categories with products
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get all active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('order_index', { ascending: true })

  // Mesclar com dados demo se necessário
  const finalData = mergeWithDemoData({
    store,
    settings: settings || null,
    announcements: announcements || [],
    banners: banners || [],
    categories: categories || [],
    products: products || [],
  })

  // Renderizar apenas a loja, sem nenhum layout adicional
  return (
    <>
      <PreviewGuard />
      <LivePreviewUpdater
        store={finalData.store}
        settings={finalData.settings}
        announcements={finalData.announcements}
        banners={finalData.banners}
        categories={finalData.categories}
        products={finalData.products}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Desabilitar interações em modo preview */
          [data-preview-mode="true"] button[data-preview-disabled="true"],
          [data-preview-mode="true"] button:disabled,
          [data-preview-mode="true"] a:not([href^="#"]):not([href^="javascript:"]) {
            pointer-events: none;
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          /* Permitir apenas seleção de elementos editáveis */
          [data-preview-mode="true"] [data-element-id] {
            cursor: pointer !important;
          }
          
          /* Bloquear carrinho e modais em preview */
          [data-preview-mode="true"] [aria-label*="carrinho"],
          [data-preview-mode="true"] [aria-label*="cart"] {
            pointer-events: none;
          }
        `
      }} />
      <div data-preview-mode="true">
        <StorePageClient
          store={finalData.store}
          settings={finalData.settings}
          announcements={finalData.announcements}
          banners={finalData.banners}
          categories={finalData.categories}
          products={finalData.products}
          productsByCategory={finalData.productsByCategory}
        />
      </div>
    </>
  )
}


