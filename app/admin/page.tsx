import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/admin-dashboard'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const params = await searchParams
  const adminKey = process.env.ADMIN_SECRET_KEY || 'admin123'
  
  if (params.key !== adminKey) {
    redirect('/')
  }

  return (
    <main className="min-h-screen p-6">
      <AdminDashboard />
    </main>
  )
}
