# Guia de Uso - Sistema de Toasts e Confirmações

Este documento explica como usar o sistema moderno de notificações (toasts) e diálogos de confirmação no projeto.

## 📦 Componentes Criados

### 1. Toast (Notificações)
- **Arquivo**: `components/Toast.tsx`
- **Contexto**: `contexts/ToastContext.tsx`
- **Tipos**: `success`, `error`, `info`, `warning`

### 2. Confirm Dialog (Confirmações)
- **Arquivo**: `components/ConfirmDialog.tsx`
- **Hook**: `hooks/useConfirm.tsx`

## 🚀 Como Usar

### Toasts (Notificações)

#### 1. Importar o hook
```tsx
import { useToast } from '@/contexts/ToastContext'
```

#### 2. Usar no componente
```tsx
export default function MyComponent() {
  const toast = useToast()

  const handleAction = () => {
    // Sucesso
    toast.success('Operação realizada com sucesso!')
    
    // Erro
    toast.error('Erro ao processar solicitação')
    
    // Informação
    toast.info('Aguarde enquanto processamos...')
    
    // Aviso
    toast.warning('Atenção: verifique os dados')
  }
}
```

#### 3. Substituir `alert()`
```tsx
// ❌ Antes
alert('Erro ao salvar')

// ✅ Depois
toast.error('Erro ao salvar')
```

### Confirmações (Dialogs)

#### 1. Importar o hook
```tsx
import { useConfirm } from '@/hooks/useConfirm'
```

#### 2. Usar no componente
```tsx
export default function MyComponent() {
  const { confirm, ConfirmComponent } = useConfirm()

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Excluir item',
      message: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      variant: 'danger', // 'danger' | 'warning' | 'info'
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    })

    if (!confirmed) return

    // Executar ação de exclusão
    await deleteItem()
  }

  return (
    <>
      <ConfirmComponent />
      {/* resto do componente */}
    </>
  )
}
```

#### 3. Substituir `confirm()`
```tsx
// ❌ Antes
if (!confirm('Tem certeza?')) return

// ✅ Depois
const confirmed = await confirm({
  message: 'Tem certeza?',
  variant: 'warning',
})
if (!confirmed) return
```

## 📝 Exemplos Completos

### Exemplo 1: Formulário com validação
```tsx
'use client'

import { useToast } from '@/contexts/ToastContext'

export default function MyForm() {
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.warning('Por favor, preencha o nome')
      return
    }

    try {
      await saveData()
      toast.success('Dados salvos com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    }
  }
}
```

### Exemplo 2: Exclusão com confirmação
```tsx
'use client'

import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/hooks/useConfirm'

export default function ItemList() {
  const toast = useToast()
  const { confirm, ConfirmComponent } = useConfirm()

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Excluir item',
      message: 'Esta ação não pode ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
    })

    if (!confirmed) return

    try {
      await deleteItem(id)
      toast.success('Item excluído com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  return (
    <>
      <ConfirmComponent />
      {/* resto do componente */}
    </>
  )
}
```

## 🎨 Personalização

### Duração do Toast
```tsx
// Toast que desaparece em 3 segundos
toast.success('Mensagem', 3000)

// Toast que permanece até ser fechado manualmente
toast.info('Mensagem importante', 0)
```

### Variantes do Confirm
- `danger`: Para ações destrutivas (vermelho)
- `warning`: Para avisos (amarelo)
- `info`: Para informações (azul)

## ✅ Checklist de Migração

Para migrar um arquivo:

1. ✅ Importar `useToast` de `@/contexts/ToastContext`
2. ✅ Importar `useConfirm` de `@/hooks/useConfirm` (se necessário)
3. ✅ Substituir todos os `alert()` por `toast.success()`, `toast.error()`, etc.
4. ✅ Substituir todos os `confirm()` por `await confirm({ ... })`
5. ✅ Adicionar `<ConfirmComponent />` no return se usar confirmações
6. ✅ Testar todas as notificações

## 📋 Arquivos Já Migrados

- ✅ `app/dashboard/announcements/new/page.tsx`
- ✅ `app/dashboard/announcements/[id]/edit/page.tsx`
- ✅ `app/dashboard/banners/[id]/edit/page.tsx`

## 📋 Arquivos Pendentes

- ⏳ `app/dashboard/settings/page.tsx`
- ⏳ `app/dashboard/products/new/page.tsx`
- ⏳ `app/dashboard/products/[id]/edit/page.tsx`
- ⏳ `app/dashboard/banners/new/page.tsx`
- ⏳ `app/dashboard/categories/new/page.tsx`
- ⏳ `app/onboarding/page.tsx`
- ⏳ `app/auth/register/page.tsx`

## 🔧 Configuração Global

O `ToastProvider` já está configurado no `app/layout.tsx`, então você pode usar `useToast()` em qualquer componente cliente sem configuração adicional.


