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
    header_background_color: '#FFFFFF',
    header_text_color: '#000000',
    header_icon_color: '#000000',
    logo_position: 'center',
    logo_size: 'medium',
    menu_position: 'left',
    cart_position: 'right',
    header_mobile_background_color: '#FFFFFF',
    header_mobile_text_color: '#000000',
    header_mobile_icon_color: '#000000',
  }
  
  // Garantir que todas as colunas existam mesmo se settings existir mas não tiver essas colunas
  const finalSettingsWithDefaults = {
    ...finalSettings,
    header_background_color: finalSettings.header_background_color || '#FFFFFF',
    header_text_color: finalSettings.header_text_color || '#000000',
    header_icon_color: finalSettings.header_icon_color || '#000000',
    logo_position: finalSettings.logo_position || 'center',
    logo_size: finalSettings.logo_size || 'medium',
    menu_position: finalSettings.menu_position || 'left',
    cart_position: finalSettings.cart_position || 'right',
    header_mobile_background_color: finalSettings.header_mobile_background_color || '#FFFFFF',
    header_mobile_text_color: finalSettings.header_mobile_text_color || '#000000',
    header_mobile_icon_color: finalSettings.header_mobile_icon_color || '#000000',
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
    settings: finalSettingsWithDefaults,
    announcements: finalAnnouncements,
    banners: finalBanners,
    categories: finalCategories,
    products: finalProducts,
    productsByCategory,
  }
}

