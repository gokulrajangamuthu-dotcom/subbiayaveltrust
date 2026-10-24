import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: me } = await sb.from('profiles').select('name, role').eq('id', user.id).single()

  const { data: posts } = await sb.from('posts')
    .select('id, title, type, body, file_url, created_at, views(profiles(name)), likes(profiles(name)), comments(id, text, created_at, profiles(name))')
    .order('created_at', { ascending: false })

  const { data: profiles } = await sb.from('profiles')
    .select('id, name, role')
    .order('name', { ascending: true })

  return (
    <>
      <Nav name={me?.name || 'Admin'} role={me?.role || 'admin'} />
      <AdminDashboard posts={posts || []} profiles={profiles || []} />
    </>
  )
}
