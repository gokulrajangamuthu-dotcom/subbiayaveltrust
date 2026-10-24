// Web Audio API Sound Synthesizer for high-engagement tactile feedback
// Zero external audio files needed - instant playback with studio crispness

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function isSoundEnabled() {
  if (typeof window === 'undefined') return true
  const saved = localStorage.getItem('sound_fx_enabled')
  return saved === null ? true : saved === 'true'
}

export function setSoundEnabled(enabled) {
  if (typeof window === 'undefined') return
  localStorage.setItem('sound_fx_enabled', enabled ? 'true' : 'false')
  window.dispatchEvent(new CustomEvent('sound_setting_changed', { detail: { enabled } }))
}

// 1. Bubble Pop (for Likes, Reactions, Quick Clicks)
export function playPop(pitch = 520) {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(pitch, now)
    osc.frequency.exponentialRampToValueAtTime(pitch * 2.2, now + 0.08)

    gain.gain.setValueAtTime(0.28, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  } catch (e) {}
}

// 2. Double-Tap Sparkle Heart Tone
export function playDoubleHeart() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // First tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.2, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.15)

    // Second resonant higher tone
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.07) // A5
    gain2.gain.setValueAtTime(0.25, now + 0.07)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.07)
    osc2.stop(now + 0.28)
  } catch (e) {}
}

// 3. Magical Chime (for Bookmarks & Achievements)
export function playChime() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const freqs = [659.25, 830.61, 987.77, 1318.51] // E5, G#5, B5, E6

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now + i * 0.05)
      
      gain.gain.setValueAtTime(0.18, now + i * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.05)
      osc.stop(now + i * 0.05 + 0.35)
    })
  } catch (e) {}
}

// 4. Level-Up Euphoric Fanfare
export function playLevelUp() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [440, 554.37, 659.25, 880, 1108.73] // A4, C#5, E5, A5, C#6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)

      gain.gain.setValueAtTime(0.24, now + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.45)
    })
  } catch (e) {}
}

// 5. Airy Swoosh (for Posting Comments & Submissions)
export function playSwoosh() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.22)

    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.22)
  } catch (e) {}
}

// 6. Flame Streak Ignite Tone
export function playFlame() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.15)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  } catch (e) {}
}
