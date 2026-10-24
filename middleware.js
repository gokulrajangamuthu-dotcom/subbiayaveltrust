import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  let res = NextResponse.next({ request: req })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value))
        res = NextResponse.next({ request: req })
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (p?.role !== 'admin') return NextResponse.redirect(new URL('/feed', req.url))
  }
  return res
}
export const config = { matcher: ['/feed/:path*', '/admin/:path*'] }
