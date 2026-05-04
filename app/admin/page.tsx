// app/admin/page.tsx
import { createClient } from '@/lib/supabase-server'
import Link from 'next/dist/client/link'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <>
    <div>Welcome, {user.email}</div>
    <LogoutButton />
    <Link href="/tours" className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        Create Tour
      </Link>
    </>
    )
}