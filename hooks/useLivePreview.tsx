'use client'

import { useEffect, useRef } from 'react'

interface LivePreviewUpdate {
  type: string
  data: any
}

export function useLivePreview(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const updatePreview = (update: LivePreviewUpdate) => {
    const iframe = iframeRef.current
    if (!iframe || !iframe.contentWindow) return

    try {
      // Enviar mensagem para o iframe
      const { type, ...rest } = update
      iframe.contentWindow.postMessage(
        {
          type: 'PREVIEW_UPDATE',
          ...rest,
        },
        '*'
      )
    } catch (err) {
      console.error('Erro ao atualizar preview:', err)
    }
  }

  return { updatePreview }
}


