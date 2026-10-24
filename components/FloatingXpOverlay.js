'use client'
import { useEffect, useState } from 'react'

export default function FloatingXpOverlay() {
  const [bubbles, setBubbles] = useState([])

  useEffect(() => {
    function handleXp(e) {
      const { amount, x, y, reason } = e.detail || {}
      const id = Date.now() + Math.random()
      
      // Calculate clamped position
      const posX = Math.max(40, Math.min((x || window.innerWidth / 2), window.innerWidth - 80))
      const posY = Math.max(60, (y || window.innerHeight / 2) - 20)

      setBubbles(prev => [...prev, { id, amount, x: posX, y: posY, reason }])

      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== id))
      }, 1600)
    }

    window.addEventListener('xp_awarded', handleXp)
    return () => window.removeEventListener('xp_awarded', handleXp)
  }, [])

  if (bubbles.length === 0) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999999 }}>
      {bubbles.map(b => (
        <div
          key={b.id}
          className="xp-float-bubble"
          style={{
            left: b.x,
            top: b.y,
          }}
        >
          <span className="xp-text">+{b.amount} XP</span>
          <span className="xp-sparkle">✨</span>
        </div>
      ))}
    </div>
  )
}
