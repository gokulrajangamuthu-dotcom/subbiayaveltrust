import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function createClient() {
  const store = cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {} },
    },
  })
}
