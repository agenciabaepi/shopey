'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md'
          : 'bg-[#004DF0]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {scrolled ? (
              <Logo variant="black" href="/" className="h-8 w-auto" />
            ) : (
              <Logo variant="white" href="/" className="h-8 w-auto" />
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link
              href="#features"
              className={`transition ${
                scrolled
                  ? 'text-[#1A1A1A] hover:text-[#004DF0]'
                  : 'text-white hover:text-white/80'
              }`}
            >
              Funcionalidades
            </Link>
            <Link
              href="#benefits"
              className={`transition ${
                scrolled
                  ? 'text-[#1A1A1A] hover:text-[#004DF0]'
                  : 'text-white hover:text-white/80'
              }`}
            >
              Benefícios
            </Link>
            <Link
              href="#pricing"
              className={`transition ${
                scrolled
                  ? 'text-[#1A1A1A] hover:text-[#004DF0]'
                  : 'text-white hover:text-white/80'
              }`}
            >
              Planos
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                scrolled
                  ? 'border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                  : 'border-2 border-white text-white hover:bg-white hover:text-[#004DF0]'
              }`}
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                scrolled
                  ? 'bg-[#004DF0] text-white hover:bg-[#0038B8]'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
              }`}
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
