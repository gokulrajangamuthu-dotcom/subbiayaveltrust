// High-performance, zero-dependency Canvas Confetti & Particle Burst Engine

let confettiCanvas = null
let confettiCtx = null
let particles = []
let animationFrameId = null

function initCanvas() {
  if (typeof window === 'undefined') return null
  if (!confettiCanvas) {
    confettiCanvas = document.createElement('canvas')
    confettiCanvas.style.position = 'fixed'
    confettiCanvas.style.top = '0'
    confettiCanvas.style.left = '0'
    confettiCanvas.style.width = '100vw'
    confettiCanvas.style.height = '100vh'
    confettiCanvas.style.pointerEvents = 'none'
    confettiCanvas.style.zIndex = '99999'
    document.body.appendChild(confettiCanvas)
    confettiCtx = confettiCanvas.getContext('2d')

    const resize = () => {
      if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth * (window.devicePixelRatio || 1)
        confettiCanvas.height = window.innerHeight * (window.devicePixelRatio || 1)
        if (confettiCtx) {
          confettiCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
        }
      }
    }
    resize()
    window.addEventListener('resize', resize)
  }
  return confettiCtx
}

const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', 
  '#10B981', '#F59E0B', '#06B6D4', '#E11D48', '#FBBF24'
]

export function triggerConfetti({ count = 65, originX = 0.5, originY = 0.5 } = {}) {
  const ctx = initCanvas()
  if (!ctx) return

  const startX = window.innerWidth * originX
  const startY = window.innerHeight * originY

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 12 + 6
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
      vy: Math.sin(angle) * speed - (Math.random() * 6 + 4), // Initial upward burst
      size: Math.random() * 8 + 5,
      color: color,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 16,
      opacity: 1,
      gravity: 0.38,
      friction: 0.96,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      life: 1,
      decay: Math.random() * 0.015 + 0.012
    })
  }

  if (!animationFrameId) {
    animate()
  }
}

// Spawns bursting mini-sparkles and hearts around a specific mouse/element coordinate
export function triggerParticleBurst(clientX, clientY, type = 'heart', count = 18) {
  const ctx = initCanvas()
  if (!ctx) return

  const colors = type === 'flame' 
    ? ['#F59E0B', '#EF4444', '#F97316', '#FDE047']
    : ['#EC4899', '#F43F5E', '#8B5CF6', '#FBBF24', '#6366F1']

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
    const speed = Math.random() * 6 + 3

    particles.push({
      x: clientX,
      y: clientY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.22,
      friction: 0.95,
      shape: type === 'heart' ? 'heart' : 'star',
      life: 1,
      decay: Math.random() * 0.02 + 0.018
    })
  }

  if (!animationFrameId) {
    animate()
  }
}

function drawHeart(ctx, x, y, size, color, opacity) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.globalAlpha = Math.max(0, opacity)
  ctx.beginPath()
  const topCurveHeight = size * 0.3
  ctx.moveTo(0, topCurveHeight)
  ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight)
  ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.5, 0, size)
  ctx.bezierCurveTo(0, (size + topCurveHeight) / 1.5, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight)
  ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function animate() {
  if (!confettiCtx || !confettiCanvas) return

  confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += p.gravity
    p.vx *= p.friction
    p.vy *= p.friction
    p.rotation += p.rotationSpeed
    p.life -= p.decay
    p.opacity = p.life

    if (p.life <= 0 || p.y > window.innerHeight + 50) {
      particles.splice(i, 1)
      continue
    }

    if (p.shape === 'heart') {
      drawHeart(confettiCtx, p.x, p.y, p.size, p.color, p.opacity)
    } else if (p.shape === 'circle') {
      confettiCtx.save()
      confettiCtx.globalAlpha = Math.max(0, p.opacity)
      confettiCtx.fillStyle = p.color
      confettiCtx.beginPath()
      confettiCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
      confettiCtx.fill()
      confettiCtx.restore()
    } else {
      confettiCtx.save()
      confettiCtx.translate(p.x, p.y)
      confettiCtx.rotate((p.rotation * Math.PI) / 180)
      confettiCtx.globalAlpha = Math.max(0, p.opacity)
      confettiCtx.fillStyle = p.color
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      confettiCtx.restore()
    }
  }

  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animate)
  } else {
    animationFrameId = null
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  }
}
