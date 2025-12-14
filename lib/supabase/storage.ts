import { createClient } from './client'

/**
 * Upload de imagem para o Supabase Storage
 * @param file - Arquivo de imagem
 * @param folder - Pasta onde salvar (ex: 'logos', 'banners', 'products')
 * @param userId - ID do usuário (para organização)
 * @returns URL pública da imagem ou null em caso de erro
 */
export async function uploadImage(
  file: File,
  folder: 'logos' | 'banners' | 'products' | 'categories',
  userId: string
): Promise<string | null> {
  try {
    const supabase = createClient()

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo deve ser uma imagem')
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('Imagem muito grande. Tamanho máximo: 5MB')
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    // Caminho: {userId}/{folder}/{filename}
    const filePath = `${userId}/${folder}/${fileName}`

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('store-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Erro ao fazer upload:', error)
      // Retornar mensagem de erro mais específica
      if (error.message) {
        throw new Error(error.message)
      }
      throw new Error('Erro ao fazer upload da imagem. Verifique as permissões do storage.')
    }

    if (!data || !data.path) {
      throw new Error('Upload concluído mas não foi possível obter o caminho do arquivo')
    }

    // Obter URL pública (data.path já contém o caminho completo)
    const { data: urlData } = supabase.storage
      .from('store-assets')
      .getPublicUrl(data.path)

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Upload concluído mas não foi possível obter a URL pública')
    }

    return urlData.publicUrl
  } catch (error: any) {
    console.error('Erro no upload de imagem:', error)
    // Re-throw para que o componente possa capturar a mensagem específica
    throw error
  }
}

/**
 * Deletar imagem do Supabase Storage
 * @param imageUrl - URL da imagem a ser deletada
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Extrair o caminho da URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex((part) => part === 'store-assets')
    
    if (bucketIndex === -1) {
      return false
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from('store-assets')
      .remove([filePath])

    if (error) {
      console.error('Erro ao deletar imagem:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return false
  }
}

