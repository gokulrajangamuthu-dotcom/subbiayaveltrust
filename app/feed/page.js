import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import FeedView from '@/components/FeedView'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: me } = await sb.from('profiles').select('name, role').eq('id', user.id).single()

  const { data: posts } = await sb.from('posts')
    .select('*, likes(user_id), comments(id, user_id, text, created_at, profiles(name))')
    .order('created_at', { ascending: false })

  for (const p of posts || []) {
    if (p.file_url) {
      const { data } = await sb.storage
        .from(p.type === 'video' ? 'videos' : 'pdfs')
        .createSignedUrl(p.file_url, 3600)
      p.signed = data?.signedUrl
    }
  }

  return (
    <>
      <Nav name={me?.name || 'Viewer'} role={me?.role || 'viewer'} />
      <FeedView 
        initialPosts={posts || []} 
        userId={user.id} 
        userName={me?.name || 'Viewer'}
        userRole={me?.role || 'viewer'}
      />
    </>
  )
}
