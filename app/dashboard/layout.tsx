import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (storeError) {
    console.error('❌ Error fetching store in dashboard layout:', storeError)
    redirect('/onboarding')
  }

  if (!store) {
    console.log('⚠️ Store not found in dashboard layout, redirecting to onboarding')
    redirect('/onboarding')
  }

  // Check if onboarding is completed
  if (!store.onboarding_completed) {
    console.log('⚠️ Onboarding not completed in dashboard layout, redirecting to onboarding')
    redirect('/onboarding')
  }

  console.log('✅ Dashboard layout check passed, rendering dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop - Fixo */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <DashboardNav />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <DashboardNav />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4 ml-auto">
              <Link
                href={`/${store.slug}`}
                target="_blank"
                className="text-sm text-[#004DF0] hover:text-[#0038B8] font-medium"
              >
                Ver loja
              </Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
