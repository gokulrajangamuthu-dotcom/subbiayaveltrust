'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import { formatDate, timeAgo, getInitials, getAvatarGradient } from '@/lib/utils'
import { 
  BarChart3, 
  Eye, 
  Heart, 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  Trash2, 
  Download, 
  Search, 
  Users, 
  Video, 
  BookOpen, 
  Megaphone,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react'

export default function AdminDashboard({ posts: initialPosts, profiles = [] }) {
  const sb = createClient()
  const { toast } = useToast()

  const [posts, setPosts] = useState(initialPosts)
  const [activeTab, setActiveTab] = useState('posts') // posts, audience
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPostDetail, setSelectedPostDetail] = useState(null)

  // Calculations
  const stats = useMemo(() => {
    const totalPosts = posts.length
    const totalViews = posts.reduce((acc, p) => acc + (p.views?.length || 0), 0)
    const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0)
    const totalComments = posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0)
    const engagementRate = totalViews > 0 
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1) 
      : '0.0'

    const videoCount = posts.filter(p => p.type === 'video').length
    const pdfCount = posts.filter(p => p.type === 'pdf').length
    const announcementCount = posts.filter(p => p.type === 'announcement').length

    return {
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      engagementRate,
      videoCount,
      pdfCount,
      announcementCount
    }
  }, [posts])

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    const q = searchQuery.toLowerCase()
    return posts.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.type?.toLowerCase().includes(q)
    )
  }, [posts, searchQuery])

  // Delete Post
  async function handleDeletePost(post) {
    if (!window.confirm(`Are you sure you want to delete post "${post.title}"?`)) return
    try {
      if (post.file_url) {
        const bucket = post.type === 'video' ? 'videos' : 'pdfs'
        await sb.storage.from(bucket).remove([post.file_url])
      }
      const { error } = await sb.from('posts').delete().eq('id', post.id)
      if (error) throw error

      setPosts(prev => prev.filter(p => p.id !== post.id))
      if (selectedPostDetail?.id === post.id) setSelectedPostDetail(null)
      toast.success('Post removed successfully')
    } catch (err) {
      toast.error('Failed to delete post: ' + err.message)
    }
  }

  // Export Analytics CSV
  function exportCSV() {
    try {
      const headers = ['ID', 'Title', 'Type', 'Created At', 'Views Count', 'Likes Count', 'Comments Count']
      const rows = posts.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.type,
        new Date(p.created_at).toISOString(),
        p.views?.length || 0,
        p.likes?.length || 0,
        p.comments?.length || 0
      ])

      const csvContent = 'data:text/csv;charset=utf-8,' + 
        [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `content_portal_analytics_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Analytics CSV report exported')
    } catch (e) {
      toast.error('Could not export CSV')
    }
  }

  return (
    <div className="wide-wrapper">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Portal Analytics & Management
          </h1>
          <p className="meta">Monitor audience reach, engagement metrics, and manage content assets</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <Link href="/admin/upload" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.totalPosts}</div>
            <div className="metric-lbl">Total Posts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--accent-sky-light)', color: 'var(--accent-sky)' }}>
            <Eye size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.totalViews}</div>
            <div className="metric-lbl">Total Views</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)' }}>
            <Heart size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.totalLikes}</div>
            <div className="metric-lbl">Total Likes</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--accent-amber-light)', color: 'var(--accent-amber)' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.totalComments}</div>
            <div className="metric-lbl">Comments</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.engagementRate}%</div>
            <div className="metric-lbl">Engagement</div>
          </div>
        </div>
      </div>

      {/* Content Distribution Bar */}
      <div className="card-box" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem' }}>Content Asset Distribution</h3>
        <div style={{ height: '10px', width: '100%', borderRadius: '5px', overflow: 'hidden', display: 'flex', background: 'var(--bg-tertiary)', marginBottom: '0.85rem' }}>
          {stats.totalPosts > 0 ? (
            <>
              <div style={{ width: `${(stats.announcementCount / stats.totalPosts) * 100}%`, background: 'var(--accent-emerald)' }} title={`Announcements: ${stats.announcementCount}`} />
              <div style={{ width: `${(stats.videoCount / stats.totalPosts) * 100}%`, background: 'var(--accent-rose)' }} title={`Videos: ${stats.videoCount}`} />
              <div style={{ width: `${(stats.pdfCount / stats.totalPosts) * 100}%`, background: 'var(--accent-sky)' }} title={`Books: ${stats.pdfCount}`} />
            </>
          ) : (
            <div style={{ width: '100%', background: 'var(--border-medium)' }} />
          )}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
            <span>Announcements ({stats.announcementCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-rose)' }} />
            <span>Videos ({stats.videoCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-sky)' }} />
            <span>Books / PDFs ({stats.pdfCount})</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn-ghost ${activeTab === 'posts' ? 'active' : ''}`}
          style={{
            fontWeight: 600,
            borderBottom: activeTab === 'posts' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            color: activeTab === 'posts' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
          onClick={() => setActiveTab('posts')}
        >
          <FileText size={16} />
          <span>Posts & Insights ({posts.length})</span>
        </button>

        <button
          className={`btn-ghost ${activeTab === 'audience' ? 'active' : ''}`}
          style={{
            fontWeight: 600,
            borderBottom: activeTab === 'audience' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            color: activeTab === 'audience' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
          onClick={() => setActiveTab('audience')}
        >
          <Users size={16} />
          <span>Audience Directory ({profiles.length})</span>
        </button>
      </div>

      {/* Tab Content: Posts */}
      {activeTab === 'posts' && (
        <>
          <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="search-box-wrap" style={{ maxWidth: '360px' }}>
              <Search size={16} className="search-icon-pos" />
              <input
                type="text"
                placeholder="Search posts by title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ padding: '0.55rem 0.75rem 0.55rem 2.4rem', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPosts.length === 0 ? (
              <div className="card-box" style={{ textAlign: 'center', padding: '2.5rem' }}>
                <p className="meta">No posts found.</p>
              </div>
            ) : (
              filteredPosts.map(p => (
                <div className="card-box" key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className={`post-type-badge ${p.type}`}>
                          {p.type === 'video' && <Video size={12} />}
                          {p.type === 'pdf' && <BookOpen size={12} />}
                          {p.type === 'announcement' && <Megaphone size={12} />}
                          {p.type}
                        </span>
                        <span className="meta">{formatDate(p.created_at)}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{p.title}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedPostDetail(p)}
                      >
                        <span>View Breakdown</span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        className="btn-icon btn-sm"
                        style={{ color: 'var(--accent-rose)' }}
                        onClick={() => handleDeletePost(p)}
                        title="Delete post"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Chips */}
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Eye size={15} color="var(--accent-sky)" /> {p.views?.length || 0} views
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Heart size={15} color="var(--accent-rose)" /> {p.likes?.length || 0} likes
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MessageSquare size={15} color="var(--accent-amber)" /> {p.comments?.length || 0} comments
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Tab Content: Audience Directory */}
      {activeTab === 'audience' && (
        <div className="card-box">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Registered Users & Viewers</h3>
          {profiles.length === 0 ? (
            <p className="meta">No profiles registered yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {profiles.map(prof => {
                const initials = getInitials(prof.name || 'User')
                const avatarBg = getAvatarGradient(prof.name || 'User')
                return (
                  <div 
                    key={prof.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div 
                      className="avatar-badge"
                      style={{ background: avatarBg, width: 40, height: 40, fontSize: '0.9rem' }}
                    >
                      {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{prof.name || 'Unnamed User'}</div>
                      <span className={`role-tag ${prof.role || 'viewer'}`}>{prof.role || 'viewer'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Detailed Viewer / Engagement Breakdown */}
      {selectedPostDetail && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
          onClick={() => setSelectedPostDetail(null)}
        >
          <div 
            className="card-box fade-in"
            style={{ width: '100%', maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className={`post-type-badge ${selectedPostDetail.type}`} style={{ marginBottom: '0.4rem' }}>
                  {selectedPostDetail.type}
                </span>
                <h3 style={{ fontSize: '1.25rem' }}>{selectedPostDetail.title}</h3>
                <p className="meta">{formatDate(selectedPostDetail.created_at)}</p>
              </div>
              <button 
                className="btn-icon btn-sm" 
                onClick={() => setSelectedPostDetail(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Viewers */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Eye size={16} color="var(--accent-sky)" />
                  Viewed by ({selectedPostDetail.views?.length || 0})
                </h4>
                {selectedPostDetail.views?.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {selectedPostDetail.views.map((v, i) => (
                      <span key={i} className="filter-pill" style={{ fontSize: '0.78rem', padding: '0.2rem 0.55rem' }}>
                        {v.profiles?.name || 'Viewer'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="meta" style={{ fontSize: '0.82rem' }}>No recorded views yet.</p>
                )}
              </div>

              {/* Likers */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Heart size={16} color="var(--accent-rose)" />
                  Liked by ({selectedPostDetail.likes?.length || 0})
                </h4>
                {selectedPostDetail.likes?.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {selectedPostDetail.likes.map((l, i) => (
                      <span key={i} className="filter-pill" style={{ fontSize: '0.78rem', padding: '0.2rem 0.55rem' }}>
                        {l.profiles?.name || 'Viewer'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="meta" style={{ fontSize: '0.82rem' }}>No likes yet.</p>
                )}
              </div>

              {/* Comments */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={16} color="var(--accent-amber)" />
                  Comments ({selectedPostDetail.comments?.length || 0})
                </h4>
                {selectedPostDetail.comments?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {selectedPostDetail.comments.map((c, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-light)' }}>
                        <b>{c.profiles?.name || 'Viewer'}</b>: {c.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="meta" style={{ fontSize: '0.82rem' }}>No comments yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
