'use client'
import { useState, useMemo } from 'react'
import PostCard from '@/components/PostCard'
import DopamineStreakBanner from '@/components/DopamineStreakBanner'
import AchievementsModal from '@/components/AchievementsModal'
import FloatingXpOverlay from '@/components/FloatingXpOverlay'
import LevelUpCelebration from '@/components/LevelUpCelebration'
import { 
  Search, 
  Sparkles, 
  Megaphone, 
  Video, 
  BookOpen, 
  Bookmark, 
  SlidersHorizontal,
  FolderOpen,
  Trophy
} from 'lucide-react'

export default function FeedView({ initialPosts = [], userId, userName, userRole }) {
  const [posts, setPosts] = useState(initialPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // all, announcement, video, pdf, saved
  const [sortBy, setSortBy] = useState('newest') // newest, likes, comments
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  // Handle post deletion from list
  function handleDeletePost(deletedId) {
    setPosts(prev => prev.filter(p => p.id !== deletedId))
  }

  // Filter & Sort Logic
  const filteredPosts = useMemo(() => {
    let list = [...posts]

    // Saved/Bookmarked Filter
    if (activeFilter === 'saved') {
      try {
        const saved = JSON.parse(localStorage.getItem('bookmarked_posts') || '[]')
        list = list.filter(p => saved.includes(p.id))
      } catch (e) {
        list = []
      }
    } else if (activeFilter !== 'all') {
      list = list.filter(p => p.type === activeFilter)
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.body?.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'likes') {
      list.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    } else if (sortBy === 'comments') {
      list.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
    }

    return list
  }, [posts, activeFilter, searchQuery, sortBy])

  return (
    <div className="main-wrapper">
      {/* Floating XP Popups & Level Up Overlays */}
      <FloatingXpOverlay />
      <LevelUpCelebration />
      <AchievementsModal 
        isOpen={showAchievementsModal} 
        onClose={() => setShowAchievementsModal(false)} 
      />

      {/* Trust Header Hero Banner */}
      <div 
        className="card-box trust-hero-glow" 
        style={{
          marginBottom: '1.25rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap'
        }}
      >
        <div 
          style={{
            width: 58,
            height: 58,
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

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.15rem' }}>
            சுப்பையாவேல் தொண்டு அறக்கட்டளை
          </div>
          <h2 style={{ fontSize: '1.18rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
            SUBBIAYAVEL CHARITABLE TRUST
          </h2>
          <div className="meta" style={{ fontSize: '0.78rem', marginTop: '0.2rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <span>Regd. No. 4/53/2025</span>
            <span>·</span>
            <span>Chennai - 600 126</span>
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAchievementsModal(true)}
          title="Open Achievements Vault"
          style={{ marginLeft: 'auto' }}
        >
          <Trophy size={15} style={{ color: '#F59E0B' }} />
          <span>My Vault</span>
        </button>
      </div>

      {/* Gamification Streak & XP Banner */}
      <DopamineStreakBanner onOpenAchievements={() => setShowAchievementsModal(true)} />

      {/* Search & Filter Toolbar */}
      <div className="feed-toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box-wrap" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={18} className="search-icon-pos" />
            <input
              type="text"
              placeholder="Search posts, lessons, or announcements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
            <select 
              className="form-select"
              style={{ width: 'auto', margin: 0, padding: '0.65rem 0.85rem', fontSize: '0.88rem' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Latest Posts</option>
              <option value="likes">Most Liked</option>
              <option value="comments">Most Discussed</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          <button 
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <Sparkles size={14} />
            <span>All Posts ({posts.length})</span>
          </button>

          <button 
            className={`filter-pill ${activeFilter === 'announcement' ? 'active' : ''}`}
            onClick={() => setActiveFilter('announcement')}
          >
            <Megaphone size={14} />
            <span>Announcements ({posts.filter(p => p.type === 'announcement').length})</span>
          </button>

          <button 
            className={`filter-pill ${activeFilter === 'video' ? 'active' : ''}`}
            onClick={() => setActiveFilter('video')}
          >
            <Video size={14} />
            <span>Videos ({posts.filter(p => p.type === 'video').length})</span>
          </button>

          <button 
            className={`filter-pill ${activeFilter === 'pdf' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pdf')}
          >
            <BookOpen size={14} />
            <span>Books ({posts.filter(p => p.type === 'pdf').length})</span>
          </button>

          <button 
            className={`filter-pill ${activeFilter === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveFilter('saved')}
          >
            <Bookmark size={14} />
            <span>Saved Bookmarks</span>
          </button>
        </div>
      </div>

      {/* Feed List */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredPosts.length === 0 ? (
          <div className="card-box" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <div 
              style={{
                width: 56, 
                height: 56, 
                borderRadius: '50%', 
                background: 'var(--bg-tertiary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1rem',
                color: 'var(--text-muted)'
              }}
            >
              <FolderOpen size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No posts found</h3>
            <p className="meta" style={{ maxWidth: '400px', margin: '0 auto 1.25rem' }}>
              {searchQuery || activeFilter !== 'all' 
                ? "We couldn't find anything matching your filters or search terms."
                : "Nothing has been published to the feed yet. Check back soon!"}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchQuery(''); setActiveFilter('all') }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map(p => (
            <PostCard 
              key={p.id} 
              post={p} 
              userId={userId} 
              userName={userName}
              userRole={userRole}
              onDeletePost={handleDeletePost}
            />
          ))
        )}
      </main>
    </div>
  )
}
