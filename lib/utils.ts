import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const FACULTIES = [
  { name: 'IT & Computing', slug: 'it', icon: '💻', color: 'bg-blue-100 text-blue-700' },
  { name: 'Management', slug: 'management', icon: '📊', color: 'bg-green-100 text-green-700' },
  { name: 'Engineering', slug: 'engineering', icon: '⚙️', color: 'bg-orange-100 text-orange-700' },
  { name: 'Medical', slug: 'medical', icon: '🏥', color: 'bg-red-100 text-red-700' },
  { name: 'Humanities', slug: 'humanities', icon: '📚', color: 'bg-purple-100 text-purple-700' },
  { name: 'Science', slug: 'science', icon: '🔬', color: 'bg-teal-100 text-teal-700' },
  { name: 'Education', slug: 'education', icon: '🎓', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Law', slug: 'law', icon: '⚖️', color: 'bg-gray-100 text-gray-700' },
]

export const UNIVERSITIES = [
  { name: 'Tribhuvan University', short: 'TU' },
  { name: 'Kathmandu University', short: 'KU' },
  { name: 'Pokhara University', short: 'PU' },
  { name: 'Purbanchal University', short: 'PurU' },
  { name: 'Rajarshi Janak University', short: 'RJU' },
]
