'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Truck, Gift, Tag, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/hooks/useConfirm'

const iconOptions = [
  { value: '', label: 'Nenhum', icon: null },
  { value: '🚚', label: 'Caminhão', icon: '🚚' },
  { value: '🎁', label: 'Presente', icon: '🎁' },
  { value: '🏷️', label: 'Etiqueta', icon: '🏷️' },
  { value: '⚡', label: 'Raio', icon: '⚡' },
  { value: '🔥', label: 'Fogo', icon: '🔥' },
  { value: '⭐', label: 'Estrela', icon: '⭐' },
  { value: '💎', label: 'Diamante', icon: '💎' },
  { value: '🎉', label: 'Festa', icon: '🎉' },
]

const colorPresets = [
  { bg: '#EC4899', text: '#FFFFFF', name: 'Rosa' },
  { bg: '#3B82F6', text: '#FFFFFF', name: 'Azul' },
  { bg: '#10B981', text: '#FFFFFF', name: 'Verde' },
  { bg: '#F59E0B', text: '#FFFFFF', name: 'Laranja' },
  { bg: '#EF4444', text: '#FFFFFF', name: 'Vermelho' },
  { bg: '#8B5CF6', text: '#FFFFFF', name: 'Roxo' },
  { bg: '#000000', text: '#FFFFFF', name: 'Preto' },
]

export default function NewAnnouncementPage() {
  const router = useRouter()
  const toast = useToast()
  const { confirm, ConfirmComponent } = useConfirm()
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [formData, setFormData] = useState({
    text: '',
    backgroundColor: '#EC4899',
    textColor: '#FFFFFF',
    icon: '',
    linkUrl: '',
    isActive: true,
    orderIndex: 0,
  })

  useEffect(() => {
    loadStore()
  }, [])

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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      toast.warning('Por favor, preencha o texto do aviso')
      return
    }

    if (!store) {
      toast.error('Loja não encontrada')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Obter próximo order_index
      const { count } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)

      const { error } = await supabase
        .from('announcements')
        .insert({
          store_id: store.id,
          text: formData.text.trim(),
          background_color: formData.backgroundColor,
          text_color: formData.textColor,
          icon: formData.icon || null,
          link_url: formData.linkUrl || null,
          is_active: formData.isActive,
          order_index: count || 0,
        })

      if (error) {
        toast.error('Erro ao criar aviso: ' + error.message)
        setLoading(false)
        return
      }

      toast.success('Aviso criado com sucesso!')
      router.push('/dashboard/announcements')
    } catch (error: any) {
      toast.error('Erro ao criar aviso: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <ConfirmComponent />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/announcements"
          className="text-[#004DF0] hover:text-[#0038B8] mb-4 inline-block"
        >
          ← Voltar para avisos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 font-avenir">Novo Aviso</h1>
        <p className="mt-2 text-gray-600">Adicione uma nova faixa de aviso para sua loja</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div
            className="w-full h-12 rounded flex items-center justify-center text-sm font-medium px-4"
            style={{
              backgroundColor: formData.backgroundColor,
              color: formData.textColor,
            }}
          >
            {formData.icon && <span className="mr-2">{formData.icon}</span>}
            <span>{formData.text || 'Digite o texto do aviso...'}</span>
          </div>
        </div>

        {/* Texto */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Texto do Aviso *
          </label>
          <input
            type="text"
            id="text"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
            placeholder="Ex: Frete Grátis Sul e Sudeste a partir de R$299"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
          />
        </div>

        {/* Ícone */}
        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
            Ícone (opcional)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, icon: option.value })}
                className={`p-3 border-2 rounded-lg text-center transition ${
                  formData.icon === option.value
                    ? 'border-[#004DF0] bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {option.icon ? (
                  <span className="text-2xl">{option.icon}</span>
                ) : (
                  <span className="text-xs text-gray-500">Nenhum</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cores - Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cores - Presets Rápidos
          </label>
          <div className="grid grid-cols-7 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  backgroundColor: preset.bg,
                  textColor: preset.text,
                })}
                className={`p-2 border-2 rounded-lg transition ${
                  formData.backgroundColor === preset.bg
                    ? 'border-[#004DF0] ring-2 ring-[#004DF0]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                title={preset.name}
              >
                <div
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: preset.bg }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Cores - Personalizadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-2">
              Cor de Fundo
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                id="backgroundColor"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                placeholder="#EC4899"
              />
            </div>
          </div>

          <div>
            <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-2">
              Cor do Texto
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                id="textColor"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>

        {/* Link */}
        <div>
          <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Link (opcional)
          </label>
          <input
            type="url"
            id="linkUrl"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
            placeholder="https://exemplo.com"
            value={formData.linkUrl}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            URL para onde o aviso deve redirecionar ao ser clicado
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#004DF0] focus:ring-[#004DF0]"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">Aviso ativo</span>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/announcements"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.text.trim()}
            className="px-6 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Salvando...
              </>
            ) : (
              'Criar Aviso'
            )}
          </button>
        </div>
      </form>
      </div>
    </>
  )
}
