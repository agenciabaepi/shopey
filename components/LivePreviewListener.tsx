'use client'

import { useEffect } from 'react'

interface LivePreviewListenerProps {
  onUpdate: (type: string, data: any) => void
}

export default function LivePreviewListener({ onUpdate }: LivePreviewListenerProps) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar se é uma mensagem de atualização do preview
      if (event.data && event.data.type === 'PREVIEW_UPDATE') {
        const { type, data } = event.data
        onUpdate(type, data)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onUpdate])

  return null
}


