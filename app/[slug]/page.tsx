import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import StorePageClient from './StorePageClient'
import { mergeWithDemoData } from '@/lib/demo-data-helper'

export default async function StorePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Get store
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!store) {
    notFound()
  }

  // Get store settings
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', store.id)
    .maybeSingle()

  // Get active announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get active banners
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get active categories with products
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get all active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('order_index', { ascending: true })

  // Track visit
  await supabase.from('visits').insert({
    store_id: store.id,
  })

  // Mesclar com dados demo se necessário
  const finalData = mergeWithDemoData({
    store,
    settings: settings || null,
    announcements: announcements || [],
    banners: banners || [],
    categories: categories || [],
    products: products || [],
  })

  return (
    <StorePageClient
      store={finalData.store}
      settings={finalData.settings}
      announcements={finalData.announcements}
      banners={finalData.banners}
      categories={finalData.categories}
      products={finalData.products}
      productsByCategory={finalData.productsByCategory}
    />
  )
}
