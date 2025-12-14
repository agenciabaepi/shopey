'use client'

import { useState } from 'react'
import { X, CheckCircle, ArrowRight, Package, DollarSign, Image as ImageIcon, Tag } from 'lucide-react'

interface ProductTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

export default function ProductTutorial({ onComplete, onSkip }: ProductTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: Package,
      title: 'Nome do Produto',
      description: 'Escolha um nome claro e descritivo para seu produto. Seja específico!',
      tip: 'Ex: "Hambúrguer Artesanal com Queijo" é melhor que apenas "Hambúrguer"',
    },
    {
      icon: DollarSign,
      title: 'Preço',
      description: 'Defina o preço do produto. Use ponto para decimais (ex: 29.90)',
      tip: 'Dica: Pesquise preços da concorrência para definir um valor competitivo',
    },
    {
      icon: ImageIcon,
      title: 'Foto do Produto',
      description: 'Uma boa foto aumenta muito as vendas! Use imagens nítidas e bem iluminadas.',
      tip: 'Dica: Fotos profissionais podem aumentar as vendas em até 30%',
    },
    {
      icon: Tag,
      title: 'Categoria',
      description: 'Organize seus produtos em categorias para facilitar a navegação.',
      tip: 'Ex: "Lanches", "Bebidas", "Sobremesas" para restaurantes',
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#004DF0] text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2 font-avenir">
                Vamos criar seu primeiro produto! 🎉
              </h2>
              <p className="text-blue-100">
                Passo {currentStep + 1} de {steps.length}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-white hover:text-gray-200 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#004DF0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#004DF0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-[#004DF0]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-avenir">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> {currentStepData.tip}
              </p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentStep
                    ? 'bg-[#004DF0] w-8'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Pular tutorial
          </button>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#004DF0] text-white rounded-lg hover:bg-[#0038B8] transition flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
