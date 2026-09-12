import { slugify } from '@/lib/utils'

const LEVELS = new Set(['plus_two', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate'])
const STATUSES = new Set(['active', 'pending_review', 'inactive'])
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^[+()\d][+()\d\s.-]{5,29}$/

type Result = { data?: Record<string, unknown>; error?: string }

function text(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function optionalText(value: unknown, max: number, label: string): { value: string | null; error?: string } {
  const cleaned = text(value)
  if (cleaned.length > max) return { value: null, error: `${label} must be ${max} characters or fewer.` }
  return { value: cleaned || null }
}

function secureUrl(value: unknown, label: string): { value: string | null; error?: string } {
  const cleaned = text(value)
  if (!cleaned) return { value: null }
  if (cleaned.length > 1000) return { value: null, error: `${label} is too long.` }
  try {
    const url = new URL(cleaned)
    if (url.protocol !== 'https:' || !url.hostname.includes('.')) throw new Error()
    return { value: url.toString() }
  } catch {
    return { value: null, error: `${label} must be a valid HTTPS URL.` }
  }
}

/** Strict allowlist for data accepted from the college admin browser. */
export function sanitizeCollegeAdminPayload(body: unknown, mode: 'create' | 'update'): Result {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid college submission.' }
  const input = body as Record<string, unknown>
  const data: Record<string, unknown> = {}

  if (mode === 'create' || 'name' in input) {
    const value = text(input.name)
    if (value.length < 2 || value.length > 160) return { error: 'College name must be between 2 and 160 characters.' }
    data.name = value
  }
  if (mode === 'create' || 'slug' in input) {
    const fallback = mode === 'create' ? slugify(String(data.name || '')) : ''
    const value = text(input.slug) || fallback
    if (value.length < 2 || value.length > 160 || !SLUG.test(value)) return { error: 'Slug must contain lowercase letters, numbers and single hyphens only.' }
    data.slug = value
  }
  if (mode === 'create' || 'location' in input) {
    const value = text(input.location)
    if (value.length < 2 || value.length > 200) return { error: 'Location must be between 2 and 200 characters.' }
    data.location = value
  }
  if (mode === 'create' || 'education_levels' in input) {
    if (!Array.isArray(input.education_levels)) return { error: 'Choose at least one valid post-SEE college level.' }
    const levels = Array.from(new Set(input.education_levels.map(String)))
    if (!levels.length || !levels.every(level => LEVELS.has(level))) return { error: 'Choose at least one valid post-SEE college level.' }
    data.education_levels = levels
  }

  for (const [key, max, label] of [
    ['description', 5000, 'Description'], ['address', 500, 'Address'],
    ['affiliation', 300, 'Affiliation'],
  ] as const) {
    if (!(key in input)) continue
    const result = optionalText(input[key], max, label)
    if (result.error) return { error: result.error }
    data[key] = result.value
  }

  if ('email' in input) {
    const value = text(input.email).toLowerCase()
    if (value && (value.length > 254 || !EMAIL.test(value))) return { error: 'Enter a valid college email address.' }
    data.email = value || null
  }
  if ('phone' in input) {
    const value = text(input.phone)
    if (value && !PHONE.test(value)) return { error: 'Enter a valid college phone number.' }
    data.phone = value || null
  }
  for (const [key, label] of [['website', 'Website'], ['logo_url', 'Logo URL'], ['cover_url', 'Cover image URL']] as const) {
    if (!(key in input)) continue
    const result = secureUrl(input[key], label)
    if (result.error) return { error: result.error }
    data[key] = result.value
  }
  if ('established_year' in input) {
    const raw = input.established_year
    if (raw == null || raw === '') data.established_year = null
    else {
      const year = Number(raw)
      if (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear()) return { error: 'Established year must be a valid AD year.' }
      data.established_year = year
    }
  }
  if ('is_featured' in input) {
    if (typeof input.is_featured !== 'boolean') return { error: 'Featured status must be true or false.' }
    data.is_featured = input.is_featured
  }
  if ('is_sponsored' in input) {
    if (typeof input.is_sponsored !== 'boolean') return { error: 'Sponsored status must be true or false.' }
    data.is_sponsored = input.is_sponsored
  }
  for (const [key, max, label] of [
    ['sponsor_label', 40, 'Sponsor label'], ['sponsor_disclosure', 300, 'Sponsor disclosure'],
  ] as const) {
    if (!(key in input)) continue
    const result = optionalText(input[key], max, label)
    if (result.error) return { error: result.error }
    data[key] = result.value
  }
  for (const key of ['sponsor_starts_at', 'sponsor_ends_at'] as const) {
    if (!(key in input)) continue
    if (input[key] == null || input[key] === '') data[key] = null
    else {
      const value = new Date(String(input[key]))
      if (Number.isNaN(value.getTime())) return { error: 'Sponsor campaign dates must be valid.' }
      data[key] = value.toISOString()
    }
  }
  if ('sponsor_position' in input) {
    if (input.sponsor_position == null || input.sponsor_position === '') data.sponsor_position = null
    else {
      const value = Number(input.sponsor_position)
      if (!Number.isInteger(value) || value < 1 || value > 100) return { error: 'Sponsor position must be from 1 to 100.' }
      data.sponsor_position = value
    }
  }
  if (input.is_sponsored === true) {
    if (!text(input.sponsor_label) || !input.sponsor_starts_at || !input.sponsor_ends_at) return { error: 'Sponsored placements require a label, start date and end date.' }
    if (new Date(String(input.sponsor_ends_at)) <= new Date(String(input.sponsor_starts_at))) return { error: 'Sponsor end date must be after the start date.' }
  }
  if ('status' in input) {
    const status = String(input.status)
    if (!STATUSES.has(status)) return { error: 'Invalid college publishing status.' }
    data.status = status
  }
  if (!Object.keys(data).length) return { error: 'No editable college fields were provided.' }
  data.updated_at = new Date().toISOString()
  return { data }
}
