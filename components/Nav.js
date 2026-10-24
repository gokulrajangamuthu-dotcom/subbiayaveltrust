'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'
import { getInitials, getAvatarGradient } from '@/lib/utils'
import { getGamificationState, getCurrentLevel } from '@/lib/gamification'
import { useToast } from '@/components/Toast'
import { 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut,
  Flame,
  Zap
} from 'lucide-react'

export default function Nav({ name = 'Viewer', role = 'viewer' }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [gamification, setGamification] = useState(getGamificationState())

  useEffect(() => {
    function handleUpdate() {
      setGamification(getGamificationState())
    }
    window.addEventListener('gamification_updated', handleUpdate)
    return () => window.removeEventListener('gamification_updated', handleUpdate)
  }, [])

  async function logout() {
    try {
      await createClient().auth.signOut()
      toast.info('Signed out successfully')
      router.push('/login')
      router.refresh()
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  const initials = getInitials(name)
  const avatarBg = getAvatarGradient(name)
  const currentLvl = getCurrentLevel(gamification.xp)

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/feed" className="brand-logo" style={{ textDecoration: 'none' }}>
          <div 
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#fff',
              border: '2px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <img 
              src="/logo.png" 
              alt="Subbiayavel Charitable Trust Logo" 
              style={{
                height: '135%',
                width: 'auto',
                maxWidth: 'none',
                transform: 'translateX(34%)',
                objectFit: 'contain'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.15, color: 'var(--text-primary)' }}>
              Subbiayavel Trust
            </span>
            <span className="meta" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>
              Content Portal
            </span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link 
            href="/feed" 
            className={`nav-link ${pathname === '/feed' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>Feed</span>
          </Link>

          {role === 'admin' && (
            <>
              <Link 
                href="/admin" 
                className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/admin/upload" 
                className={`nav-link ${pathname === '/admin/upload' ? 'active' : ''}`}
              >
                <PlusCircle size={16} />
                <span>New Post</span>
              </Link>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {/* Real-time Streak & XP Pill */}
          <div className="nav-streak-pill" title={`Level ${currentLvl.level} (${gamification.xp} XP) • ${gamification.streak} Day Streak`}>
            <span className="nav-flame">🔥 {gamification.streak}d</span>
            <span className="nav-divider">·</span>
            <span className="nav-lvl">Lvl {currentLvl.level}</span>
          </div>

          <ThemeToggle />

          <div className="user-pill">
            <div 
              className="avatar-badge" 
              style={{ background: avatarBg, width: 28, height: 28, fontSize: '0.75rem' }}
              title={name}
            >
              {initials}
            </div>
            <span>{name}</span>
            <span className={`role-tag ${role}`}>
              {role}
            </span>
          </div>

          <button 
            className="btn-icon" 
            onClick={logout} 
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}
