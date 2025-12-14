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
      iframe.contentWindow.postMessage(
        {
          type: 'PREVIEW_UPDATE',
          ...update,
        },
        '*'
      )
    } catch (err) {
      console.error('Erro ao atualizar preview:', err)
    }
  }

  return { updatePreview }
}


