'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrorMsg('')
    const sb = createClient()

    try {
      if (mode === 'register') {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } }
        })

        if (error) throw error

        if (!data.session) {
          toast.info('Account created. Check your inbox to confirm your email.')
          setBusy(false)
          return
        }
        toast.success('Welcome! Account created successfully.')
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
      }

      const { data: { user } } = await sb.auth.getUser()
      const { data: p } = await sb.from('profiles').select('role').eq('id', user.id).single()
      
      router.push(p?.role === 'admin' ? '/admin' : '/feed')
      router.refresh()
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred')
      toast.error(err.message || 'Authentication failed')
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <ThemeToggle />
      </div>

      <div className="auth-wrapper">
        <div className="auth-card fade-in" style={{ maxWidth: '480px' }}>
          {/* Trust Banner / Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div 
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#fff',
                padding: '0.5rem',
                border: '1px solid var(--border-medium)',
                marginBottom: '1rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <img 
                src="/logo.png" 
                alt="Subbiayavel Charitable Trust Banner" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            <h2 className="font-serif" style={{ fontSize: '1.45rem', marginBottom: '0.25rem' }}>
              Portal Access
            </h2>
            <p className="meta" style={{ fontSize: '0.85rem' }}>
              {mode === 'login' 
                ? 'Sign in to view published videos, books, and trust announcements.' 
                : 'Register your viewer profile to access the charitable portal.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div 
            style={{
              display: 'flex',
              background: 'var(--bg-tertiary)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-light)'
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg('') }}
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'login' ? 'var(--bg-secondary)' : 'transparent',
                color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'login' ? 600 : 500,
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg('') }}
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'register' ? 'var(--bg-secondary)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'register' ? 600 : 500,
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} className="search-icon-pos" />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', margin: 0 }}
                    placeholder="e.g. Anand Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} className="search-icon-pos" />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  placeholder="viewer@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} className="search-icon-pos" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', margin: 0 }}
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-rose-light)',
                  color: 'var(--accent-rose)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(244, 63, 94, 0.2)'
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={busy}
            >
              <span>{busy ? 'Authenticating...' : mode === 'login' ? 'Sign in' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <span className="meta" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
              <ShieldCheck size={14} /> Subbiayavel Charitable Trust · Regd. No. 4/53/2025
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
