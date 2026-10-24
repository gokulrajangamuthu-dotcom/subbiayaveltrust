export function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 30) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function getInitials(name) {
  if (!name) return 'U'
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarGradient(name = '') {
  const gradients = [
    'linear-gradient(135deg, #6366F1, #8B5CF6)',
    'linear-gradient(135deg, #EC4899, #F43F5E)',
    'linear-gradient(135deg, #10B981, #059669)',
    'linear-gradient(135deg, #F59E0B, #D97706)',
    'linear-gradient(135deg, #06B6D4, #0284C7)',
    'linear-gradient(135deg, #8B5CF6, #D946EF)',
    'linear-gradient(135deg, #14B8A6, #0D9488)',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}
