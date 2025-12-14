'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-600',
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      icon: 'text-yellow-600',
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'text-blue-600',
    },
  }

  const styles = variantStyles[variant]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 ${styles.icon}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3
                id="confirm-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p
            id="confirm-message"
            className="text-gray-600 mb-6 ml-10"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3 ml-10">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${styles.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


