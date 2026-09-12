import type { College } from '@/types'

const CAUTION = /\b(verify|confirm|check|exact current|current contact|current intake|before display)\b/i

export function cleanCollegeText(value: string | null | undefined): string | null {
  if (!value) return null
  const cleaned = value.replace(/\s*\([^)]*(?:verify|confirm|check|before display)[^)]*\)/gi, '').replace(/\s*\/\s*/g, ', ').replace(/\s{2,}/g, ' ').trim()
  return cleaned || null
}

export function collegeDisplayLocation(college: Pick<College, 'location' | 'local_level' | 'district' | 'province'>): string | null {
  const location = cleanCollegeText(college.location)
  if (location && !CAUTION.test(location)) return location
  return [college.local_level, college.district, college.province].map(cleanCollegeText).filter((part, index, all) => part && all.indexOf(part) === index).join(', ') || null
}

export const collegeDisplayAffiliation = (value: string | null | undefined) => cleanCollegeText(value)

export function collegeDisplayPrograms(value: string | null | undefined): string[] {
  return (value || '').split(';').map(cleanCollegeText).filter((name): name is string => Boolean(name) && !CAUTION.test(name!) && !/^(other|exact current|program list)/i.test(name!))
}

export function safeCollegeAddress(value: string | null | undefined): string | null {
  return value && !CAUTION.test(value) ? cleanCollegeText(value) : null
}

/** Only public web URLs are allowed in student-facing external links. */
export function safeExternalUrl(value: string | null | undefined, acceptBareDomain = false): string | null {
  const trimmed = value?.trim()
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) return null
  const candidate = acceptBareDomain && !/^[a-z][a-z\d+.-]*:/i.test(trimmed)
    ? `https://${trimmed}`
    : trimmed
  try {
    const parsed = new URL(candidate)
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) return null
    parsed.username = ''
    parsed.password = ''
    return parsed.toString()
  } catch {
    return null
  }
}

export function safeEmailAddress(value: string | null | undefined): string | null {
  const email = value?.trim()
  return email && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export function safePhoneHref(value: string | null | undefined): string | null {
  const phone = value?.trim()
  if (!phone || /[\r\n]/.test(phone) || (phone.match(/\d/g) || []).length < 7) return null
  const dialable = phone.replace(/[^\d+*#,;]/g, '')
  return dialable ? `tel:${dialable}` : null
}
