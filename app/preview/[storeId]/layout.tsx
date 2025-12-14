// Layout vazio para preview - não renderiza nada além do conteúdo
// Isso garante que não há menu, header ou qualquer outro elemento
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


