'use client'

import { useEffect } from 'react'

export default function PreviewGuard() {
  useEffect(() => {
    // Marcar como preview mode
    document.documentElement.setAttribute('data-preview-mode', 'true')
    
    // Prevenir navegação
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Prevenir mudanças de URL via history API
    const originalPushState = history.pushState
    history.pushState = function() {
      // Bloquear pushState em preview
      return
    }
    
    const originalReplaceState = history.replaceState
    history.replaceState = function() {
      // Bloquear replaceState em preview
      return
    }
    
    // Prevenir TODAS as interações - preview é apenas visual para edição
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Permitir apenas cliques em elementos editáveis (para seleção no editor)
      const isEditable = target.closest('[data-element-id]')
      
      // Se não for um elemento editável, bloquear tudo
      if (!isEditable) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
      
      // Mesmo em elementos editáveis, bloquear ações funcionais
      const button = target.closest('button')
      const link = target.closest('a')
      const isShoppingCart = target.closest('[aria-label*="carrinho"], [aria-label*="cart"]')
      const isProductButton = target.closest('button')?.textContent?.includes('Ver Detalhes') || 
                              target.closest('button')?.textContent?.includes('COMPRAR')
      
      // Bloquear botões funcionais (carrinho, comprar, etc)
      if (button && (isShoppingCart || isProductButton)) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
      
      // Bloquear links externos
      if (link && link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:')) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
    
    // Prevenir interações com formulários e botões
    const handleSubmit = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // Prevenir scroll em modais/carrosséis
    const handleWheel = (e: WheelEvent) => {
      // Permitir scroll normal da página, mas bloquear em elementos interativos
      const target = e.target as HTMLElement
      if (target.closest('.modal, .carousel, [role="dialog"]')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    
    document.addEventListener('click', handleClick, true)
    document.addEventListener('submit', handleSubmit, true)
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('submit', handleSubmit, true)
      document.removeEventListener('wheel', handleWheel)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])

  return null
}


