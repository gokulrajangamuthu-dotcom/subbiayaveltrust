'use client'
import { useState, useEffect } from 'react'
import { getGamificationState, getCurrentLevel, awardXP } from '@/lib/gamification'
import { isSoundEnabled, setSoundEnabled, playPop, playFlame, playChime } from '@/lib/audio'
import { triggerConfetti, triggerParticleBurst } from '@/lib/confetti'
import { Flame, Sparkles, Trophy, Volume2, VolumeX, Zap, Award } from 'lucide-react'

export default function DopamineStreakBanner({ onOpenAchievements }) {
  const [gamification, setGamification] = useState(getGamificationState())
  const [soundOn, setSoundOn] = useState(true)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [isSparkling, setIsSparkling] = useState(false)

  useEffect(() => {
    setSoundOn(isSoundEnabled())
    const initial = getGamificationState()
    setGamification(initial)

    // Check if claimed daily check-in
    const lastClaim = localStorage.getItem('last_daily_claim_date')
    const today = new Date().toISOString().slice(0, 10)
    setHasCheckedInToday(lastClaim === today)

    function handleUpdate() {
      setGamification(getGamificationState())
    }

    function handleSoundChange(e) {
      setSoundOn(e.detail?.enabled)
    }

    window.addEventListener('gamification_updated', handleUpdate)
    window.addEventListener('sound_setting_changed', handleSoundChange)

    return () => {
      window.removeEventListener('gamification_updated', handleUpdate)
      window.removeEventListener('sound_setting_changed', handleSoundChange)
    }
  }, [])

  function toggleSound() {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    if (next) playPop(600)
  }

  function handleDailyBoost(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem('last_daily_claim_date', today)
    setHasCheckedInToday(true)

    playFlame()
    triggerParticleBurst(x, y, 'flame', 24)
    triggerConfetti({ originX: x / window.innerWidth, originY: y / window.innerHeight, count: 40 })

    awardXP(50, 'Daily Streak Boost', { x, y, actionType: 'views' })
    setIsSparkling(true)
    setTimeout(() => setIsSparkling(false), 2000)
  }

  const levelInfo = getCurrentLevel(gamification.xp)

  return (
    <div className="dopamine-banner card-box">
      <div className="dopamine-banner-inner">
        {/* Left: Streak & Flame */}
        <div className="streak-badge-container">
          <div className="flame-icon-pulse" title={`${gamification.streak} Day Active Streak!`}>
            <Flame size={28} className="flame-svg" />
            <span className="streak-count">{gamification.streak}</span>
          </div>

          <div className="streak-text-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="streak-title">{gamification.streak} Day Learning Streak</span>
              <span className="streak-fire-pill">🔥 Active</span>
            </div>
            <span className="meta" style={{ fontSize: '0.78rem' }}>
              Keep learning daily to multiply your XP rewards!
            </span>
          </div>
        </div>

        {/* Center: Level & XP Track */}
        <div className="dopamine-level-center">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{levelInfo.icon}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Level {levelInfo.level} · {levelInfo.title}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
              {gamification.xp} XP
            </span>
          </div>

          <div className="xp-track-bar small">
            <div 
              className="xp-fill-shimmer" 
              style={{ width: `${levelInfo.progressPercent}%` }} 
              title={`${levelInfo.progressPercent}% towards next level`}
            />
          </div>
        </div>

        {/* Right: Actions (Daily Boost, Vault, Sound) */}
        <div className="dopamine-banner-actions">
          {!hasCheckedInToday ? (
            <button 
              className="btn btn-primary btn-sm pulse-glow-btn"
              onClick={handleDailyBoost}
              title="Claim your +50 XP daily streak boost!"
            >
              <Zap size={14} />
              <span>Claim +50 XP</span>
            </button>
          ) : (
            <div className="claimed-streak-tag" title="Daily streak claimed!">
              <Sparkles size={13} style={{ color: '#10B981' }} />
              <span>Streak Claimed</span>
            </div>
          )}

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenAchievements}
            title="Open Achievements & Badges Vault"
          >
            <Trophy size={14} style={{ color: '#F59E0B' }} />
            <span>Vault</span>
            {gamification.unlockedBadges?.length > 0 && (
              <span className="badge-mini-counter">{gamification.unlockedBadges.length}</span>
            )}
          </button>

          <button 
            className="btn-icon btn-sm"
            onClick={toggleSound}
            title={soundOn ? 'Sound FX Enabled (Click to mute)' : 'Sound FX Muted (Click to enable)'}
            aria-label="Toggle Sound Effects"
            style={{ color: soundOn ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
