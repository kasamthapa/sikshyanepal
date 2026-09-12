import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ArrowRight, Banknote, Clock3, CheckCircle2 } from 'lucide-react'
import type { College } from '@/types'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import { collegeDisplayLocation, collegeDisplayPrograms, hasActiveCollegeSponsorship } from '@/lib/college-display'

// Affiliation short name
function affiliationShort(full: string | null): string | null {
  if (!full) return null
  if (full.includes('Tribhuvan'))  return 'TU'
  if (full.includes('Kathmandu'))  return 'KU'
  if (full.includes('Pokhara'))    return 'PU'
  if (full.includes('Purbanchal')) return 'PurU'
  if (full.toLowerCase().includes('private')) return 'Private'
  return full.slice(0, 6)
}

function formatFee(n: number): string {
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `${(n / 1_000).toFixed(0)}K`
  return `${n}`
}

interface CollegeCardProps {
  college: College & {
    avg_rating?:   number
    review_count?: number
    fee_min?:      number
    fee_max?:      number
    fee_period?:   string
    has_published_fees?: boolean
  }
  matchReasons?: string[]
}

export default function CollegeCard({ college, matchReasons = [] }: CollegeCardProps) {
  const affiliShort   = affiliationShort(college.affiliation)

  const linkedPrograms = (college.programs ?? [])
    .slice(0, 4)
    .map((cp) => cp.program?.name)
    .filter(Boolean) as string[]
  const researchedPrograms = collegeDisplayPrograms(college.programs_offered).slice(0, 4)
  const displayLocation = collegeDisplayLocation(college)
  const topPrograms = linkedPrograms.length > 0 ? linkedPrograms : researchedPrograms
  const levelLabels: Record<string, string> = { plus_two: '+2', bachelor: 'Bachelor', master: 'Master', mphil: 'MPhil', phd: 'PhD', diploma: 'Diploma', certificate: 'Certificate' }
  const checkedAt = college.last_verified_at ? new Date(college.last_verified_at) : null
  const checkedDays = checkedAt && !Number.isNaN(checkedAt.getTime()) ? Math.max(0, Math.floor((Date.now() - checkedAt.getTime()) / 86_400_000)) : null
  const freshness = checkedDays == null
    ? { label: 'Check date missing', tone: 'text-amber-700' }
    : checkedDays > 180
      ? { label: 'Recheck advised', tone: 'text-amber-700' }
      : { label: `Checked ${checkedAt!.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}`, tone: 'text-emerald-700' }
  const isSponsored = hasActiveCollegeSponsorship(college)

  const hasFees  = college.fee_min != null && college.fee_max != null
  const feeLabel = hasFees
    ? college.fee_min === college.fee_max
      ? `Rs. ${formatFee(college.fee_min!)}`
      : `Rs. ${formatFee(college.fee_min!)} – ${formatFee(college.fee_max!)}`
    : null
  const feePeriodLabels: Record<string, string> = { monthly: 'per month', semester: 'per semester', annual: 'per year', total_program: 'full programme', one_time: 'one-time' }

  return (
    <Link href={`/colleges/${college.slug}`} className="block group">
      <div
        className={`flex h-full flex-col overflow-hidden border bg-white
                    transition-colors duration-150
                    ${isSponsored ? 'border-amber-300' : college.is_featured ? 'border-blue-300' : 'border-gray-200 hover:border-[#1847c4]'}`}
      >
        {/* ── Cover ─────────────────────────────────────── */}
        <div
          className="relative flex-shrink-0 overflow-hidden bg-[#e9edf3]"
          style={{ height: '140px' }}
        >
          {college.cover_url ? (
            <Image
              src={college.cover_url}
              alt={college.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 border-b border-gray-200" />
          )}

          {/* University badge — top left */}
          {affiliShort && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-gray-800">
                {affiliShort}
              </span>
            </div>
          )}

          {isSponsored && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-white shadow-sm">
                {college.sponsor_label || 'Sponsored'}
              </span>
            </div>
          )}
          {college.is_featured && !isSponsored && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-blue-800 shadow-sm">Featured</span>
            </div>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1">
          {/* Logo + Name */}
          <div className="flex items-start gap-3 mb-2">
            <div className="relative z-10 -mt-8 flex h-11 w-11 flex-shrink-0 items-center justify-center border border-gray-200 bg-white">
              {college.logo_url ? (
                <Image
                  src={college.logo_url}
                  alt={`${college.name} logo`}
                  width={44}
                  height={44}
                  className="object-contain"
                />
              ) : (
                <span className="text-base font-bold text-[#1847c4]">{college.name.charAt(0)}</span>
              )}
            </div>
            <div className="pt-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1847c4] transition-colors duration-200">
                {college.name}
              </h3>
            </div>
          </div>

          {/* Location */}
          {displayLocation && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
          )}

          <div className="mb-2">
            <VerificationBadge status={college.verification_status} compact />
          </div>

          {/* Rating */}
          {college.avg_rating != null && college.avg_rating > 0 && (
            <div className="mb-2 flex items-center gap-1.5 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-semibold text-gray-700">{college.avg_rating.toFixed(1)}</span>
              <span className="text-gray-500">from {college.review_count} approved review{college.review_count === 1 ? '' : 's'}</span>
              {(college.review_count ?? 0) < 5 && <span className="text-amber-700">· small sample</span>}
            </div>
          )}

          {/* Programs — plain text, no pills */}
          {topPrograms.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">
              {topPrograms.join(' • ')}
            </p>
          )}
          {college.education_levels && college.education_levels.length > 0 && (
            <p className="mb-2 text-xs font-semibold text-blue-700">{college.education_levels.map(level => levelLabels[level]).filter(Boolean).join(' · ')}</p>
          )}

          {matchReasons.length > 0 && (
            <div className="mb-3 border-l-2 border-emerald-500 bg-emerald-50/60 py-2 pl-3" aria-label="Why this college matches">
              <p className="text-xs font-semibold text-emerald-900">Why it matches</p>
              <ul className="mt-1.5 space-y-1">{matchReasons.slice(0,3).map(reason=><li key={reason} className="flex items-start gap-1.5 text-xs leading-4 text-emerald-900"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true"/>{reason}</li>)}</ul>
            </div>
          )}

          {isSponsored && (
            <p className="mb-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-4 text-amber-900">
              {college.sponsor_disclosure || 'Paid placement. Sponsorship does not change verification status or student reviews.'}
            </p>
          )}

          {/* Fee */}
          {feeLabel && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-2" title="Published fee amount; confirm whether it is annual, semester-based or total with the college">
              <Banknote className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{feeLabel}</span>
              <span className="text-xs font-normal text-gray-500">{college.fee_period ? feePeriodLabels[college.fee_period] || college.fee_period : ''}</span>
            </div>
          )}
          {!feeLabel && college.has_published_fees && <p className="mb-2 text-xs text-gray-500">Published fees use different or undocumented periods. Open the profile to compare them safely.</p>}

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${freshness.tone}`}><Clock3 className="h-3 w-3" aria-hidden="true" />{freshness.label}</span>
            <span className="text-xs text-[#1847c4] font-semibold flex items-center gap-1 ml-auto group-hover:gap-1.5 transition-all duration-200">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
