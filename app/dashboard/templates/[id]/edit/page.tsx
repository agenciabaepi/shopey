'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  Save,
  Image as ImageIcon,
  Megaphone,
  ArrowUp,
  ArrowDown,
  Home,
  Grid3x3,
  Package,
  ShoppingCart,
  Code
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { uploadImage, deleteImage } from '@/lib/supabase/storage'
import AnnouncementsSection from '@/components/template-editor/AnnouncementsSection'
import BannersSection from '@/components/template-editor/BannersSection'
import ProductsSection from '@/components/template-editor/ProductsSection'
import EditorOverlay from '@/components/template-editor/EditorOverlay'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'

type ViewMode = 'mobile' | 'desktop'
type ActiveSection = 'header' | 'announcements' | 'banners' | 'homepage' | 'products' | 'cart' | 'footer' | 'css' | null

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  const toast = useToast()

  const [viewMode, setViewMode] = useState<ViewMode>('mobile')
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(null)
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [selectedElementType, setSelectedElementType] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320) // Largura inicial do sidebar em pixels
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  const SIDEBAR_MIN_WIDTH = 240
  const SIDEBAR_MAX_WIDTH = 600

  useEffect(() => {
    loadStore()
  }, [])

  // Handle sidebar resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = e.clientX
      if (newWidth >= SIDEBAR_MIN_WIDTH && newWidth <= SIDEBAR_MAX_WIDTH) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH])

  const loadStore = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (storeData) {
      setStore(storeData)
      // URL do preview - sempre usar dados reais em modo de edição
      setPreviewUrl(`/preview/${storeData.id}/real`)
    }
  }

  const handleElementSelect = (elementId: string, elementType: string) => {
    setSelectedElement(elementId)
    setSelectedElementType(elementType)
    
    // Atualizar seção ativa baseado no tipo de elemento
    const typeToSection: Record<string, ActiveSection> = {
      'header': 'header',
      'logo': 'header',
      'store-name': 'header',
      'announcement': 'announcements',
      'banner': 'banners',
      'category': 'products', // Categorias são seções de produtos
      'featured-products': 'products',
      'product': 'products',
      'footer': 'footer',
    }
    
    const section = typeToSection[elementType]
    if (section) {
      setActiveSection(section)
    }
  }

  // Limpar seleção quando mudar de seção manualmente
  useEffect(() => {
    if (!selectedElement) return
    
    const typeToSection: Record<string, ActiveSection> = {
      'header': 'header',
      'logo': 'header',
      'store-name': 'header',
      'announcement': 'announcements',
      'banner': 'banners',
      'category': 'products', // Categorias são seções de produtos
      'featured-products': 'products',
      'product': 'products',
      'footer': 'footer',
    }
    
    const expectedSection = typeToSection[selectedElementType || '']
    if (expectedSection && activeSection !== expectedSection) {
      // Seção mudou manualmente, limpar seleção
      setSelectedElement(null)
      setSelectedElementType(null)
    }
  }, [activeSection])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return

    setUploadingLogo(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        setUploadingLogo(false)
        return
      }

      // Deletar logo antiga se existir
      if (store.logo_url) {
        await deleteImage(store.logo_url)
      }

      // Upload da nova logo
      const logoUrl = await uploadImage(file, 'logos', user.id)

      if (!logoUrl) {
        toast.error('Erro ao fazer upload da logo')
        setUploadingLogo(false)
        return
      }

      // Atualizar store com nova logo
      const { error } = await supabase
        .from('stores')
        .update({ logo_url: logoUrl })
        .eq('id', store.id)

      if (error) {
        toast.error('Erro ao salvar logo: ' + error.message)
        setUploadingLogo(false)
        return
      }

      setStore({ ...store, logo_url: logoUrl })
      toast.success('Logo atualizada com sucesso!')
      
      // Atualizar preview em tempo real
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'PREVIEW_UPDATE',
          updateType: 'logo',
          data: logoUrl,
        }, '*')
      }
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploadingLogo(false)
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = ''
      }
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      // Aqui vamos salvar todas as alterações
      toast.success('Alterações publicadas com sucesso!')
      setTimeout(() => {
        router.push('/dashboard/templates')
      }, 1500)
    } catch (error: any) {
      toast.error('Erro ao publicar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { id: 'header' as ActiveSection, label: 'Cabeçalho', icon: ArrowUp },
    { id: 'announcements' as ActiveSection, label: 'Avisos e Promoções', icon: Megaphone },
    { id: 'banners' as ActiveSection, label: 'Banners', icon: ImageIcon },
    { id: 'homepage' as ActiveSection, label: 'Página Inicial', icon: Home },
    { id: 'products' as ActiveSection, label: 'Lista de Produtos', icon: Grid3x3 },
    { id: 'cart' as ActiveSection, label: 'Carrinho de Compras', icon: ShoppingCart },
    { id: 'footer' as ActiveSection, label: 'Rodapé da Página', icon: ArrowDown },
    { id: 'css' as ActiveSection, label: 'Edição de CSS Avançada', icon: Code },
  ]

  // Se não tem store, não renderiza (aguardando carregamento)
  if (!store) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004DF0] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/templates"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Editar layout</h1>
            <p className="text-xs text-gray-500">• Layout atual</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-4 h-4 inline mr-1" />
              Celulares
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-4 h-4 inline mr-1" />
              Computadores
            </button>
          </div>


          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Publicando...' : 'Publicar alterações'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Settings with Submenu */}
        <aside 
          ref={sidebarRef}
          className="bg-white border-r border-gray-200 overflow-hidden relative flex-shrink-0"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-10"
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizing(true)
            }}
          />
          <div className="h-full flex relative">
            {/* Main Menu - Tela 1 */}
            <div 
              className={`
                absolute inset-0 transition-transform duration-300 ease-in-out bg-white
                ${selectedElement ? '-translate-x-full' : 'translate-x-0'}
              `}
            >
              <div className="p-4 h-full overflow-y-auto">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Configurações</h2>
                
                {/* Brand Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Imagem da sua marca</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      Logo
                    </button>
                  </div>
                </div>

                {/* Colors Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores da sua marca</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setActiveSection('header')
                        setSelectedElement(null)
                        setSelectedElementType(null)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                    >
                      Cor primária
                    </button>
                  </div>
                </div>

                {/* Font Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Tipo de Letra</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      Fonte
                    </button>
                  </div>
                </div>

                {/* Design Options */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Opções de design</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      Layout
                    </button>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Configurações avançadas</h3>
                  <div className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id)
                            // Abrir submenu quando clicar em uma seção
                            // O submenu será mostrado porque activeSection está definido
                            setSelectedElement(null)
                            setSelectedElementType(null)
                          }}
                          className={`
                            w-full text-left px-3 py-2 text-sm rounded transition flex items-center gap-2
                            ${
                              activeSection === section.id
                                ? 'bg-[#004DF0] text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          {section.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Submenu - Tela 2 (Editor) */}
            <div 
              className={`
                absolute inset-0 transition-transform duration-300 ease-in-out bg-white
                ${selectedElement || activeSection ? 'translate-x-0' : 'translate-x-full'}
              `}
            >
              <div className="p-4 h-full overflow-y-auto">
                {/* Header do Submenu */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => {
                      setSelectedElement(null)
                      setSelectedElementType(null)
                      setActiveSection(null) // Fechar submenu e voltar ao menu principal
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <h2 className="text-sm font-semibold text-gray-900 flex-1">
                    {selectedElement ? (
                      <>
                        Editando: {selectedElementType === 'header' ? 'Cabeçalho' :
                                   selectedElementType === 'logo' ? 'Logo' :
                                   selectedElementType === 'text' ? 'Nome da Loja' :
                                   selectedElementType === 'announcement' ? 'Aviso' :
                                   selectedElementType === 'banner' ? 'Banner' :
                                   selectedElementType === 'category' ? 'Categoria de Produtos' :
                                   selectedElementType === 'featured-products' ? 'Produtos em Destaque' :
                                   selectedElementType === 'product' ? 'Produto' :
                                   selectedElementType === 'footer' ? 'Rodapé' :
                                   'Elemento'}
                      </>
                    ) : (
                      sections.find((s) => s.id === activeSection)?.label || 'Configurações'
                    )}
                  </h2>
                </div>
                
                {selectedElement && (
                  <p className="text-xs text-gray-500 mb-4">
                    ID: {selectedElement}
                  </p>
                )}

                {/* Dynamic content based on selectedElement or activeSection */}
                <div className="space-y-4">
                  {/* Quando um elemento específico está selecionado */}
                  {(selectedElementType === 'header' || selectedElementType === 'logo' || selectedElementType === 'text') && (
                    <div className="space-y-4">
                      {/* Cor Primária - sempre visível na seção header */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor Primária
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={store?.primary_color || '#000000'}
                            onChange={(e) => {
                              const newColor = e.target.value
                              // Atualizar preview em tempo real
                              if (iframeRef.current?.contentWindow) {
                                iframeRef.current.contentWindow.postMessage({
                                  type: 'PREVIEW_UPDATE',
                                  updateType: 'primary_color',
                                  data: newColor,
                                }, '*')
                              }
                            }}
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={store?.primary_color || '#000000'}
                            onChange={(e) => {
                              const newColor = e.target.value
                              // Atualizar preview em tempo real
                              if (iframeRef.current?.contentWindow) {
                                iframeRef.current.contentWindow.postMessage({
                                  type: 'PREVIEW_UPDATE',
                                  updateType: 'primary_color',
                                  data: newColor,
                                }, '*')
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      {selectedElementType === 'logo' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo
                          </label>
                          {store?.logo_url ? (
                            <div className="mb-3">
                              <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden mb-3">
                                <Image
                                  src={store.logo_url}
                                  alt="Logo"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => logoFileInputRef.current?.click()}
                                disabled={uploadingLogo}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {uploadingLogo ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4" />
                                    Alterar logo
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="mb-3">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600 mb-2">Nenhuma logo cadastrada</p>
                                <button
                                  type="button"
                                  onClick={() => logoFileInputRef.current?.click()}
                                  disabled={uploadingLogo}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50 flex items-center gap-2 mx-auto"
                                >
                                  {uploadingLogo ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Enviando...
                                    </>
                                  ) : (
                                    'Fazer upload'
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                      {selectedElementType === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Loja
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Nome da loja"
                            defaultValue={store?.name}
                            onChange={(e) => {
                              // Atualizar preview em tempo real
                              if (iframeRef.current?.contentWindow) {
                                iframeRef.current.contentWindow.postMessage({
                                  type: 'PREVIEW_UPDATE',
                                  updateType: 'store_name',
                                  data: e.target.value,
                                }, '*')
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedElementType === 'announcement' && store && (
                    <AnnouncementsSection storeId={store.id} />
                  )}

                  {selectedElementType === 'banner' && store && (
                    <BannersSection storeId={store.id} />
                  )}

                  {(selectedElementType === 'featured-products' || selectedElementType === 'product' || selectedElementType === 'category') && store && (
                    <ProductsSection storeId={store.id} iframeRef={iframeRef} />
                  )}

                  {selectedElementType === 'footer' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rodapé
                        </label>
                        <p className="text-sm text-gray-600">
                          Configure o rodapé nas configurações gerais
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quando uma seção do menu está ativa (sem elemento específico selecionado) */}
                  {!selectedElement && (
                    <>
                      {activeSection === 'header' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cor Primária
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={store?.primary_color || '#000000'}
                                onChange={(e) => {
                                  const newColor = e.target.value
                                  if (iframeRef.current?.contentWindow) {
                                    iframeRef.current.contentWindow.postMessage({
                                      type: 'PREVIEW_UPDATE',
                                      updateType: 'primary_color',
                                      data: newColor,
                                    }, '*')
                                  }
                                }}
                                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={store?.primary_color || '#000000'}
                                onChange={(e) => {
                                  const newColor = e.target.value
                                  if (iframeRef.current?.contentWindow) {
                                    iframeRef.current.contentWindow.postMessage({
                                      type: 'PREVIEW_UPDATE',
                                      updateType: 'primary_color',
                                      data: newColor,
                                    }, '*')
                                  }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo
                            </label>
                            {store?.logo_url ? (
                              <div className="mb-3">
                                <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden mb-3">
                                  <Image
                                    src={store.logo_url}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => logoFileInputRef.current?.click()}
                                  disabled={uploadingLogo}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {uploadingLogo ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4" />
                                      Alterar logo
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="mb-3">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600 mb-2">Nenhuma logo cadastrada</p>
                                  <button
                                    type="button"
                                    onClick={() => logoFileInputRef.current?.click()}
                                    disabled={uploadingLogo}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50 flex items-center gap-2 mx-auto"
                                  >
                                    {uploadingLogo ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Enviando...
                                      </>
                                    ) : (
                                      'Fazer upload'
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                            <input
                              ref={logoFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Menu de navegação
                            </label>
                            <p className="text-sm text-gray-600">
                              O menu é gerado automaticamente com base nas categorias
                            </p>
                          </div>
                        </div>
                      )}

                      {activeSection === 'announcements' && store && (
                        <AnnouncementsSection storeId={store.id} />
                      )}

                      {activeSection === 'banners' && store && (
                        <BannersSection storeId={store.id} />
                      )}

                      {activeSection === 'homepage' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mensagem de boas-vindas
                            </label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={4}
                              placeholder="Use este texto para compartilhar informações da sua loja..."
                            />
                          </div>
                        </div>
                      )}

                      {activeSection === 'products' && store && (
                        <ProductsSection storeId={store.id} iframeRef={iframeRef} />
                      )}

                      {activeSection === 'cart' && (
                        <div>
                          <p className="text-sm text-gray-600">
                            O carrinho é gerenciado automaticamente pelo sistema
                          </p>
                        </div>
                      )}

                      {activeSection === 'footer' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Texto sobre
                            </label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={4}
                              placeholder="Informações sobre sua loja..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm text-gray-700">Mostrar endereço</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {activeSection === 'css' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CSS Personalizado
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            rows={10}
                            placeholder="/* Seu CSS personalizado aqui */"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Use este campo para adicionar estilos CSS personalizados
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Preview */}
        <main className={`flex-1 flex ${viewMode === 'mobile' ? 'items-center justify-center' : 'items-start justify-start'} ${viewMode === 'mobile' ? 'p-4 sm:p-8' : 'p-0'} overflow-hidden bg-gray-100`}>
          <div
            className={`
              bg-white transition-all
              ${viewMode === 'mobile' ? 'rounded-lg shadow-2xl w-full max-w-sm m-4' : 'w-full h-full'}
            `}
          >
            {/* Preview Frame */}
            <div className={`relative ${viewMode === 'mobile' ? '' : 'h-full'}`}>
              {previewUrl ? (
                <>
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className={`
                      border-0
                      ${viewMode === 'mobile' ? 'rounded-lg h-[600px]' : 'h-full w-full'}
                    `}
                    style={{ width: '100%' }}
                    title="Preview da Loja"
                    sandbox="allow-same-origin allow-scripts"
                    allow="fullscreen"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  onLoad={(e) => {
                    // Prevenir navegação dentro do iframe
                    try {
                      const iframe = e.target as HTMLIFrameElement
                      if (iframe.contentWindow) {
                        // Interceptar tentativas de navegação
                        const preventNavigation = (event: BeforeUnloadEvent) => {
                          event.preventDefault()
                          event.returnValue = ''
                          return ''
                        }
                        iframe.contentWindow.addEventListener('beforeunload', preventNavigation)
                        
                        // Monitorar mudanças de URL no iframe
                        const checkUrl = () => {
                          try {
                            const iframeUrl = iframe.contentWindow?.location.href
                            const expectedUrl = previewUrl
                            if (iframeUrl && !iframeUrl.includes(expectedUrl)) {
                              // URL mudou - recarregar para a URL correta
                              iframe.src = previewUrl
                            }
                          } catch (err) {
                            // Erro de CORS - normal em iframes
                          }
                        }
                        
                        // Verificar URL periodicamente
                        const urlCheckInterval = setInterval(checkUrl, 1000)
                        
                        // Cleanup
                        return () => {
                          clearInterval(urlCheckInterval)
                          iframe.contentWindow?.removeEventListener('beforeunload', preventNavigation)
                        }
                      }
                    } catch (err) {
                      // Ignorar erros de CORS
                    }
                  }}
                  />
                  <EditorOverlay
                    iframeRef={iframeRef}
                    onElementSelect={handleElementSelect}
                    selectedElement={selectedElement}
                  />
                </>
              ) : (
                <div className={`
                  flex items-center justify-center bg-gray-100
                  ${viewMode === 'mobile' ? 'rounded-lg h-[600px]' : 'h-full w-full'}
                `}>
                  <p className="text-gray-500">Carregando preview...</p>
                </div>
              )}
            </div>
          </div>
        </main>

      </div>
    </div>
  )
}


