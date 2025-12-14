'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, X, Truck, Gift, Tag, AlertCircle } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/hooks/useConfirm'

interface Announcement {
  id: string
  text: string
  background_color: string
  text_color: string
  icon: string | null
  link_url: string | null
  is_active: boolean
  order_index: number
}

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

export default function AnnouncementsSection({ storeId }: { storeId: string }) {
  const toast = useToast()
  const { confirm, ConfirmComponent } = useConfirm()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    text: '',
    backgroundColor: '#EC4899',
    textColor: '#FFFFFF',
    icon: '',
    linkUrl: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAnnouncements()
  }, [storeId])

  const loadAnnouncements = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('store_id', storeId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar avisos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Excluir aviso',
      message: 'Tem certeza que deseja excluir este aviso?',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Aviso excluído com sucesso!')
      loadAnnouncements()
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Aviso ${!currentStatus ? 'ativado' : 'desativado'}!`)
      loadAnnouncements()
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message)
    }
  }

  const openNewModal = () => {
    setEditingAnnouncement(null)
    setFormData({
      text: '',
      backgroundColor: '#EC4899',
      textColor: '#FFFFFF',
      icon: '',
      linkUrl: '',
      isActive: true,
    })
    setShowModal(true)
  }

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      text: announcement.text,
      backgroundColor: announcement.background_color,
      textColor: announcement.text_color,
      icon: announcement.icon || '',
      linkUrl: announcement.link_url || '',
      isActive: announcement.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      toast.warning('Por favor, preencha o texto do aviso')
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()

      if (editingAnnouncement) {
        // Editar existente
        const { error } = await supabase
          .from('announcements')
          .update({
            text: formData.text.trim(),
            background_color: formData.backgroundColor,
            text_color: formData.textColor,
            icon: formData.icon || null,
            link_url: formData.linkUrl || null,
            is_active: formData.isActive,
          })
          .eq('id', editingAnnouncement.id)

        if (error) throw error
        toast.success('Aviso atualizado com sucesso!')
      } else {
        // Criar novo
        const { count } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeId)

        const { error } = await supabase
          .from('announcements')
          .insert({
            store_id: storeId,
            text: formData.text.trim(),
            background_color: formData.backgroundColor,
            text_color: formData.textColor,
            icon: formData.icon || null,
            link_url: formData.linkUrl || null,
            is_active: formData.isActive,
            order_index: count || 0,
          })

        if (error) throw error
        toast.success('Aviso criado com sucesso!')
      }

      setShowModal(false)
      loadAnnouncements()
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando...</div>
  }

  return (
    <>
      <ConfirmComponent />
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <span className="truncate">{formData.text || 'Texto do aviso'}</span>
                </div>
              </div>

              {/* Texto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Aviso *
                </label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Ex: Frete grátis para todo Brasil"
                  required
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone (opcional)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: option.value })}
                      className={`p-2 border rounded-lg text-center text-sm ${
                        formData.icon === option.value
                          ? 'border-[#004DF0] bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.icon || 'Nenhum'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Fundo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, backgroundColor: preset.bg, textColor: preset.text })}
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: preset.bg }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Texto
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (opcional)
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Aviso ativo
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {saving ? 'Salvando...' : editingAnnouncement ? 'Salvar alterações' : 'Criar aviso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Avisos e Promoções</h3>
          <button
            onClick={openNewModal}
            className="px-3 py-1.5 bg-[#004DF0] text-white text-sm rounded-lg hover:bg-[#0038B8] flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            <p>Nenhum aviso cadastrado</p>
            <button
              onClick={openNewModal}
              className="text-[#004DF0] hover:underline mt-2 inline-block"
            >
              Criar primeiro aviso
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border border-gray-200 rounded-lg p-3 space-y-2"
              >
                {/* Preview */}
                <div
                  className="h-10 rounded flex items-center justify-center text-xs font-medium px-3"
                  style={{
                    backgroundColor: announcement.background_color || '#EC4899',
                    color: announcement.text_color || '#FFFFFF',
                  }}
                >
                  {announcement.icon && <span className="mr-2">{announcement.icon}</span>}
                  <span className="truncate">{announcement.text}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                    className={`text-xs px-2 py-1 rounded ${
                      announcement.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {announcement.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => openEditModal(announcement)}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

