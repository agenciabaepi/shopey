'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, X, Phone, MapPin, MessageCircle, Menu, Star, Package, ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  original_price?: number | null
  discount_percentage?: number | null
  image_url: string | null
  stock_quantity: number | null
  is_unlimited_stock: boolean
  is_featured?: boolean
}

interface CartItem extends Product {
  quantity: number
}

export default function StorePageClient({
  store,
  settings,
  announcements,
  banners,
  categories,
  products,
  productsByCategory,
}: {
  store: any
  settings: any
  announcements: any[]
  banners: any[]
  categories: any[]
  products: Product[]
  productsByCategory: Record<string, Product[]>
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productQuantity, setProductQuantity] = useState(1)
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Detectar se está em modo preview (dentro de iframe ou com data-preview-mode)
  useEffect(() => {
    const checkPreviewMode = () => {
      try {
        // Verificar se está dentro de um iframe
        const inIframe = window.self !== window.top
        // Verificar se tem o atributo data-preview-mode
        const hasPreviewAttribute = document.querySelector('[data-preview-mode="true"]') !== null
        const previewMode = inIframe || hasPreviewAttribute
        setIsPreviewMode(previewMode)
        
        // Desabilitar todos os links quando em preview
        if (previewMode) {
          const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const link = target.closest('a')
            if (link && link.href !== '#' && !link.href.startsWith('#')) {
              e.preventDefault()
              e.stopPropagation()
              return false
            }
          }
          
          document.addEventListener('click', handleLinkClick, true)
          return () => {
            document.removeEventListener('click', handleLinkClick, true)
          }
        }
      } catch (err) {
        // Ignorar erros de CORS ao verificar window.top
        setIsPreviewMode(false)
      }
    }
    
    checkPreviewMode()
  }, [])

  // Auto-rotate announcements every 5 seconds
  useEffect(() => {
    if (announcements && announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAnnouncementIndex((prev) =>
          prev === announcements.length - 1 ? 0 : prev + 1
        )
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [announcements])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
    setShowCart(true)
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const formatOrderMessage = () => {
    let message = `Olá! Gostaria de fazer um pedido:\n\n`
    cart.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`
    })
    message += `\nTotal: ${formatPrice(getTotal())}`
    return message
  }

  const handleCheckout = () => {
    if (isPreviewMode) {
      // Em modo preview, apenas mostrar mensagem
      alert('Este é um preview. No site real, isso abriria o WhatsApp.')
      return
    }
    const message = formatOrderMessage()
    const whatsappLink = generateWhatsAppLink(store.whatsapp, message)
    window.open(whatsappLink, '_blank')
  }

  const handleBuyNow = (product: Product) => {
    if (isPreviewMode) {
      // Em modo preview, apenas mostrar mensagem
      alert('Este é um preview. No site real, isso abriria o WhatsApp.')
      return
    }
    const message = `Olá! Gostaria de comprar:\n\n• ${product.name} - ${formatPrice(product.price)}\n\nTotal: ${formatPrice(product.price)}`
    const whatsappLink = generateWhatsAppLink(store.whatsapp, message)
    window.open(whatsappLink, '_blank')
  }

  const primaryColor = store.primary_color || '#000000'
  
  // Configurar grid baseado nas configurações
  // Converter para número caso venha como string do banco
  // IMPORTANTE: Mobile sempre limitado a máximo 2 para não quebrar o CSS
  const productsPerRowMobile = settings?.products_per_row_mobile 
    ? Math.min(Number(settings.products_per_row_mobile), 2) // Máximo 2 no mobile
    : 1
  
  const productsPerRow = settings?.products_per_row 
    ? Number(settings.products_per_row) 
    : 4
  
  // Debug: verificar valor
  console.log('🔍 Products per row config:', {
    mobile: productsPerRowMobile,
    desktop: productsPerRow,
    settings: settings
  })
  
  // Construir classes do grid dinamicamente baseado nas configurações
  // Mobile sempre limitado a 1 ou 2 colunas (máximo 2)
  // Desktop usa a configuração desktop (1, 2, 3 ou 4)
  let gridClasses = 'grid gap-6'
  
  // Mobile: sempre 1 ou 2 colunas (máximo 2)
  const mobileCols = productsPerRowMobile === 2 ? 'grid-cols-2' : 'grid-cols-1'
  
  // Desktop: baseado na configuração
  if (productsPerRow === 1) {
    gridClasses = `grid ${mobileCols} sm:grid-cols-1 gap-6`
  } else if (productsPerRow === 2) {
    gridClasses = `grid ${mobileCols} sm:grid-cols-2 gap-6`
  } else if (productsPerRow === 3) {
    gridClasses = `grid ${mobileCols} sm:grid-cols-2 lg:grid-cols-3 gap-6`
  } else {
    gridClasses = `grid ${mobileCols} sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
  }

  return (
    <div 
      className="min-h-screen bg-white overflow-x-hidden" 
      style={{ fontFamily: settings?.font_family || 'Inter' }}
      data-primary-color={primaryColor}
    >
      {/* Header - Mobile First */}
      <header className="bg-white shadow-sm sticky top-0 z-50" data-element-id="header" data-element-type="header">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Menu Hambúrguer - Mobile / Menu Normal - Desktop */}
            <div className="flex items-center gap-4">
              {/* Hambúrguer - Mobile */}
              <button
                onClick={() => setShowMenu(true)}
                className="md:hidden p-2 -ml-2 rounded-full active:bg-gray-100 transition touch-manipulation"
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" style={{ color: primaryColor }} />
              </button>

              {/* Menu Normal - Desktop */}
              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="#inicio"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="font-medium hover:opacity-80 transition text-sm lg:text-base"
                  style={{ color: primaryColor }}
                >
                  Início
                </a>
                {categories.length > 0 &&
                  categories.map((category) => {
                    const categoryProducts = productsByCategory[category.id] || []
                    if (categoryProducts.length === 0) return null
                    return (
                      <a
                        key={category.id}
                        href={`#categoria-${category.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          const element = document.getElementById(`categoria-${category.id}`)
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }}
                        className="font-medium hover:opacity-80 transition text-sm lg:text-base"
                        style={{ color: primaryColor }}
                      >
                        {category.name}
                      </a>
                    )
                  })}
                {settings?.about_text && (
                  <a
                    href="#sobre"
                    onClick={(e) => {
                      e.preventDefault()
                      const footer = document.querySelector('footer')
                      if (footer) {
                        footer.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    className="font-medium hover:opacity-80 transition text-sm lg:text-base"
                    style={{ color: primaryColor }}
                  >
                    Sobre
                  </a>
                )}
              </nav>
            </div>

            {/* Logo - Centro */}
            <div className="flex-1 flex justify-center px-2">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  width={100}
                  height={35}
                  className="h-8 sm:h-10 object-contain max-w-[140px] sm:max-w-[180px]"
                  priority
                  data-logo="true"
                  data-element-id="logo"
                  data-element-type="logo"
                />
              ) : (
                <h1 
                  className="text-lg sm:text-xl md:text-2xl font-bold font-avenir truncate max-w-[200px] sm:max-w-none" 
                  style={{ color: primaryColor }}
                  data-store-name="true"
                  data-element-id="store-name"
                  data-element-type="text"
                >
                  {store.name}
                </h1>
              )}
            </div>

            {/* Carrinho - Direita */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 -mr-2 rounded-full active:bg-gray-100 transition touch-manipulation"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="w-6 h-6" style={{ color: primaryColor }} />
              {cart.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[10px] sm:text-xs rounded-full min-w-[18px] h-[18px] sm:w-5 sm:h-5 flex items-center justify-center font-semibold px-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Lateral - Mobile First */}
      {showMenu && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-0 h-full w-full sm:max-w-sm bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-3 sm:p-4 border-b">
                <h2 className="text-lg sm:text-xl font-bold font-avenir" style={{ color: primaryColor }}>
                  Menu
                </h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 active:bg-gray-100 rounded-full touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <nav className="space-y-1 sm:space-y-2">
                  <a
                    href="#inicio"
                    onClick={() => {
                      setShowMenu(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="block py-3 px-4 rounded-lg active:bg-gray-50 transition font-medium text-base sm:text-lg touch-manipulation"
                    style={{ color: primaryColor }}
                  >
                    Início
                  </a>
                  {categories.length > 0 &&
                    categories.map((category) => {
                      const categoryProducts = productsByCategory[category.id] || []
                      if (categoryProducts.length === 0) return null
                      return (
                        <a
                          key={category.id}
                          href={`#categoria-${category.id}`}
                          onClick={() => {
                            setShowMenu(false)
                            const element = document.getElementById(`categoria-${category.id}`)
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }}
                          className="block py-3 px-4 rounded-lg active:bg-gray-50 transition font-medium text-base sm:text-lg touch-manipulation"
                          style={{ color: primaryColor }}
                        >
                          {category.name}
                        </a>
                      )
                    })}
                  {settings?.about_text && (
                    <a
                      href="#sobre"
                      onClick={() => {
                        setShowMenu(false)
                        const footer = document.querySelector('footer')
                        if (footer) {
                          footer.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }}
                      className="block py-3 px-4 rounded-lg active:bg-gray-50 transition font-medium text-base sm:text-lg touch-manipulation"
                      style={{ color: primaryColor }}
                    >
                      Sobre nós
                    </a>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Banner - Mobile First */}
      {announcements && announcements.length > 0 && (
        <div className="w-full relative overflow-hidden">
          {announcements.length === 1 ? (
            <a
              href={announcements[0].link_url || '#'}
              onClick={(e) => {
                if (isPreviewMode || !announcements[0].link_url) {
                  e.preventDefault()
                }
              }}
              className="block w-full"
              data-announcement="true"
              data-element-id={`announcement-0`}
              data-element-type="announcement"
            >
              <div
                className="w-full py-2 sm:py-3 px-4 flex items-center justify-center text-sm sm:text-base font-medium"
                style={{
                  backgroundColor: announcements[0].background_color || '#EC4899',
                  color: announcements[0].text_color || '#FFFFFF',
                }}
              >
                {announcements[0].icon && <span className="mr-2">{announcements[0].icon}</span>}
                <span className="text-center">{announcements[0].text}</span>
              </div>
            </a>
          ) : (
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentAnnouncementIndex * 100}%)`,
                  }}
                >
                  {announcements.map((announcement, index) => (
                    <a
                      key={announcement.id}
                      href={announcement.link_url || '#'}
                      onClick={(e) => {
                        if (isPreviewMode || !announcement.link_url) {
                          e.preventDefault()
                        }
                      }}
                      className="block w-full flex-shrink-0"
                      data-announcement="true"
                      data-element-id={`announcement-${index}`}
                      data-element-type="announcement"
                    >
                      <div
                        className="w-full py-2 sm:py-3 px-4 flex items-center justify-center text-sm sm:text-base font-medium"
                        style={{
                          backgroundColor: announcement.background_color || '#EC4899',
                          color: announcement.text_color || '#FFFFFF',
                        }}
                      >
                        {announcement.icon && <span className="mr-2">{announcement.icon}</span>}
                        <span className="text-center">{announcement.text}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Navigation arrows */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentAnnouncementIndex((prev) =>
                    prev === 0 ? announcements.length - 1 : prev - 1
                  )
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition"
                style={{ color: announcements[currentAnnouncementIndex]?.text_color || '#FFFFFF' }}
                aria-label="Anúncio anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentAnnouncementIndex((prev) =>
                    prev === announcements.length - 1 ? 0 : prev + 1
                  )
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition"
                style={{ color: announcements[currentAnnouncementIndex]?.text_color || '#FFFFFF' }}
                aria-label="Próximo anúncio"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Auto-rotate (optional) */}
              {announcements.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentAnnouncementIndex(index)
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition ${
                        index === currentAnnouncementIndex
                          ? 'opacity-100'
                          : 'opacity-50'
                      }`}
                      style={{
                        backgroundColor: announcements[currentAnnouncementIndex]?.text_color || '#FFFFFF',
                      }}
                      aria-label={`Ir para anúncio ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Banners - Mobile First */}
      {banners.length > 0 && (
        <section 
          className="relative"
          style={{ 
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          {banners.length === 1 ? (
            <div 
              className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-100 overflow-hidden"
              style={{ width: '100%' }}
            >
              {/* Imagem Mobile */}
              {banners[0].image_url_mobile && (
                <Image
                  src={banners[0].image_url_mobile}
                  alt={banners[0].title || 'Banner'}
                  fill
                  className="object-contain md:hidden"
                  sizes="100vw"
                  priority
                />
              )}
              {/* Imagem Desktop */}
              <Image
                src={banners[0].image_url}
                alt={banners[0].title || 'Banner'}
                fill
                className={`object-cover ${banners[0].image_url_mobile ? 'hidden md:block' : ''}`}
                sizes="100vw"
                priority
              />
              {(banners[0].title || banners[0].subtitle) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="text-center text-white px-4">
                    {banners[0].title && (
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">{banners[0].title}</h2>
                    )}
                    {banners[0].subtitle && (
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl">{banners[0].subtitle}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="carousel w-full">
              {banners.map((banner, index) => (
                <div 
                  key={banner.id} 
                  className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-100 overflow-hidden"
                  style={{ width: '100%' }}
                  data-banner="true"
                  data-element-id={`banner-${index}`}
                  data-element-type="banner"
                >
                  {/* Imagem Mobile */}
                  {banner.image_url_mobile && (
                    <Image
                      src={banner.image_url_mobile}
                      alt={banner.title || 'Banner'}
                      fill
                      className="object-contain md:hidden"
                      sizes="100vw"
                    />
                  )}
                  {/* Imagem Desktop */}
                  <Image
                    src={banner.image_url}
                    alt={banner.title || 'Banner'}
                    fill
                    className={`object-cover ${banner.image_url_mobile ? 'hidden md:block' : ''}`}
                    sizes="100vw"
                  />
                  {(banner.title || banner.subtitle) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="text-center text-white px-4">
                        {banner.title && (
                          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">{banner.title}</h2>
                        )}
                        {banner.subtitle && (
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl">{banner.subtitle}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Products Section - Mobile First */}
      {(() => {
        // Filtrar produtos em destaque baseado em featured_products ou is_featured
        const featuredProductIds = settings?.featured_products || []
        const featuredProductsList = featuredProductIds.length > 0
          ? products.filter(p => featuredProductIds.includes(p.id))
          : products.filter(p => p.is_featured)
        
        if (featuredProductsList.length === 0) return null

        const featuredTitle = settings?.featured_section_title || 'Destaques'
        
        return (
          <section 
            className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8"
            data-element-id="featured-products"
            data-element-type="featured-products"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-avenir px-1" style={{ color: primaryColor }}>
              {featuredTitle}
            </h2>
            <div className={gridClasses}>
              {featuredProductsList.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100"
                  data-product="true"
                  data-element-id={`product-${product.id}`}
                  data-element-type="product"
                >
                  {/* Imagem com aspect ratio fixo - Mobile First */}
                  <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    {/* Badge de desconto */}
                    {product.original_price && product.original_price > product.price && product.discount_percentage && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{product.discount_percentage}% OFF
                        </span>
                      </div>
                    )}
                    {/* Badge de destaque */}
                    {product.is_featured && !(product.original_price && product.original_price > product.price && product.discount_percentage) && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Destaque
                      </div>
                    )}
                    {/* Badge de estoque */}
                    {!product.is_unlimited_stock && product.stock_quantity !== null && (
                      <div className="absolute top-2 left-2">
                        {product.stock_quantity > 0 ? (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {product.stock_quantity} em estoque
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Esgotado
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Conteúdo do card */}
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-1">
                        {product.description}
                      </p>
                    )}
                    
                    {/* Preço */}
                    <div className="mb-3 sm:mb-4">
                      {product.original_price && product.original_price > product.price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                          {product.discount_percentage && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                              -{product.discount_percentage}% OFF
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <button
                        onClick={(e) => {
                          if (isPreviewMode) {
                            e.preventDefault()
                            e.stopPropagation()
                            return
                          }
                          setSelectedProduct(product)
                          setProductQuantity(1)
                        }}
                        className="w-full py-2 sm:py-2.5 rounded-lg text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primaryColor }}
                        disabled={isPreviewMode}
                        data-preview-disabled={isPreviewMode}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">Ver Detalhes</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })()}

      {/* Products by Category - Mobile First */}
      <main className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {categories.length > 0 ? (
          categories.map((category) => {
            const categoryProducts = productsByCategory[category.id] || []
            if (categoryProducts.length === 0) return null

            return (
              <section 
                key={category.id} 
                id={`categoria-${category.id}`} 
                className="mb-8 sm:mb-12 scroll-mt-16 sm:scroll-mt-20"
                data-element-id={`category-${category.id}`}
                data-element-type="category"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-avenir px-1" style={{ color: primaryColor }}>
                  {category.name}
                </h2>
                <div className={gridClasses}>
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100"
                      data-product="true"
                      data-element-id={`product-${product.id}`}
                      data-element-type="product"
                    >
                      {/* Imagem com aspect ratio fixo - Mobile First */}
                      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        {/* Badge de desconto */}
                        {product.original_price && product.original_price > product.price && product.discount_percentage && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                              -{product.discount_percentage}% OFF
                            </span>
                          </div>
                        )}
                        {/* Badge de destaque */}
                        {product.is_featured && !(product.original_price && product.original_price > product.price && product.discount_percentage) && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Destaque
                          </div>
                        )}
                        {/* Badge de estoque */}
                        {!product.is_unlimited_stock && product.stock_quantity !== null && (
                          <div className="absolute top-2 left-2">
                            {product.stock_quantity > 0 ? (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                {product.stock_quantity} em estoque
                              </span>
                            ) : (
                              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Esgotado
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Conteúdo do card */}
                      <div className="p-3 sm:p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]">{product.name}</h3>
                        {product.description && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-1">
                            {product.description}
                          </p>
                        )}
                        
                        {/* Preço */}
                        <div className="mb-3 sm:mb-4">
                          {product.original_price && product.original_price > product.price && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.original_price)}
                              </span>
                              {product.discount_percentage && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                                  -{product.discount_percentage}% OFF
                                </span>
                              )}
                            </div>
                          )}
                          <span className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex flex-col gap-2 mt-auto">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setProductQuantity(1)
                            }}
                            className="w-full py-2 sm:py-2.5 rounded-lg text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">Ver Detalhes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <div className={gridClasses}>
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100"
              >
                {/* Imagem com aspect ratio fixo - Mobile First */}
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {/* Badge de desconto */}
                  {product.original_price && product.original_price > product.price && product.discount_percentage && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{product.discount_percentage}% OFF
                      </span>
                    </div>
                  )}
                  {/* Badge de destaque */}
                  {product.is_featured && !(product.original_price && product.original_price > product.price && product.discount_percentage) && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Destaque
                    </div>
                  )}
                  {/* Badge de estoque */}
                  {!product.is_unlimited_stock && product.stock_quantity !== null && (
                    <div className="absolute top-2 left-2">
                      {product.stock_quantity > 0 ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {product.stock_quantity} em estoque
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Esgotado
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Conteúdo do card */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                  )}
                  
                  {/* Preço */}
                  <div className="mb-3 sm:mb-4">
                    {product.original_price && product.original_price > product.price && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                        {product.discount_percentage && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                            -{product.discount_percentage}% OFF
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedProduct(product)
                        setProductQuantity(1)
                      }}
                      className="w-full py-2 sm:py-2.5 rounded-lg text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Ver Detalhes</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto disponível no momento.</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar - Mobile First */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-3 sm:p-4 border-b">
                <h2 className="text-lg sm:text-xl font-bold font-avenir" style={{ color: primaryColor }}>
                  Carrinho
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 active:bg-gray-100 rounded-full touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 sm:gap-4 border-b pb-3 sm:pb-4">
                        {item.image_url && (
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{item.name}</h3>
                          <p className="text-xs sm:text-sm font-semibold" style={{ color: primaryColor }}>
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 sm:p-1 rounded active:bg-gray-100 transition touch-manipulation"
                            style={{ color: primaryColor }}
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <span
                            className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base"
                            style={{ color: primaryColor }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 sm:p-1 rounded active:bg-gray-100 transition touch-manipulation"
                            style={{ color: primaryColor }}
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 sm:p-1 active:bg-gray-100 rounded transition touch-manipulation ml-1"
                          style={{ color: primaryColor }}
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t p-3 sm:p-4 space-y-3 sm:space-y-4 safe-area-inset-bottom">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total:</span>
                    <span style={{ color: primaryColor }}>{formatPrice(getTotal())}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      if (isPreviewMode) {
                        e.preventDefault()
                        e.stopPropagation()
                        return
                      }
                      handleCheckout()
                    }}
                    disabled={isPreviewMode}
                    className="w-full py-3 sm:py-3.5 rounded-lg text-white font-semibold text-sm sm:text-base active:opacity-75 hover:opacity-90 transition touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                    data-preview-disabled={isPreviewMode}
                  >
                    Finalizar Pedido no WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedProduct(null)} />
          <div className="relative min-h-screen flex flex-col bg-white">
            {/* Header fixo */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 flex items-center justify-between p-4">
              <h2 className="text-lg font-bold font-avenir" style={{ color: primaryColor }}>
                Detalhes do Produto
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1">
              {/* Imagem do produto */}
              <div className="relative w-full aspect-square bg-gray-50">
                {selectedProduct.image_url ? (
                  <Image
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Informações do produto - Mobile First */}
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 font-avenir leading-tight">
                    {selectedProduct.name}
                  </h1>
                  {selectedProduct.description && (
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  )}
                </div>

                {/* Preço */}
                <div className="py-3 sm:py-4 border-t border-b border-gray-200">
                  {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(selectedProduct.original_price)}
                      </span>
                      {selectedProduct.discount_percentage && (
                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded">
                          -{selectedProduct.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mb-1 sm:mb-2">
                    <span className="text-2xl sm:text-3xl font-bold" style={{ color: primaryColor }}>
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Pagamento via WhatsApp
                  </p>
                </div>

                {/* Estoque */}
                {!selectedProduct.is_unlimited_stock && selectedProduct.stock_quantity !== null && (
                  <div>
                    {selectedProduct.stock_quantity > 0 ? (
                      <p className="text-sm text-green-600 font-medium">
                        {selectedProduct.stock_quantity} unidades em estoque
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 font-medium">
                        Produto esgotado
                      </p>
                    )}
                  </div>
                )}

                {/* Seletor de quantidade */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <button
                    onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                    disabled={productQuantity <= 1}
                    className="w-10 h-10 rounded-lg border-2 flex items-center justify-center font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{productQuantity}</span>
                  <button
                    onClick={() => {
                      const maxQty = selectedProduct.is_unlimited_stock 
                        ? 999 
                        : (selectedProduct.stock_quantity || 0)
                      setProductQuantity(Math.min(maxQty, productQuantity + 1))
                    }}
                    disabled={
                      !selectedProduct.is_unlimited_stock && 
                      productQuantity >= (selectedProduct.stock_quantity || 0)
                    }
                    className="w-10 h-10 rounded-lg border-2 flex items-center justify-center font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Botão de compra fixo na parte inferior - Mobile First */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 safe-area-inset-bottom">
              <button
                onClick={(e) => {
                  if (isPreviewMode) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                  }
                  // Adicionar quantidade ao carrinho
                  for (let i = 0; i < productQuantity; i++) {
                    addToCart(selectedProduct)
                  }
                  setSelectedProduct(null)
                  setShowCart(true)
                }}
                disabled={
                  isPreviewMode ||
                  (!selectedProduct.is_unlimited_stock && 
                  (selectedProduct.stock_quantity || 0) === 0)
                }
                className="w-full py-3 sm:py-4 rounded-lg text-white font-bold text-base sm:text-lg hover:opacity-90 active:opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 touch-manipulation"
                style={{ backgroundColor: primaryColor }}
                data-preview-disabled={isPreviewMode}
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                COMPRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Mobile First */}
      <footer className="bg-gray-50 mt-8 sm:mt-12 border-t border-gray-200" data-element-id="footer" data-element-type="footer">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Informações da Loja */}
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ color: primaryColor }}>
                {store.name}
              </h3>
              {settings?.about_text && (
                <p className="text-gray-600 text-sm mb-4">{settings.about_text}</p>
              )}
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contato</h3>
              <div className="space-y-3">
                {store.phone && (
                  <a
                    href={isPreviewMode ? '#' : `tel:${store.phone}`}
                    onClick={(e) => {
                      if (isPreviewMode) {
                        e.preventDefault()
                      }
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{store.phone}</span>
                  </a>
                )}
                {store.whatsapp && (
                  <a
                    href={isPreviewMode ? '#' : generateWhatsAppLink(store.whatsapp, 'Olá!')}
                    onClick={(e) => {
                      if (isPreviewMode) {
                        e.preventDefault()
                      }
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">WhatsApp: {store.whatsapp}</span>
                  </a>
                )}
                {settings?.address && settings?.show_address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{settings.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Informações</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Pedidos via WhatsApp</p>
                <p className="text-xs text-gray-500 mt-4">
                  Powered by{' '}
                  <a
                    href={isPreviewMode ? '#' : 'https://shopey.app'}
                    onClick={(e) => {
                      if (isPreviewMode) {
                        e.preventDefault()
                      }
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Shopey
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
