'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, formatDate, getInitials, getAvatarGradient } from '@/lib/utils'
import { useToast } from '@/components/Toast'
import { playPop, playDoubleHeart, playChime, playSwoosh } from '@/lib/audio'
import { triggerParticleBurst, triggerConfetti } from '@/lib/confetti'
import { awardXP } from '@/lib/gamification'
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Video, 
  BookOpen, 
  Megaphone,
  Send,
  Eye,
  Sparkles,
  Clock,
  Smile
} from 'lucide-react'

const EMOJI_REACTIONS = [
  { emoji: '❤️', label: 'Love', id: 'love' },
  { emoji: '🔥', label: 'Fire', id: 'fire' },
  { emoji: '💡', label: 'Insight', id: 'insight' },
  { emoji: '🚀', label: 'Rocket', id: 'rocket' },
  { emoji: '👏', label: 'Clap', id: 'clap' },
  { emoji: '🧠', label: 'Genius', id: 'mindblown' },
]

export default function PostCard({ post, userId, userName, userRole = 'viewer', onDeletePost }) {
  const sb = createClient()
  const { toast } = useToast()

  const [liked, setLiked] = useState(post.likes?.some(l => l.user_id === userId) || false)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [comments, setComments] = useState(post.comments || [])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Dopamine interactive states
  const [doubleTapActive, setDoubleTapActive] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactions, setReactions] = useState({})
  const [userReaction, setUserReaction] = useState(null)
  const lastTapRef = useRef(0)
  const cardRef = useRef(null)

  // Track post view on initial load and load saved reactions
  useEffect(() => {
    if (userId && post?.id) {
      sb.from('views')
        .insert({ post_id: post.id, user_id: userId })
        .then(() => {})
        .catch(() => {})
    }

    // Check bookmark status from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_posts') || '[]')
      setIsBookmarked(saved.includes(post.id))

      // Load local reaction state for instant feedback
      const localReactions = JSON.parse(localStorage.getItem(`post_reactions_${post.id}`) || '{}')
      setReactions(localReactions.counts || { '❤️': post.likes?.length || 0 })
      setUserReaction(localReactions.userChoice || (post.likes?.some(l => l.user_id === userId) ? '❤️' : null))
    } catch (e) {}
  }, [post?.id, userId])

  // Calculate estimated reading time
  const readingTime = Math.max(1, Math.ceil((post.body?.split(/\s+/).length || 20) / 180))

  // Double-tap handler on card
  function handleCardClick(e) {
    // Avoid double tap triggering on buttons or form elements
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('video') || e.target.closest('iframe')) {
      return
    }

    const now = Date.now()
    const diff = now - lastTapRef.current
    lastTapRef.current = now

    if (diff < 320 && diff > 0) {
      // Double tap detected!
      triggerDoubleTapLike(e)
    }
  }

  function triggerDoubleTapLike(e) {
    const rect = cardRef.current?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 }
    const x = e.clientX || rect.left + rect.width / 2
    const y = e.clientY || rect.top + rect.height / 2

    setDoubleTapActive(true)
    playDoubleHeart()
    triggerParticleBurst(x, y, 'heart', 26)

    if (!liked) {
      setLiked(true)
      setLikeCount(prev => prev + 1)
      sb.from('likes').insert({ post_id: post.id, user_id: userId }).then(() => {}).catch(() => {})
    }

    awardXP(20, 'Double-Tap Heart Burst!', { x, y, actionType: 'likes' })

    setTimeout(() => {
      setDoubleTapActive(false)
    }, 900)
  }

  async function toggleLike(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const nextLiked = !liked
    setLiked(nextLiked)
    setLikeCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)))

    if (nextLiked) {
      playPop(620)
      triggerParticleBurst(x, y, 'heart', 16)
      awardXP(15, 'Post Liked', { x, y, actionType: 'likes' })
    } else {
      playPop(340)
    }

    try {
      if (nextLiked) {
        await sb.from('likes').insert({ post_id: post.id, user_id: userId })
      } else {
        await sb.from('likes').delete().match({ post_id: post.id, user_id: userId })
      }
    } catch (err) {
      setLiked(!nextLiked)
      setLikeCount(prev => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)))
      toast.error('Failed to update like')
    }
  }

  function handleSelectReaction(emojiItem, e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    playPop(700)
    triggerParticleBurst(x, y, emojiItem.emoji === '🔥' ? 'flame' : 'heart', 16)

    const nextReactions = { ...reactions }
    let nextChoice = emojiItem.emoji

    if (userReaction === emojiItem.emoji) {
      // Toggle off
      nextReactions[emojiItem.emoji] = Math.max(0, (nextReactions[emojiItem.emoji] || 1) - 1)
      nextChoice = null
      setUserReaction(null)
    } else {
      if (userReaction && nextReactions[userReaction]) {
        nextReactions[userReaction] = Math.max(0, nextReactions[userReaction] - 1)
      }
      nextReactions[emojiItem.emoji] = (nextReactions[emojiItem.emoji] || 0) + 1
      setUserReaction(emojiItem.emoji)
      awardXP(15, `${emojiItem.label} Reaction!`, { x, y, actionType: 'reactions' })
    }

    setReactions(nextReactions)
    setShowReactionPicker(false)

    try {
      localStorage.setItem(`post_reactions_${post.id}`, JSON.stringify({
        counts: nextReactions,
        userChoice: nextChoice
      }))
    } catch (err) {}
  }

  function toggleBookmark(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_posts') || '[]')
      let updated
      if (isBookmarked) {
        updated = saved.filter(id => id !== post.id)
        playPop(360)
        toast.info('Removed from saved bookmarks')
      } else {
        updated = [...saved, post.id]
        playChime()
        triggerParticleBurst(x, y, 'star', 18)
        awardXP(25, 'Post Bookmarked', { x, y, actionType: 'bookmarks' })
        toast.success('Saved to your bookmarks! (+25 XP)')
      }
      localStorage.setItem('bookmarked_posts', JSON.stringify(updated))
      setIsBookmarked(!isBookmarked)
    } catch (e) {
      toast.error('Could not update bookmark')
    }
  }

  function copyPostLink(e) {
    playPop(480)
    navigator.clipboard.writeText(`${window.location.origin}/feed#post-${post.id}`)
    toast.success('Post link copied to clipboard!')
  }

  async function addComment(e) {
    e.preventDefault()
    const trimmed = commentText.trim()
    if (!trimmed || isSubmittingComment) return

    setIsSubmittingComment(true)
    playSwoosh()

    try {
      const { data, error } = await sb
        .from('comments')
        .insert({ post_id: post.id, user_id: userId, text: trimmed })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setComments(prev => [
          ...prev, 
          { ...data, profiles: { name: userName || 'Viewer' } }
        ])
        setCommentText('')
        setShowComments(true)

        // Dopamine reward for contributing to discussion!
        awardXP(40, 'Comment Added', { 
          x: window.innerWidth / 2, 
          y: window.innerHeight / 2,
          actionType: 'comments' 
        })
        triggerConfetti({ count: 45 })
        toast.success('Comment posted! (+40 XP ✨)')
      }
    } catch (err) {
      toast.error('Failed to post comment: ' + err.message)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  async function deleteComment(commentId) {
    try {
      const { error } = await sb.from('comments').delete().eq('id', commentId)
      if (error) throw error
      setComments(prev => prev.filter(c => c.id !== commentId))
      playPop(300)
      toast.info('Comment removed')
    } catch (err) {
      toast.error('Failed to delete comment')
    }
  }

  async function handleDeletePost() {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) return
    setIsDeleting(true)
    try {
      if (post.file_url) {
        const bucket = post.type === 'video' ? 'videos' : 'pdfs'
        await sb.storage.from(bucket).remove([post.file_url])
      }
      const { error } = await sb.from('posts').delete().eq('id', post.id)
      if (error) throw error
      toast.success('Post deleted successfully')
      if (onDeletePost) onDeletePost(post.id)
    } catch (err) {
      toast.error('Failed to delete post: ' + err.message)
      setIsDeleting(false)
    }
  }

  return (
    <article 
      ref={cardRef}
      className="card-box dopamine-post-card fade-in" 
      id={`post-${post.id}`}
      onClick={handleCardClick}
    >
      {/* Double Tap Floating Heart Overlay */}
      {doubleTapActive && (
        <div className="double-tap-heart-pop">
          <Heart size={92} fill="url(#heartGradient)" color="#F43F5E" />
          <svg width="0" height="0">
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </svg>
        </div>
      )}

      {/* Post Header */}
      <div className="post-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span className={`post-type-badge ${post.type}`}>
            {post.type === 'video' && <Video size={13} />}
            {post.type === 'pdf' && <BookOpen size={13} />}
            {post.type === 'announcement' && <Megaphone size={13} />}
            {post.type === 'pdf' ? 'Book' : post.type}
          </span>
          <span className="reading-time-pill">
            <Clock size={11} />
            <span>{post.type === 'video' ? 'Video Lesson' : `${readingTime} min read`}</span>
          </span>
          <span className="meta" title={formatDate(post.created_at)}>
            {timeAgo(post.created_at)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button 
            className={`btn-icon btn-sm bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={toggleBookmark}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark post (+25 XP)'}
            aria-label="Bookmark post"
          >
            <Bookmark size={15} fill={isBookmarked ? '#F59E0B' : 'none'} color={isBookmarked ? '#F59E0B' : 'currentColor'} />
          </button>
          <button 
            className="btn-icon btn-sm" 
            onClick={copyPostLink}
            title="Share / Copy Link"
            aria-label="Share post"
          >
            <Share2 size={15} />
          </button>
          {userRole === 'admin' && (
            <button 
              className="btn-icon btn-sm" 
              onClick={handleDeletePost}
              disabled={isDeleting}
              title="Delete post"
              style={{ color: 'var(--accent-rose)' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <h2 className="post-title">{post.title}</h2>
      
      {post.body && (
        <p className="post-body-text">{post.body}</p>
      )}

      {/* Media Players */}
      {post.type === 'video' && post.signed && (
        <div className="video-wrapper">
          <video 
            src={post.signed} 
            controls 
            preload="metadata" 
            playsInline
            onPlay={() => awardXP(10, 'Video Started', { actionType: 'views' })}
          />
        </div>
      )}

      {post.type === 'pdf' && post.signed && (
        <div className="pdf-preview-box">
          <iframe src={post.signed} title={post.title} />
          <div className="pdf-action-bar">
            <span className="meta" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={15} /> PDF Document
            </span>
            <a 
              href={post.signed} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-secondary btn-sm"
              onClick={() => awardXP(15, 'Book Opened', { actionType: 'views' })}
            >
              <ExternalLink size={14} /> Open full view
            </a>
          </div>
        </div>
      )}

      {/* Emoji Reaction Bar (Popup Trigger) */}
      <div className="reactions-row">
        <div 
          className="reaction-picker-wrapper"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {showReactionPicker && (
            <div className="reaction-picker-popup scale-in">
              {EMOJI_REACTIONS.map(item => (
                <button
                  key={item.id}
                  className={`emoji-bubble-btn ${userReaction === item.emoji ? 'selected' : ''}`}
                  onClick={(e) => handleSelectReaction(item, e)}
                  title={item.label}
                >
                  <span className="emoji-char">{item.emoji}</span>
                </button>
              ))}
            </div>
          )}

          <button 
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={toggleLike}
            aria-label="Like post"
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
        </div>

        {/* Reaction Counters Display */}
        {Object.entries(reactions).map(([emoji, count]) => {
          if (count <= 0 || emoji === '❤️') return null
          const isMyChoice = userReaction === emoji
          return (
            <button
              key={emoji}
              className={`emoji-count-pill ${isMyChoice ? 'active' : ''}`}
              onClick={(e) => {
                const item = EMOJI_REACTIONS.find(r => r.emoji === emoji) || { emoji, label: 'React' }
                handleSelectReaction(item, e)
              }}
            >
              <span>{emoji}</span>
              <span className="count-num">{count}</span>
            </button>
          )
        })}

        <button 
          className="comments-toggle-btn"
          onClick={() => {
            playPop(420)
            setShowComments(!showComments)
          }}
        >
          <MessageSquare size={16} />
          <span>{comments.length} Comments</span>
        </button>

        <div className="meta double-tap-hint" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Sparkles size={13} style={{ color: 'var(--primary)' }} /> Double-tap to heart
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="comments-container">
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            Comments ({comments.length})
          </h4>

          {comments.length === 0 ? (
            <p className="meta" style={{ padding: '0.5rem 0' }}>
              No comments yet. Be the first to share your thoughts and earn +40 XP!
            </p>
          ) : (
            comments.map(c => {
              const authorName = c.profiles?.name || 'Viewer'
              const authorInitials = getInitials(authorName)
              const authorGradient = getAvatarGradient(authorName)
              const canDelete = c.user_id === userId || userRole === 'admin'

              return (
                <div className="comment-card" key={c.id}>
                  <div className="comment-avatar" style={{ background: authorGradient }}>
                    {authorInitials}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span className="comment-author">{authorName}</span>
                        <span className="contributor-tag">Scholar</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="comment-time">{timeAgo(c.created_at)}</span>
                        {canDelete && (
                          <button 
                            className="btn-ghost" 
                            style={{ padding: '0.1rem 0.3rem', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                            onClick={() => deleteComment(c.id)}
                            title="Delete comment"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                </div>
              )
            })
          )}

          {/* Comment Form */}
          <form onSubmit={addComment} className="comment-form">
            <input 
              className="form-input"
              style={{ margin: 0 }}
              placeholder="Write a thoughtful reflection (+40 XP)..." 
              value={commentText} 
              onChange={e => setCommentText(e.target.value)} 
              disabled={isSubmittingComment}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!commentText.trim() || isSubmittingComment}
            >
              <Send size={15} />
              <span>{isSubmittingComment ? 'Posting...' : 'Post'}</span>
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
