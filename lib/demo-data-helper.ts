// Helper para mesclar dados reais com dados demo quando necessário
import {
  demoAnnouncements,
  demoBanners,
  demoCategories,
  demoProducts,
  demoStore,
  demoSettings,
} from './demo-data'

/**
 * Mescla dados reais com dados demo quando os dados reais estão vazios
 */
export function mergeWithDemoData({
  store,
  settings,
  announcements,
  banners,
  categories,
  products,
}: {
  store: any
  settings: any
  announcements: any[]
  banners: any[]
  categories: any[]
  products: any[]
}) {
  // Se não houver anúncios, usar demo
  const finalAnnouncements = announcements && announcements.length > 0
    ? announcements
    : demoAnnouncements

  // Se não houver banners, usar demo
  const finalBanners = banners && banners.length > 0
    ? banners
    : demoBanners

  // Se não houver categorias, usar demo
  const finalCategories = categories && categories.length > 0
    ? categories
    : demoCategories

  // Se não houver produtos, usar demo
  const finalProducts = products && products.length > 0
    ? products
    : demoProducts

  // Se não houver logo, manter null (será exibido o nome da loja)
  const finalStore = {
    ...store,
    logo_url: store?.logo_url || null,
  }

  // Se não houver settings, usar demo com store_id do usuário
  const finalSettings = settings || {
    ...demoSettings,
    store_id: store?.id,
    featured_products: [],
    featured_section_title: 'Destaques',
    products_display_mode: 'grid',
  }

  // Organizar produtos por categoria (incluindo demos)
  const productsByCategory: Record<string, any[]> = {}
  if (finalProducts) {
    finalProducts.forEach((product) => {
      const categoryId = product.category_id || 'uncategorized'
      if (!productsByCategory[categoryId]) {
        productsByCategory[categoryId] = []
      }
      productsByCategory[categoryId].push(product)
    })
  }

  return {
    store: finalStore,
    settings: finalSettings,
    announcements: finalAnnouncements,
    banners: finalBanners,
    categories: finalCategories,
    products: finalProducts,
    productsByCategory,
  }
}

