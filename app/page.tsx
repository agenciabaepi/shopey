import Link from 'next/link'
import Header from '@/components/Header'
import Logo from '@/components/Logo'
import { ShoppingBag, Store, Smartphone, TrendingUp, Zap, Shield, BarChart3, Users, Clock, DollarSign, ArrowUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Inspirado no Goomer */}
      <section className="relative bg-gradient-to-br from-[#004DF0] via-[#0055FF] to-[#0066FF] py-20 lg:py-32 text-white overflow-hidden">
        {/* Gradiente adicional para profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0038B8]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 font-avenir">
              A solução completa em<br />
              <span className="text-white">Loja Virtual</span>
            </h1>
            
            {/* Benefits Cards - Estilo Goomer */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2">Até 20%</div>
                <div className="text-white/90">mais rapidez no atendimento</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2">Redução de até 30%</div>
                <div className="text-white/90">dos custos operacionais</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2">Aumento de até 40%</div>
                <div className="text-white/90">no lucro com as vendas</div>
              </div>
            </div>

            <Link
              href="/auth/register"
              className="inline-block bg-[#1A1A1A] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2A2A2A] transition shadow-lg"
            >
              Criar loja grátis
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#004DF0] mb-2">100%</div>
              <div className="text-[#1A1A1A]">Gratuito</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#004DF0] mb-2">5min</div>
              <div className="text-[#1A1A1A]">Para criar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#004DF0] mb-2">0%</div>
              <div className="text-[#1A1A1A]">Taxas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#004DF0] mb-2">∞</div>
              <div className="text-[#1A1A1A]">Produtos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4 font-avenir">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ferramentas completas para criar, gerenciar e crescer sua loja virtual
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#004DF0]/10 rounded-lg flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-[#004DF0]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A] font-avenir">Loja Personalizada</h3>
              <p className="text-gray-600">
                Crie uma loja única com seu próprio domínio, cores e layout. Totalmente personalizável.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#004DF0]/10 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-[#004DF0]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Gestão de Produtos</h3>
              <p className="text-gray-600">
                Adicione produtos ilimitados, organize por categorias e controle seu estoque facilmente.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#004DF0]/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-[#004DF0]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Pedidos via WhatsApp</h3>
              <p className="text-gray-600">
                Seus clientes finalizam pedidos diretamente no WhatsApp. Sem intermediários, sem taxas.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#004DF0]/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#004DF0]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Dashboard Completo</h3>
              <p className="text-gray-600">
                Acompanhe visitas, pedidos e estatísticas em tempo real. Tome decisões baseadas em dados.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#004DF0]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#004DF0]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Configuração Rápida</h3>
              <p className="text-gray-600">
                Em poucos minutos sua loja está no ar. Sem conhecimento técnico necessário.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#004DF0]/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#004DF0]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Seguro e Confiável</h3>
              <p className="text-gray-600">
                Hospedado na Vercel com Supabase. Alta performance e segurança garantida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4 font-avenir">
              Por que escolher o Shopey?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A] font-avenir">Aumente suas vendas</h3>
                    <p className="text-gray-600">
                      Tenha sua loja online 24/7. Seus clientes podem comprar a qualquer hora, de qualquer lugar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#004DF0]/10 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#004DF0]" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A] font-avenir">Economize tempo</h3>
                    <p className="text-gray-600">
                      Automatize o processo de pedidos. Receba tudo organizado no WhatsApp, sem precisar de atendentes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A] font-avenir">Melhore o atendimento</h3>
                    <p className="text-gray-600">
                      Seus clientes têm uma experiência melhor com cardápio digital, fotos e descrições detalhadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#004DF0]/5 rounded-2xl p-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-[#1A1A1A] font-avenir">Ideal para:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-[#004DF0] mr-2 font-bold">✓</span>
                    <span className="text-[#1A1A1A]">Restaurantes e lanchonetes</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#004DF0] mr-2 font-bold">✓</span>
                    <span className="text-[#1A1A1A]">Lojas de roupas e acessórios</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#004DF0] mr-2 font-bold">✓</span>
                    <span className="text-[#1A1A1A]">Padarias e confeitarias</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#004DF0] mr-2 font-bold">✓</span>
                    <span className="text-[#1A1A1A]">Farmácias e perfumarias</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#004DF0] mr-2 font-bold">✓</span>
                    <span className="text-[#1A1A1A]">Qualquer tipo de negócio</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#004DF0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 font-avenir">
            Pronto para começar a vender online?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Crie sua loja virtual agora mesmo. É grátis e leva menos de 5 minutos.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-[#1A1A1A] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2A2A2A] transition shadow-lg"
          >
            Criar minha loja grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo variant="white" href="/" className="h-8 w-auto mb-4" />
              <p className="text-gray-400">
                A plataforma mais simples para criar lojas virtuais e cardápios digitais.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-white transition">Funcionalidades</Link></li>
                <li><Link href="#benefits" className="hover:text-white transition">Benefícios</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition">Planos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">Sobre nós</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">Central de Ajuda</Link></li>
                <li><Link href="#" className="hover:text-white transition">Documentação</Link></li>
                <li><Link href="#" className="hover:text-white transition">Termos de Uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Shopey. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
