'use client'

import { useState, useEffect, useRef } from 'react'
import { Edit } from 'lucide-react'

interface EditorOverlayProps {
  iframeRef: React.RefObject<HTMLIFrameElement>
  onElementSelect: (elementId: string, elementType: string) => void
  selectedElement: string | null
}

export default function EditorOverlay({ iframeRef, onElementSelect, selectedElement }: EditorOverlayProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const setupEditor = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (!iframeDoc || !iframeDoc.body) {
          // Aguardar carregamento
          setTimeout(setupEditor, 100)
          return
        }

    // Adicionar estilos para elementos editáveis
    const style = iframeDoc.createElement('style')
    style.id = 'editor-overlay-styles'
    style.textContent = `
      [data-element-id] {
        position: relative;
        cursor: pointer;
        transition: outline 0.2s;
      }
      [data-element-id]:hover {
        outline: 2px dashed #3b82f6 !important;
        outline-offset: 2px;
      }
      [data-element-id].selected {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px;
        position: relative;
      }
    `
    
    // Remover estilo anterior se existir
    const existingStyle = iframeDoc.getElementById('editor-overlay-styles')
    if (existingStyle) {
      existingStyle.remove()
    }
    iframeDoc.head.appendChild(style)

    // Adicionar event listeners para cliques
    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const target = e.target as HTMLElement
      const editable = target.closest('[data-element-id]') as HTMLElement
      
      if (editable) {
        const elementId = editable.getAttribute('data-element-id')
        const elementType = editable.getAttribute('data-element-type')
        
        if (elementId && elementType) {
          // Remover seleção anterior
          iframeDoc.querySelectorAll('[data-element-id].selected').forEach(el => {
            el.classList.remove('selected')
          })
          
          // Adicionar seleção atual
          editable.classList.add('selected')
          onElementSelect(elementId, elementType)
        }
      }
    }

    // Aguardar carregamento do iframe
    const initEditor = () => {
      if (iframeDoc.readyState === 'complete' || iframeDoc.readyState === 'interactive') {
        iframeDoc.addEventListener('click', handleClick, true)
      } else {
        iframeDoc.addEventListener('DOMContentLoaded', () => {
          iframeDoc.addEventListener('click', handleClick, true)
        })
        setTimeout(initEditor, 100)
      }
    }

    initEditor()

        // Cleanup
        return () => {
          try {
            iframeDoc.removeEventListener('click', handleClick, true)
          } catch (err) {
            // Ignorar erros
          }
        }
      } catch (err) {
        // Erro de CORS ou iframe não carregado
        console.log('EditorOverlay: Aguardando iframe carregar...')
      }
    }

    // Aguardar iframe carregar
    if (iframe.contentWindow) {
      setupEditor()
    } else {
      iframe.addEventListener('load', setupEditor)
    }

    return () => {
      iframe.removeEventListener('load', setupEditor)
    }
  }, [iframeRef, onElementSelect])

  // Aplicar seleção quando selectedElement mudar
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) return

      // Remover todas as seleções
      iframeDoc.querySelectorAll('[data-element-id].selected').forEach(el => {
        el.classList.remove('selected')
      })

      // Aplicar nova seleção
      if (selectedElement) {
        const selectedEl = iframeDoc.querySelector(`[data-element-id="${selectedElement}"]`)
        if (selectedEl) {
          selectedEl.classList.add('selected')
        }
      }
    } catch (err) {
      // Ignorar erros de CORS
    }
  }, [selectedElement, iframeRef])

  // Renderizar botão "Editar" flutuante quando elemento está selecionado
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !selectedElement || !iframe.contentWindow) {
      // Remover botão se não há seleção
      const btn = document.getElementById('editor-edit-button')
      if (btn) btn.remove()
      return
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
    if (!iframeDoc) return

    const selectedEl = iframeDoc.querySelector(`[data-element-id="${selectedElement}"]`)
    if (!selectedEl) return

    // Remover botão anterior se existir
    const existingButton = document.getElementById('editor-edit-button')
    if (existingButton) {
      existingButton.remove()
    }

    // Criar botão "Editar" no documento principal
    const editButton = document.createElement('div')
    editButton.id = 'editor-edit-button'
    editButton.innerHTML = `
      <button style="
        position: fixed;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        pointer-events: auto;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Editar
      </button>
    `

    // Posicionar botão baseado na posição do elemento no iframe
    const updateButtonPosition = () => {
      try {
        const rect = selectedEl.getBoundingClientRect()
        const iframeRect = iframe.getBoundingClientRect()
        
        const button = editButton.querySelector('button') as HTMLElement
        if (button) {
          button.style.top = `${rect.top + iframeRect.top - 45}px`
          button.style.left = `${rect.left + iframeRect.left}px`
        }
      } catch (err) {
        // Ignorar erros de CORS
      }
    }

    // Adicionar ao body do documento principal
    document.body.appendChild(editButton)
    updateButtonPosition()

    // Atualizar posição ao scroll
    const handleScroll = () => updateButtonPosition()
    window.addEventListener('scroll', handleScroll, true)
    iframe.contentWindow?.addEventListener('scroll', handleScroll, true)

    // Cleanup
    return () => {
      const btn = document.getElementById('editor-edit-button')
      if (btn) btn.remove()
      window.removeEventListener('scroll', handleScroll, true)
      iframe.contentWindow?.removeEventListener('scroll', handleScroll, true)
    }
  }, [selectedElement, iframeRef])

  return null
}


