import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export function formatWhatsAppNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  return cleaned
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppNumber(phone)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}
