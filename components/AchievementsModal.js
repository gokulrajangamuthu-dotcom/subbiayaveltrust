'use client'
import { useState, useEffect } from 'react'
import { BADGES, LEVELS, getCurrentLevel, getGamificationState } from '@/lib/gamification'
import { playPop, playChime } from '@/lib/audio'
import { Trophy, Award, Flame, Zap, X, Star, CheckCircle, Lock, Sparkles } from 'lucide-react'

export default function AchievementsModal({ isOpen, onClose }) {
  const [state, setState] = useState(getGamificationState())

  useEffect(() => {
    if (isOpen) {
      setState(getGamificationState())
      playPop(440)
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentLevel = getCurrentLevel(state.xp)
  const unlockedSet = new Set(state.unlockedBadges || [])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card achievement-modal-box scale-in"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '88vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="trophy-glow-icon">
              <Trophy size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Dopamine Vault & Achievements
              </h2>
              <span className="meta" style={{ fontSize: '0.8rem' }}>
                Track your learning milestones, streaks, and unlocked badges
              </span>
            </div>
          </div>
          <button 
            className="btn-icon btn-sm" 
            onClick={() => { playPop(380); onClose() }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Level Hero Card */}
        <div className="level-hero-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '2rem' }}>{currentLevel.icon}</span>
              <div>
                <span className="level-badge-pill">LEVEL {currentLevel.level}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.15rem 0 0' }}>
                  {currentLevel.title}
                </h3>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                {state.xp} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>XP</span>
              </div>
              <span className="meta" style={{ fontSize: '0.75rem' }}>
                {currentLevel.nextLevel ? `${currentLevel.xpToNext} XP to Level ${currentLevel.nextLevel.level}` : 'Max Level Reached!'}
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="xp-track-bar">
            <div 
              className="xp-fill-shimmer" 
              style={{ width: `${currentLevel.progressPercent}%` }} 
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="dopamine-stats-row">
            <div className="dopamine-stat-item">
              <Flame size={16} style={{ color: '#F59E0B' }} />
              <span><strong>{state.streak}</strong> Day Streak</span>
            </div>
            <div className="dopamine-stat-item">
              <Award size={16} style={{ color: '#8B5CF6' }} />
              <span><strong>{unlockedSet.size}</strong> / {BADGES.length} Badges</span>
            </div>
            <div className="dopamine-stat-item">
              <Sparkles size={16} style={{ color: '#10B981' }} />
              <span><strong>{(state.stats?.likes || 0) + (state.stats?.reactions || 0)}</strong> Reactions</span>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star size={16} style={{ color: 'var(--primary)' }} />
          Collector Badges ({unlockedSet.size}/{BADGES.length})
        </h4>

        <div className="badges-grid">
          {BADGES.map(badge => {
            const isUnlocked = unlockedSet.has(badge.id)
            return (
              <div 
                key={badge.id} 
                className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="badge-icon-wrapper">
                  <span style={{ fontSize: '1.6rem', filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                    {badge.icon}
                  </span>
                  {isUnlocked ? (
                    <div className="badge-check-dot">
                      <CheckCircle size={12} fill="#10B981" color="#fff" />
                    </div>
                  ) : (
                    <div className="badge-lock-dot">
                      <Lock size={10} color="#fff" />
                    </div>
                  )}
                </div>

                <div className="badge-info">
                  <div className="badge-title">
                    {badge.title}
                  </div>
                  <div className="badge-desc">
                    {badge.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Level Progression Ladder */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.75rem 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} style={{ color: '#F59E0B' }} />
          Levels Ladder
        </h4>

        <div className="level-ladder">
          {LEVELS.map(lvl => {
            const isCurrent = lvl.level === currentLevel.level
            const isPassed = state.xp >= lvl.maxXp
            return (
              <div key={lvl.level} className={`ladder-item ${isCurrent ? 'current' : isPassed ? 'passed' : 'upcoming'}`}>
                <span className="ladder-icon">{lvl.icon}</span>
                <div className="ladder-details">
                  <span className="ladder-name">Level {lvl.level}: {lvl.title}</span>
                  <span className="ladder-range">{lvl.minXp} - {lvl.maxXp} XP</span>
                </div>
                {isPassed && <span className="ladder-status completed">Unlocked</span>}
                {isCurrent && <span className="ladder-status active">Current Level</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
