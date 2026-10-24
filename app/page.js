import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Video, 
  BookOpen, 
  Megaphone, 
  ShieldCheck, 
  ArrowRight, 
  LogIn,
  Sparkles,
  Heart
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: {
    absolute: 'Subbiayavel Trust | Official Website',
  },
  description:
    'Official website and digital learning portal for Subbiayavel Charitable Trust (Regd. No. 4/53/2025). Discover educational videos, books, literature, and trust announcements.',
  alternates: {
    canonical: 'https://subbiayaveltrust.vercel.app/',
  },
  openGraph: {
    title: 'Subbiayavel Trust | Official Website',
    description:
      'Official website and digital learning portal for Subbiayavel Charitable Trust (Regd. No. 4/53/2025). Discover educational videos, books, literature, and trust announcements.',
    url: 'https://subbiayaveltrust.vercel.app/',
    siteName: 'Subbiayavel Trust',
    images: [
      {
        url: 'https://subbiayaveltrust.vercel.app/logo.png',
        width: 1200,
        height: 630,
        alt: 'Subbiayavel Charitable Trust Official Banner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subbiayavel Trust | Official Website',
    description:
      'Official website and digital learning portal for Subbiayavel Charitable Trust (Regd. No. 4/53/2025).',
    images: ['https://subbiayaveltrust.vercel.app/logo.png'],
  },
}

export default async function HomePage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()

  // If already authenticated, direct straight to the content feed
  if (user) {
    redirect('/feed')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navigation */}
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-container" style={{ justifyContent: 'space-between' }}>
          <Link href="/" className="brand-logo" style={{ textDecoration: 'none' }}>
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
                Official Website
              </span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />
            <Link 
              href="/login" 
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.88rem' }}
            >
              <LogIn size={15} />
              <span>Portal Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div className="main-wrapper" style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* Trust Banner Image */}
          <div 
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: '#fff',
              border: '1px solid var(--border-medium)',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center'
            }}
          >
            <img 
              src="/logo.png" 
              alt="Subbiayavel Charitable Trust Official Banner" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
              fetchPriority="high"
            />
          </div>

          {/* Hero Section */}
          <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '1rem',
                border: '1px solid rgba(79, 70, 229, 0.2)'
              }}
            >
              <ShieldCheck size={15} />
              <span>Registered Charitable Trust · Regd. No. 4/53/2025</span>
            </div>

            <h1 
              className="font-serif" 
              style={{ 
                fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', 
                lineHeight: 1.25, 
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}
            >
              Subbiayavel Trust
            </h1>

            <p 
              style={{ 
                fontSize: '1.05rem', 
                color: 'var(--text-secondary)', 
                maxWidth: '650px', 
                margin: '0 auto 1.75rem auto',
                lineHeight: 1.65 
              }}
            >
              Welcome to the official website and digital portal of Subbiayavel Charitable Trust. 
              We are dedicated to community welfare, sharing educational video lessons, reading literature, 
              and official announcements.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                href="/login" 
                className="btn btn-primary"
                style={{ padding: '0.7rem 1.4rem', fontSize: '0.98rem' }}
              >
                <span>Access Member Portal</span>
                <ArrowRight size={17} />
              </Link>
              <Link 
                href="/feed" 
                className="btn btn-secondary"
                style={{ padding: '0.7rem 1.4rem', fontSize: '0.98rem' }}
              >
                <Sparkles size={16} />
                <span>Explore Media Feed</span>
              </Link>
            </div>
          </section>

          {/* Core Focus Areas */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 
              className="font-serif" 
              style={{ 
                fontSize: '1.45rem', 
                textAlign: 'center', 
                marginBottom: '1.5rem',
                color: 'var(--text-primary)'
              }}
            >
              Our Community & Content Resources
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Card 1: Educational Videos */}
              <div 
                className="card-box" 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div 
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Video size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Video Lessons & Media</h3>
                <p className="meta" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                  High-quality video lessons, informative presentations, and educational media curated for community learning.
                </p>
              </div>

              {/* Card 2: Books & Publications */}
              <div 
                className="card-box" 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div 
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-emerald-light)',
                    color: 'var(--accent-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BookOpen size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Digital Books & Literature</h3>
                <p className="meta" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Downloadable and readable PDF publications, reference literature, and instructional material.
                </p>
              </div>

              {/* Card 3: Announcements */}
              <div 
                className="card-box" 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div 
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-amber-light)',
                    color: 'var(--accent-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Megaphone size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Trust Announcements</h3>
                <p className="meta" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Official notices, program announcements, and updates regarding the activities of Subbiayavel Charitable Trust.
                </p>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section 
            className="card-box" 
            style={{ 
              padding: '2rem', 
              borderRadius: 'var(--radius-lg)', 
              marginBottom: '2.5rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
              <Heart size={20} />
              <h2 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                About Subbiayavel Charitable Trust
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Subbiayavel Charitable Trust is an officially registered charitable trust established under 
              <strong> Regd. No. 4/53/2025</strong>. The trust’s digital content portal provides members and learners 
              with seamless access to published resources, instructional video recordings, and essential books.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Visitors can sign in or register to join the community, explore lessons, bookmark reading materials, 
              and participate in discussions through verified comments and reactions.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer 
        style={{ 
          borderTop: '1px solid var(--border-light)', 
          padding: '2rem 1rem', 
          background: 'var(--bg-secondary)',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <span>Subbiayavel Trust</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Regd. No. 4/53/2025</span>
          </div>
          <p className="meta" style={{ fontSize: '0.82rem' }}>
            Official digital website and content portal. Dedicated to educational resources and community service.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem' }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            <Link href="/login" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Portal Login</Link>
            <Link href="/feed" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Feed</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
