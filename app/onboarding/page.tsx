'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ChevronRight, Store, Package, Image as ImageIcon, FileText } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
    storeType: 'store' as 'store' | 'restaurant',
    phone: '',
    whatsapp: '',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    document: '',
    estimatedProducts: '1-10',
    primaryColor: '#004DF0',
  })

  useEffect(() => {
    loadUserWhatsApp()
  }, [])

  const loadUserWhatsApp = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.user_metadata?.whatsapp) {
      const whatsappFormatted = formatPhone(user.user_metadata.whatsapp)
      setFormData(prev => ({ ...prev, whatsapp: whatsappFormatted, phone: whatsappFormatted }))
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers
      } else if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
      }
    }
    return value
  }

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error getting user:', userError)
      router.push('/auth/login')
      return
    }
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user already has a store
    const { data: existingStore, error: checkError } = await supabase
      .from('stores')
      .select('id, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing store:', checkError)
      // Continua com onboarding mesmo se der erro (pode ser primeira vez)
    } else if (existingStore) {
      if (existingStore.onboarding_completed) {
        router.push('/dashboard')
        return
      }
      // Se tem loja mas não completou onboarding, continua
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return formData.storeName.length >= 3
      case 2:
        return formData.phone.length >= 10 && formData.whatsapp.length >= 10
      case 3:
        return formData.document.length >= 11
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(step) && step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const slug = generateSlug(formData.storeName)
    
    // Check if slug already exists (excluding current user's store)
    const { data: existingStoreBySlug, error: slugError } = await supabase
      .from('stores')
      .select('id, user_id')
      .eq('slug', slug)
      .maybeSingle()

    if (slugError && slugError.code !== 'PGRST116') {
      console.error('Error checking slug:', slugError)
    }

    if (existingStoreBySlug && existingStoreBySlug.user_id !== user.id) {
      alert('Este nome de loja já está em uso. Por favor, escolha outro.')
      setLoading(false)
      return
    }

    // Check if store already exists for this user
    const { data: existingStore, error: existingError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing store:', existingError)
    }

    let store
    let storeError

    if (existingStore) {
      // Update existing store
      const { data, error } = await supabase
        .from('stores')
        .update({
          name: formData.storeName,
          slug: slug,
          type: formData.storeType,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          primary_color: formData.primaryColor,
          document_type: formData.documentType,
          document: formData.document,
          plan: 'free',
          onboarding_completed: true,
        })
        .eq('id', existingStore.id)
        .select()
        .single()
      
      store = data
      storeError = error
    } else {
      // Create new store
      const { data, error } = await supabase
        .from('stores')
        .insert({
          user_id: user.id,
          name: formData.storeName,
          slug: slug,
          type: formData.storeType,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          primary_color: formData.primaryColor,
          document_type: formData.documentType,
          document: formData.document,
          plan: 'free',
          onboarding_completed: true,
        })
        .select()
        .single()
      
      store = data
      storeError = error
    }

    if (storeError) {
      console.error('Error creating/updating store:', storeError)
      console.error('Store data:', {
        name: formData.storeName,
        slug: slug,
        type: formData.storeType,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
      })
      
      let errorMessage = 'Erro ao criar loja. '
      if (storeError.message.includes('duplicate key') || storeError.message.includes('unique constraint')) {
        errorMessage += 'Este nome de loja já está em uso.'
      } else if (storeError.message.includes('violates foreign key')) {
        errorMessage += 'Erro de configuração do banco de dados.'
      } else {
        errorMessage += storeError.message || 'Tente novamente.'
      }
      
      alert(errorMessage)
      setLoading(false)
      return
    }

    if (!store || !store.id) {
      console.error('Store não foi criada/atualizada corretamente')
      alert('Erro ao salvar loja. Tente novamente.')
      setLoading(false)
      return
    }

    // Create or update default store settings
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
          template_id: 'default',
        })
        .eq('store_id', store.id)
      settingsError = error
    } else {
      // Se não existe, inserir
      const { error } = await supabase
        .from('store_settings')
        .insert({
          store_id: store.id,
          template_id: 'default',
        })
      settingsError = error
    }

    if (settingsError) {
      console.error('Error creating store settings:', settingsError)
      // Não bloquear o fluxo se settings falhar, mas logar o erro
    }

    // Redirect to first product tutorial
    window.location.href = '/dashboard/products/new?tutorial=true'
  }

  const steps = [
    { number: 1, title: 'Nome da Loja', icon: Store },
    { number: 2, title: 'Contato', icon: FileText },
    { number: 3, title: 'Documento', icon: FileText },
    { number: 4, title: 'Personalização', icon: ImageIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo variant="blue" href="/" className="h-10 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-avenir">
            Configure sua loja
          </h1>
          <p className="text-gray-600">
            Vamos configurar sua loja em poucos passos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon
              const isActive = step >= stepItem.number
              const isCompleted = step > stepItem.number
              
              return (
                <div key={stepItem.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition ${
                        isActive
                          ? 'bg-[#004DF0] border-[#004DF0] text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="text-white">✓</span>
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      isActive ? 'text-[#004DF0]' : 'text-gray-400'
                    }`}>
                      {stepItem.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      step > stepItem.number ? 'bg-[#004DF0]' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Store Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                    Qual o nome da sua loja? *
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    required
                    minLength={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-4 py-3 border"
                    placeholder="Ex: Minha Loja"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Sua loja estará disponível em: <span className="font-semibold">
                      {formData.storeName ? `${generateSlug(formData.storeName)}.shopey.app` : 'nomedaloja.shopey.app'}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de loja *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, storeType: 'store' })}
                      className={`p-6 border-2 rounded-lg text-left transition ${
                        formData.storeType === 'store'
                          ? 'border-[#004DF0] bg-[#004DF0]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-1">Loja Virtual</div>
                      <div className="text-sm text-gray-600">Produtos físicos</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, storeType: 'restaurant' })}
                      className={`p-6 border-2 rounded-lg text-left transition ${
                        formData.storeType === 'restaurant'
                          ? 'border-[#004DF0] bg-[#004DF0]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-1">Restaurante</div>
                      <div className="text-sm text-gray-600">Cardápio digital</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone para contato *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    minLength={10}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-4 py-3 border"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp (para receber pedidos) *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    required
                    minLength={10}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-4 py-3 border"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Os pedidos dos clientes serão enviados para este número
                  </p>
                </div>

                <div>
                  <label htmlFor="estimatedProducts" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantos produtos você pretende cadastrar?
                  </label>
                  <select
                    id="estimatedProducts"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-4 py-3 border"
                    value={formData.estimatedProducts}
                    onChange={(e) => setFormData({ ...formData, estimatedProducts: e.target.value })}
                  >
                    <option value="1-10">1 a 10 produtos</option>
                    <option value="11-50">11 a 50 produtos</option>
                    <option value="51-100">51 a 100 produtos</option>
                    <option value="100+">Mais de 100 produtos</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Document */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de documento *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, documentType: 'cpf', document: '' })}
                      className={`p-4 border-2 rounded-lg transition ${
                        formData.documentType === 'cpf'
                          ? 'border-[#004DF0] bg-[#004DF0]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">CPF</div>
                      <div className="text-sm text-gray-600">Pessoa física</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, documentType: 'cnpj', document: '' })}
                      className={`p-4 border-2 rounded-lg transition ${
                        formData.documentType === 'cnpj'
                          ? 'border-[#004DF0] bg-[#004DF0]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">CNPJ</div>
                      <div className="text-sm text-gray-600">Pessoa jurídica</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
                  </label>
                  <input
                    type="text"
                    id="document"
                    required
                    minLength={formData.documentType === 'cpf' ? 11 : 14}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-4 py-3 border"
                    placeholder={formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={formData.document}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, document: value })
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Branding */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Cor principal da sua loja
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="primaryColor"
                      className="h-16 w-24 rounded border border-gray-300 cursor-pointer"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#004DF0] focus:ring-[#004DF0] sm:text-sm px-4 py-3 border"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Esta cor será usada em botões, links e destaques da sua loja
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Plano Gratuito:</strong> Você pode cadastrar até 5 produtos e usar 1 template. 
                    Para mais recursos, considere fazer upgrade para o plano Pro.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Voltar
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(step)}
                  className="px-6 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep(step)}
                  className="px-6 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Finalizando...' : 'Finalizar configuração'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
