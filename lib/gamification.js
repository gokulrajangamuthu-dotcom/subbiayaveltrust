// Gamification & Dopamine Progression Engine
// Manages XP, Daily Streaks, Levels, and Badges with localStorage sync & event-driven UI updates

import { playLevelUp, playChime } from './audio'
import { triggerConfetti } from './confetti'

export const LEVELS = [
  { level: 1, title: 'Curious Explorer', minXp: 0, maxXp: 100, icon: '🌱' },
  { level: 2, title: 'Knowledge Seeker', minXp: 100, maxXp: 250, icon: '⚡' },
  { level: 3, title: 'Engaged Scholar', minXp: 250, maxXp: 500, icon: '🔥' },
  { level: 4, title: 'Community Champion', minXp: 500, maxXp: 900, icon: '💎' },
  { level: 5, title: 'Wisdom Collector', minXp: 900, maxXp: 1500, icon: '🌟' },
  { level: 6, title: 'Portal Master', minXp: 1500, maxXp: 2400, icon: '👑' },
  { level: 7, title: 'Grand Luminary', minXp: 2400, maxXp: 3500, icon: '✨' },
]

export const BADGES = [
  {
    id: 'first_heart',
    title: 'First Spark',
    desc: 'Liked your first post on the portal',
    icon: '❤️',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'super_liker',
    title: 'Heart Champion',
    desc: 'Liked 5 or more inspiring posts',
    icon: '💖',
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 'streak_3',
    title: 'Momentum Builder',
    desc: 'Maintained a 3-day active streak',
    icon: '🔥',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'first_comment',
    title: 'Voice of Trust',
    desc: 'Contributed your first thoughtful comment',
    icon: '💬',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'bookworm',
    title: 'Knowledge Archivist',
    desc: 'Saved 3+ items to your private bookmarks',
    icon: '🔖',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'explorer',
    title: 'Deep Learner',
    desc: 'Engaged with multiple multimedia resources',
    icon: '🚀',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'reaction_pro',
    title: 'Expressive Mind',
    desc: 'Sent 10+ emoji reactions across posts',
    icon: '⚡',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'high_roller',
    title: 'Level 3 Achiever',
    desc: 'Reached Level 3 Engaged Scholar status',
    icon: '🏆',
    color: 'from-amber-400 to-yellow-500'
  }
]

const STORAGE_KEY = 'dopamine_profile_state_v1'

export function getGamificationState() {
  if (typeof window === 'undefined') {
    return {
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      unlockedBadges: [],
      stats: { likes: 0, comments: 0, bookmarks: 0, reactions: 0, views: 0 }
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let state = raw ? JSON.parse(raw) : null

    const todayStr = new Date().toISOString().slice(0, 10)

    if (!state) {
      state = {
        xp: 45, // starter bonus!
        streak: 1,
        lastActiveDate: todayStr,
        unlockedBadges: [],
        stats: { likes: 0, comments: 0, bookmarks: 0, reactions: 0, views: 0 }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      // Check streak continuity
      const lastDate = new Date(state.lastActiveDate || todayStr)
      const currentDate = new Date(todayStr)
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        state.streak += 1
        state.lastActiveDate = todayStr
        state.xp += 25 // daily streak bonus
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } else if (diffDays > 1) {
        state.streak = 1
        state.lastActiveDate = todayStr
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
    }

    return state
  } catch (e) {
    return {
      xp: 45,
      streak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      unlockedBadges: [],
      stats: { likes: 0, comments: 0, bookmarks: 0, reactions: 0, views: 0 }
    }
  }
}

export function getCurrentLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      const current = LEVELS[i]
      const next = LEVELS[i + 1] || null
      const range = next ? next.minXp - current.minXp : 500
      const progressInLevel = xp - current.minXp
      const percent = Math.min(100, Math.round((progressInLevel / range) * 100))
      return {
        ...current,
        nextLevel: next,
        progressPercent: percent,
        xpToNext: next ? next.minXp - xp : 0
      }
    }
  }
  return { ...LEVELS[0], nextLevel: LEVELS[1], progressPercent: 0, xpToNext: 100 }
}

export function awardXP(amount, reason = 'Action', meta = {}) {
  if (typeof window === 'undefined') return

  const state = getGamificationState()
  const oldLevel = getCurrentLevel(state.xp)
  state.xp += amount

  // Update specific stats
  if (meta.actionType && state.stats) {
    state.stats[meta.actionType] = (state.stats[meta.actionType] || 0) + 1
  }

  // Check Badge conditions
  const newBadges = []
  const unlock = (badgeId) => {
    if (!state.unlockedBadges.includes(badgeId)) {
      state.unlockedBadges.push(badgeId)
      newBadges.push(badgeId)
    }
  }

  if (state.stats.likes >= 1) unlock('first_heart')
  if (state.stats.likes >= 5) unlock('super_liker')
  if (state.streak >= 3) unlock('streak_3')
  if (state.stats.comments >= 1) unlock('first_comment')
  if (state.stats.bookmarks >= 3) unlock('bookworm')
  if (state.stats.reactions >= 10) unlock('reaction_pro')
  if (state.stats.views >= 5) unlock('explorer')
  if (state.xp >= 250) unlock('high_roller')

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

  const newLevel = getCurrentLevel(state.xp)

  // Dispatch global XP award event with screen coords for floating XP bubble
  window.dispatchEvent(new CustomEvent('xp_awarded', {
    detail: {
      amount,
      reason,
      totalXp: state.xp,
      x: meta.x || window.innerWidth / 2,
      y: meta.y || window.innerHeight / 2
    }
  }))

  // Level-up celebration
  if (newLevel.level > oldLevel.level) {
    playLevelUp()
    triggerConfetti({ count: 120 })
    window.dispatchEvent(new CustomEvent('level_up', {
      detail: {
        newLevel: newLevel
      }
    }))
  }

  // Badge celebration
  if (newBadges.length > 0) {
    playChime()
    triggerConfetti({ count: 60 })
    window.dispatchEvent(new CustomEvent('badge_unlocked', {
      detail: {
        badgeIds: newBadges
      }
    }))
  }

  window.dispatchEvent(new CustomEvent('gamification_updated', { detail: state }))
}
