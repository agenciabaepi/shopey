import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StorePageClient from '@/app/[slug]/StorePageClient'
import PreviewGuard from '@/components/PreviewGuard'
import { 
  demoAnnouncements, 
  demoBanners, 
  demoCategories, 
  demoProducts, 
  demoStore, 
  demoSettings 
} from '@/lib/demo-data'

export default async function PreviewPage({ params }: { params: { storeId: string } }) {
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

  // Organize demo products by category
  const productsByCategory: Record<string, any[]> = {}
  demoProducts.forEach((product) => {
    const categoryId = product.category_id || 'uncategorized'
    if (!productsByCategory[categoryId]) {
      productsByCategory[categoryId] = []
    }
    productsByCategory[categoryId].push(product)
  })

  // Merge demo store with real store data
  const previewStore = {
    ...demoStore,
    id: store.id,
    name: store.name || demoStore.name,
    slug: store.slug,
    primary_color: store.primary_color || demoStore.primary_color,
    logo_url: store.logo_url || demoStore.logo_url,
    whatsapp: store.whatsapp || '5511999999999',
    phone: store.phone || '11999999999',
  }

  // Renderizar apenas a loja, sem nenhum layout adicional
  return (
    <>
      <PreviewGuard />
      <div data-preview-mode="true">
        <StorePageClient
          store={previewStore}
          settings={demoSettings}
          announcements={demoAnnouncements}
          banners={demoBanners}
          categories={demoCategories}
          products={demoProducts}
          productsByCategory={productsByCategory}
        />
      </div>
    </>
  )
}


