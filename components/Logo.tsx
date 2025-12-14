import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  variant?: 'white' | 'black' | 'blue'
  className?: string
  href?: string
}

export default function Logo({ variant = 'blue', className = '', href = '/' }: LogoProps) {
  const logoMap = {
    white: '/imagens/logobranco.png',
    black: '/imagens/logopreto.png',
    blue: '/imagens/logoazul.png',
  }

  const logo = (
    <Image
      src={logoMap[variant]}
      alt="Shopey"
      width={120}
      height={40}
      className={className}
      style={{ width: 'auto', height: 'auto' }}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href}>
        {logo}
      </Link>
    )
  }

  return logo
}
