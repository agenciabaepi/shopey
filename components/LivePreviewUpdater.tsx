'use client'

import { useEffect } from 'react'

interface LivePreviewUpdaterProps {
  store: any
  settings: any
  announcements: any[]
  banners: any[]
  categories: any[]
  products: any[]
}

export default function LivePreviewUpdater({
  store,
  settings,
  announcements,
  banners,
  categories,
  products,
}: LivePreviewUpdaterProps) {
  useEffect(() => {
    // Função auxiliar para atualizar classes do grid
    const updateGridClasses = (
      gridElement: HTMLElement,
      updateType: string,
      data: number,
      currentSettings: any
    ) => {
      const mobile = updateType === 'products_per_row_mobile' 
        ? data 
        : (currentSettings?.products_per_row_mobile || 1)
      const desktop = updateType === 'products_per_row'
        ? data
        : (currentSettings?.products_per_row || 4)
      
      const mobileCols = mobile === 2 ? 'grid-cols-2' : 'grid-cols-1'
      let gridClasses = `grid ${mobileCols}`
      
      if (desktop === 1) {
        gridClasses += ' sm:grid-cols-1'
      } else if (desktop === 2) {
        gridClasses += ' sm:grid-cols-2'
      } else if (desktop === 3) {
        gridClasses += ' sm:grid-cols-2 lg:grid-cols-3'
      } else {
        gridClasses += ' sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }
      
      gridElement.className = gridClasses + ' gap-6'
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_UPDATE') {
        const { updateType, data } = event.data

        // Atualizar título da seção de produtos em destaque
        if (updateType === 'featured_section_title') {
          const titleElement = document.querySelector('[data-element-id="featured-products"] h2')
          if (titleElement) {
            titleElement.textContent = data
          }
        }

        // Atualizar nome da loja
        if (updateType === 'store_name') {
          const storeNameElement = document.querySelector('[data-element-id="store-name"]')
          if (storeNameElement) {
            storeNameElement.textContent = data
          }
        }

        // Atualizar grid classes baseado em products_per_row
        if (updateType === 'products_per_row' || updateType === 'products_per_row_mobile') {
          // Atualizar grid de produtos em destaque
          const featuredSection = document.querySelector('[data-element-id="featured-products"]')
          if (featuredSection) {
            const gridElement = featuredSection.querySelector('.grid')
            if (gridElement) {
              updateGridClasses(gridElement as HTMLElement, updateType, data, settings)
            }
          }
          
          // Atualizar grids de categorias também
          document.querySelectorAll('[data-element-type="category"] .grid').forEach((gridElement) => {
            updateGridClasses(gridElement as HTMLElement, updateType, data, settings)
          })
        }

        // Atualizar cor primária
        if (updateType === 'primary_color') {
          // Atualizar todos os elementos que usam a cor primária
          const style = document.createElement('style')
          style.id = 'dynamic-primary-color'
          style.textContent = `
            [style*="color"]:not([data-ignore-color]),
            header a,
            header button,
            footer a,
            button[style*="background"],
            .text-primary {
              color: ${data} !important;
            }
            [style*="borderColor"] {
              border-color: ${data} !important;
            }
            [style*="backgroundColor"]:not([data-ignore-bg]) {
              background-color: ${data} !important;
            }
          `
          
          // Remover estilo anterior
          const existingStyle = document.getElementById('dynamic-primary-color')
          if (existingStyle) {
            existingStyle.remove()
          }
          
          document.head.appendChild(style)
          
          // Atualizar elementos específicos
          document.querySelectorAll('[data-element-type="text"]').forEach((el) => {
            const htmlEl = el as HTMLElement
            htmlEl.style.color = data
          })
          
          // Atualizar botões e links no header
          document.querySelectorAll('header a, header button, footer a').forEach((el) => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style.color) {
              htmlEl.style.color = data
            }
          })
        }

        // Atualizar anúncios
        if (updateType === 'announcement_text') {
          const { index, text } = data
          const container = document.querySelector('[data-element-id="announcement-container"]')
          if (container) {
            // Se há apenas 1 anúncio, procurar diretamente
            const singleLink = container.querySelector('a')
            if (singleLink) {
              const textEl = singleLink.querySelector('span')
              if (textEl) {
                textEl.textContent = text
                return
              }
            }
            // Se há múltiplos anúncios, procurar pelo índice
            const links = container.querySelectorAll('a')
            if (links[index]) {
              const textEl = links[index].querySelector('span')
              if (textEl) {
                textEl.textContent = text
                return
              }
            }
          }
          // Fallback: tentar encontrar pelo ID antigo (para compatibilidade)
          const announcementEl = document.querySelector(`[data-element-id="announcement-${index}"]`)
          if (announcementEl) {
            const textEl = announcementEl.querySelector('span')
            if (textEl) {
              textEl.textContent = text
            }
          }
        }

        // Atualizar cor de fundo de anúncio
        if (updateType === 'announcement_bg_color') {
          const { index, color } = data
          const container = document.querySelector('[data-element-id="announcement-container"]')
          if (container) {
            // Se há apenas 1 anúncio, procurar diretamente
            const singleLink = container.querySelector('a')
            if (singleLink) {
              const divEl = singleLink.querySelector('div') as HTMLElement
              if (divEl) {
                divEl.style.backgroundColor = color
                return
              }
            }
            // Se há múltiplos anúncios, procurar pelo índice
            const links = container.querySelectorAll('a')
            if (links[index]) {
              const divEl = links[index].querySelector('div') as HTMLElement
              if (divEl) {
                divEl.style.backgroundColor = color
                return
              }
            }
          }
          // Fallback: tentar encontrar pelo ID antigo (para compatibilidade)
          const announcementEl = document.querySelector(`[data-element-id="announcement-${index}"]`) as HTMLElement
          if (announcementEl) {
            announcementEl.style.backgroundColor = color
          }
        }

        // Atualizar cor de texto de anúncio
        if (updateType === 'announcement_text_color') {
          const { index, color } = data
          const container = document.querySelector('[data-element-id="announcement-container"]')
          if (container) {
            // Se há apenas 1 anúncio, procurar diretamente
            const singleLink = container.querySelector('a')
            if (singleLink) {
              const divEl = singleLink.querySelector('div') as HTMLElement
              if (divEl) {
                divEl.style.color = color
                return
              }
            }
            // Se há múltiplos anúncios, procurar pelo índice
            const links = container.querySelectorAll('a')
            if (links[index]) {
              const divEl = links[index].querySelector('div') as HTMLElement
              if (divEl) {
                divEl.style.color = color
                return
              }
            }
          }
          // Fallback: tentar encontrar pelo ID antigo (para compatibilidade)
          const announcementEl = document.querySelector(`[data-element-id="announcement-${index}"]`) as HTMLElement
          if (announcementEl) {
            announcementEl.style.color = color
          }
        }

        // Atualizar logo
        if (updateType === 'logo') {
          const logoElement = document.querySelector('[data-element-id="logo"]') as HTMLImageElement
          if (logoElement) {
            logoElement.src = data
          }
        }

        // Atualizar configurações do header
        if (updateType.startsWith('header_')) {
          const headerElement = document.querySelector('[data-element-id="header"]') as HTMLElement
          if (!headerElement) return

          // O campo pode vir como 'header_background_color' ou 'background_color'
          // Se começar com 'header_', remover; caso contrário, usar como está
          let field = updateType.startsWith('header_') 
            ? updateType.replace('header_', '')
            : updateType
          
          // Se o campo ainda começa com 'header_', remover novamente (caso de header_mobile_*)
          if (field.startsWith('header_')) {
            field = field.replace('header_', '')
          }
          
          if (field === 'background_color') {
            headerElement.style.backgroundColor = data
          } else if (field === 'text_color') {
            headerElement.querySelectorAll('a, h1, span').forEach((el) => {
              const htmlEl = el as HTMLElement
              htmlEl.style.color = data
            })
          } else if (field === 'icon_color') {
            headerElement.querySelectorAll('svg').forEach((el) => {
              const htmlEl = el as unknown as HTMLElement
              htmlEl.style.color = data
            })
            headerElement.querySelectorAll('button').forEach((el) => {
              const htmlEl = el as HTMLElement
              htmlEl.style.color = data
            })
          } else if (field === 'logo_position') {
            const logoContainer = headerElement.querySelector('[data-element-id="logo"], [data-element-id="store-name"]')?.parentElement as HTMLElement
            if (logoContainer) {
              logoContainer.className = logoContainer.className.replace(/justify-(start|center|end)/g, '')
              if (data === 'left') {
                logoContainer.className += ' justify-start'
              } else if (data === 'center') {
                logoContainer.className += ' justify-center'
              } else if (data === 'right') {
                logoContainer.className += ' justify-end'
              }
            }
          } else if (field === 'logo_size') {
            const logoElement = document.querySelector('[data-element-id="logo"]') as HTMLImageElement
            if (logoElement) {
              logoElement.className = logoElement.className.replace(/h-\d+|sm:h-\d+|max-w-\[.*?\]|max-w-\d+/g, '').trim()
              if (data === 'small') {
                logoElement.className += ' h-6 sm:h-7 object-contain max-w-[100px] sm:max-w-[120px]'
              } else if (data === 'medium') {
                logoElement.className += ' h-8 sm:h-10 object-contain max-w-[140px] sm:max-w-[180px]'
              } else if (data === 'large') {
                logoElement.className += ' h-10 sm:h-12 object-contain max-w-[200px] sm:max-w-[240px]'
              }
            }
            const storeNameElement = document.querySelector('[data-element-id="store-name"]') as HTMLElement
            if (storeNameElement) {
              storeNameElement.className = storeNameElement.className.replace(/text-(base|lg|xl|2xl|3xl)/g, '').trim()
              if (data === 'small') {
                storeNameElement.className += ' text-base sm:text-lg'
              } else if (data === 'medium') {
                storeNameElement.className += ' text-lg sm:text-xl md:text-2xl'
              } else if (data === 'large') {
                storeNameElement.className += ' text-xl sm:text-2xl md:text-3xl'
              }
            }
          } else if (field === 'menu_position') {
            const menuContainer = headerElement.querySelector('nav')?.parentElement as HTMLElement
            if (menuContainer) {
              menuContainer.className = menuContainer.className.replace(/justify-(start|center|end)/g, '').trim()
              if (data === 'left') {
                menuContainer.className += ' justify-start'
              } else if (data === 'center') {
                menuContainer.className += ' justify-center'
              } else if (data === 'right') {
                menuContainer.className += ' justify-end'
              }
            }
          } else if (field === 'cart_position') {
            const cartContainer = headerElement.querySelector('button[aria-label*="carrinho"], button[aria-label*="cart"]')?.parentElement as HTMLElement
            if (cartContainer) {
              if (data === 'left') {
                cartContainer.className = cartContainer.className.replace(/ml-auto|order-first/g, '') + ' order-first'
              } else {
                cartContainer.className = cartContainer.className.replace(/order-first/g, '')
              }
            }
          } else if (field === 'mobile_background_color' || field === 'mobile_text_color' || field === 'mobile_icon_color') {
            // Aplicar via CSS media query
            const styleId = `header-mobile-${field}`
            let existingStyle = document.getElementById(styleId)
            if (!existingStyle) {
              existingStyle = document.createElement('style')
              existingStyle.id = styleId
              document.head.appendChild(existingStyle)
            }
            
            const prop = field.replace('mobile_', '').replace('_', '-')
            const headerElement = document.querySelector('[data-element-id="header"]') as HTMLElement
            
            if (prop === 'background-color') {
              existingStyle.textContent = `
                @media (max-width: 768px) {
                  [data-element-id="header"] {
                    background-color: ${data} !important;
                  }
                }
              `
              // Sempre aplicar diretamente também (para garantir que funcione em preview mobile)
              // Como estamos editando configurações mobile, sempre aplicar quando o viewport for <= 768px
              if (headerElement) {
                headerElement.setAttribute('data-mobile-bg-color', data)
                // Aplicar diretamente se estiver em mobile (verificar múltiplas condições)
                const isMobile = window.innerWidth <= 768 || 
                                document.documentElement.clientWidth <= 768 ||
                                document.body.clientWidth <= 768 ||
                                window.matchMedia('(max-width: 768px)').matches
                if (isMobile) {
                  headerElement.style.setProperty('background-color', data, 'important')
                }
              }
            } else if (prop === 'text-color') {
              existingStyle.textContent = `
                @media (max-width: 768px) {
                  [data-element-id="header"] a,
                  [data-element-id="header"] h1,
                  [data-element-id="header"] span {
                    color: ${data} !important;
                  }
                }
              `
              // Sempre aplicar diretamente também (para garantir que funcione em preview mobile)
              // Como estamos editando configurações mobile, sempre aplicar quando o viewport for <= 768px
              if (headerElement) {
                headerElement.setAttribute('data-mobile-text-color', data)
                // Aplicar diretamente se estiver em mobile (verificar múltiplas condições)
                const isMobile = window.innerWidth <= 768 || 
                                document.documentElement.clientWidth <= 768 ||
                                document.body.clientWidth <= 768 ||
                                window.matchMedia('(max-width: 768px)').matches
                if (isMobile) {
                  headerElement.querySelectorAll('a, h1, span').forEach((el) => {
                    const htmlEl = el as HTMLElement
                    htmlEl.style.setProperty('color', data, 'important')
                  })
                }
              }
            } else if (prop === 'icon-color') {
              existingStyle.textContent = `
                @media (max-width: 768px) {
                  [data-element-id="header"] svg,
                  [data-element-id="header"] button {
                    color: ${data} !important;
                  }
                }
              `
              // Sempre aplicar diretamente também (para garantir que funcione em preview mobile)
              // Como estamos editando configurações mobile, sempre aplicar quando o viewport for <= 768px
              if (headerElement) {
                headerElement.setAttribute('data-mobile-icon-color', data)
                // Aplicar diretamente se estiver em mobile (verificar múltiplas condições)
                const isMobile = window.innerWidth <= 768 || 
                                document.documentElement.clientWidth <= 768 ||
                                document.body.clientWidth <= 768 ||
                                window.matchMedia('(max-width: 768px)').matches
                if (isMobile) {
                  headerElement.querySelectorAll('svg, button').forEach((el) => {
                    const htmlEl = el as HTMLElement
                    htmlEl.style.setProperty('color', data, 'important')
                  })
                }
              }
            }
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)
    
    // Listener para aplicar estilos mobile quando o iframe for redimensionado
    const applyMobileStyles = () => {
      const headerElement = document.querySelector('[data-element-id="header"]') as HTMLElement
      if (headerElement && window.innerWidth <= 768) {
        const mobileBgColor = headerElement.getAttribute('data-mobile-bg-color')
        const mobileTextColor = headerElement.getAttribute('data-mobile-text-color')
        const mobileIconColor = headerElement.getAttribute('data-mobile-icon-color')
        
        if (mobileBgColor) {
          headerElement.style.backgroundColor = mobileBgColor
        }
        if (mobileTextColor) {
          headerElement.querySelectorAll('a, h1, span').forEach((el) => {
            const htmlEl = el as HTMLElement
            htmlEl.style.color = mobileTextColor
          })
        }
        if (mobileIconColor) {
          headerElement.querySelectorAll('svg, button').forEach((el) => {
            const htmlEl = el as HTMLElement
            htmlEl.style.color = mobileIconColor
          })
        }
      }
    }
    
    // Aplicar estilos mobile ao carregar e ao redimensionar
    applyMobileStyles()
    window.addEventListener('resize', applyMobileStyles)

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('resize', applyMobileStyles)
    }
  }, [settings])

  return null
}


