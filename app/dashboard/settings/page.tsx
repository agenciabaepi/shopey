'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage, deleteImage } from '@/lib/supabase/storage'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    primaryColor: '#000000',
    fontFamily: 'Inter',
    showAddress: false,
    address: '',
    aboutText: '',
    productsPerRow: 4,
    productsPerRowMobile: 1,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (storeData) {
      setStore(storeData)
      setLogoPreview(storeData.logo_url || null)
      setFormData({
        name: storeData.name,
        phone: storeData.phone,
        whatsapp: storeData.whatsapp,
        primaryColor: storeData.primary_color || '#000000',
        fontFamily: 'Inter',
        showAddress: false,
        address: '',
        aboutText: '',
        productsPerRow: 4,
        productsPerRowMobile: 1,
      })

      const { data: settingsData } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', storeData.id)
        .single()

      if (settingsData) {
        setSettings(settingsData)
        setFormData((prev) => ({
          ...prev,
          fontFamily: settingsData.font_family || 'Inter',
          showAddress: settingsData.show_address || false,
          address: settingsData.address || '',
          aboutText: settingsData.about_text || '',
          productsPerRow: settingsData.products_per_row || 4,
          productsPerRowMobile: settingsData.products_per_row_mobile || 1,
        }))
      }
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return

    setUploadingLogo(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Usuário não autenticado')
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
        alert('Erro ao fazer upload da logo')
        setUploadingLogo(false)
        return
      }

      // Atualizar store com nova logo
      const { error } = await supabase
        .from('stores')
        .update({ logo_url: logoUrl })
        .eq('id', store.id)

      if (error) {
        alert('Erro ao salvar logo: ' + error.message)
        setUploadingLogo(false)
        return
      }

      setLogoPreview(logoUrl)
      setStore({ ...store, logo_url: logoUrl })
      alert('Logo atualizada com sucesso!')
    } catch (error: any) {
      alert('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = async () => {
    if (!store || !store.logo_url) return

    if (!confirm('Tem certeza que deseja remover a logo?')) return

    try {
      const supabase = createClient()
      
      // Deletar imagem do storage
      await deleteImage(store.logo_url)

      // Remover URL do banco
      const { error } = await supabase
        .from('stores')
        .update({ logo_url: null })
        .eq('id', store.id)

      if (error) {
        alert('Erro ao remover logo: ' + error.message)
        return
      }

      setLogoPreview(null)
      setStore({ ...store, logo_url: null })
      alert('Logo removida com sucesso!')
    } catch (error: any) {
      alert('Erro ao remover logo: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !store) return

    // Update store
    const { error: storeError } = await supabase
      .from('stores')
      .update({
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        primary_color: formData.primaryColor,
      })
      .eq('id', store.id)

    if (storeError) {
      alert('Erro ao atualizar loja: ' + storeError.message)
      setLoading(false)
      return
    }

    // Update or insert settings
    // Verificar se já existe
    const { data: existingSettings } = await supabase
      .from('store_settings')
      .select('id')
      .eq('store_id', store.id)
      .maybeSingle()

    let settingsError
    if (existingSettings) {
      // Se existe, atualizar
      const { error } = await supabase
        .from('store_settings')
        .update({
          font_family: formData.fontFamily,
          show_address: formData.showAddress,
          address: formData.address || null,
          about_text: formData.aboutText || null,
          products_per_row: formData.productsPerRow,
          products_per_row_mobile: formData.productsPerRowMobile,
        })
        .eq('store_id', store.id)
      settingsError = error
    } else {
      // Se não existe, inserir
      const { error } = await supabase
        .from('store_settings')
        .insert({
          store_id: store.id,
          font_family: formData.fontFamily,
          show_address: formData.showAddress,
          address: formData.address || null,
          about_text: formData.aboutText || null,
          products_per_row: formData.productsPerRow,
          products_per_row_mobile: formData.productsPerRowMobile,
        })
      settingsError = error
    }

    if (settingsError) {
      alert('Erro ao atualizar configurações: ' + settingsError.message)
      setLoading(false)
      return
    }

    alert('Configurações salvas com sucesso!')
    setLoading(false)
    router.refresh()
  }

  if (!store) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-avenir">Configurações</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações básicas</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da loja *
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da loja
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <Image
                      src={logoPreview}
                      alt="Logo da loja"
                      width={120}
                      height={120}
                      className="rounded-lg object-contain border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-sm">Sem logo</span>
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploadingLogo}
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                      uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {logoPreview ? 'Trocar logo' : 'Enviar logo'}
                      </>
                    )}
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    Formatos: JPG, PNG, GIF. Máximo: 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalização</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Cor principal
              </label>
              <div className="mt-1 flex items-center gap-4">
                <input
                  type="color"
                  id="primaryColor"
                  className="h-12 w-24 rounded border border-gray-300"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                />
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">
                Fonte
              </label>
              <select
                id="fontFamily"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                value={formData.fontFamily}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="productsPerRowMobile" className="block text-sm font-medium text-gray-700">
                  Produtos por linha (Mobile)
                </label>
                <select
                  id="productsPerRowMobile"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                  value={formData.productsPerRowMobile}
                  onChange={(e) => setFormData({ ...formData, productsPerRowMobile: parseInt(e.target.value) })}
                >
                  <option value={1}>1 produto por linha</option>
                  <option value={2}>2 produtos por linha (máximo)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Para telas pequenas (mobile). Máximo 2 para não quebrar o layout.
                </p>
              </div>

              <div>
                <label htmlFor="productsPerRow" className="block text-sm font-medium text-gray-700">
                  Produtos por linha (Desktop)
                </label>
                <select
                  id="productsPerRow"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                  value={formData.productsPerRow}
                  onChange={(e) => setFormData({ ...formData, productsPerRow: parseInt(e.target.value) })}
                >
                  <option value={1}>1 produto por linha</option>
                  <option value={2}>2 produtos por linha</option>
                  <option value={3}>3 produtos por linha</option>
                  <option value={4}>4 produtos por linha</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Para telas grandes (tablet/desktop)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações adicionais</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#004DF0] focus:ring-[#004DF0]"
                  checked={formData.showAddress}
                  onChange={(e) => setFormData({ ...formData, showAddress: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Mostrar endereço na loja</span>
              </label>
            </div>

            {formData.showAddress && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            )}

            <div>
              <label htmlFor="aboutText" className="block text-sm font-medium text-gray-700">
                Sobre nós
              </label>
              <textarea
                id="aboutText"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-3 py-2 border"
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
