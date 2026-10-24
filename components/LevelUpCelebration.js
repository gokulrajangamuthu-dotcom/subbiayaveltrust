'use client'
import { useState, useEffect } from 'react'
import { Trophy, Sparkles, X, Zap } from 'lucide-react'
import { playPop } from '@/lib/audio'

export default function LevelUpCelebration() {
  const [levelUpData, setLevelUpData] = useState(null)

  useEffect(() => {
    function handleLevelUp(e) {
      if (e.detail?.newLevel) {
        setLevelUpData(e.detail.newLevel)
      }
    }

    window.addEventListener('level_up', handleLevelUp)
    return () => window.removeEventListener('level_up', handleLevelUp)
  }, [])

  if (!levelUpData) return null

  return (
    <div className="modal-backdrop" onClick={() => { playPop(400); setLevelUpData(null) }}>
      <div 
        className="modal-card levelup-modal-box scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="levelup-glow-crown">
          <span style={{ fontSize: '3.5rem' }}>{levelUpData.icon}</span>
        </div>

        <div className="levelup-tag">LEVEL UPGRADED!</div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-primary)' }}>
          Level {levelUpData.level}: {levelUpData.title}
        </h2>

        <p className="meta" style={{ fontSize: '0.92rem', marginBottom: '1.5rem', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
          Incredible dedication! You unlocked new community status and higher XP multipliers.
        </p>

        <button 
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem 1.25rem', fontSize: '1rem' }}
          onClick={() => { playPop(500); setLevelUpData(null) }}
        >
          <Sparkles size={18} />
          <span>Keep the Dopamine Flowing!</span>
        </button>
      </div>
    </div>
  )
}
