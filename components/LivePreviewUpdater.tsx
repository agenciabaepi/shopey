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
          const announcementEl = document.querySelector(`[data-element-id="announcement-${index}"]`) as HTMLElement
          if (announcementEl) {
            announcementEl.style.backgroundColor = color
          }
        }

        // Atualizar cor de texto de anúncio
        if (updateType === 'announcement_text_color') {
          const { index, color } = data
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
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [settings])

  return null
}


