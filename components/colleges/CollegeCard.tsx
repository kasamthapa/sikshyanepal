import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ArrowRight, BookOpen, Banknote } from 'lucide-react'
import type { College } from '@/types'
import Badge from '@/components/ui/Badge'

const AFFIL_COLORS: Record<string, 'blue' | 'green' | 'orange' | 'purple' | 'gray'> = {
  'Tribhuvan University':  'blue',
  'Kathmandu University':  'green',
  'Pokhara University':    'orange',
  'Purbanchal University': 'purple',
  'Private':               'gray',
}

// Cover gradient fallbacks per affiliation
const AFFIL_GRADIENT: Record<string, string> = {
  'Tribhuvan University':  'from-blue-600 to-blue-800',
  'Kathmandu University':  'from-emerald-600 to-emerald-800',
  'Pokhara University':    'from-amber-500 to-orange-700',
  'Purbanchal University': 'from-purple-600 to-purple-800',
}

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
  if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `Rs ${(n / 1_000).toFixed(0)}K`
  return `Rs ${n}`
}

interface CollegeCardProps {
  college: College & {
    avg_rating?:   number
    review_count?: number
    fee_min?:      number
    fee_max?:      number
  }
}

export default function CollegeCard({ college }: CollegeCardProps) {
  const affiliColor    = AFFIL_COLORS[college.affiliation ?? ''] ?? 'gray'
  const affiliShort    = affiliationShort(college.affiliation)
  const coverGradient  = AFFIL_GRADIENT[college.affiliation ?? ''] ?? 'from-slate-600 to-slate-800'

  const topPrograms = (college.programs ?? [])
    .slice(0, 3)
    .map((cp) => cp.program?.name)
    .filter(Boolean) as string[]

  const hasFees  = college.fee_min != null && college.fee_max != null
  const feeLabel = hasFees
    ? college.fee_min === college.fee_max
      ? formatFee(college.fee_min!)
      : `${formatFee(college.fee_min!)} – ${formatFee(college.fee_max!)}`
    : null

  return (
    <Link href={`/colleges/${college.slug}`} className="block group">
      <div
        className={`bg-card rounded-2xl border overflow-hidden flex flex-col h-full
                    transition-all duration-200 hover:shadow-card-xl hover:-translate-y-1
                    ${college.is_featured
                      ? 'border-amber-300 shadow-card'
                      : 'border-border shadow-card hover:border-border-strong'
                    }`}
      >
        {/* ── Cover image ───────────────────────────────── */}
        <div className={`relative h-40 bg-gradient-to-br ${coverGradient} flex-shrink-0 overflow-hidden`}>
          {college.cover_url ? (
            <Image
              src={college.cover_url}
              alt={college.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-black text-white/20 select-none">
                {college.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Featured badge */}
          {college.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-white shadow-sm">
                ★ Featured
              </span>
            </div>
          )}

          {/* Affiliation badge */}
          {affiliShort && (
            <div className="absolute top-3 right-3">
              <Badge variant={affiliColor}>{affiliShort}</Badge>
            </div>
          )}
        </div>

        {/* ── Card body ─────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1">
          {/* Logo + Name */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 bg-card rounded-xl border border-border flex items-center justify-center shadow-card flex-shrink-0 -mt-8 relative z-10">
              {college.logo_url ? (
                <Image
                  src={college.logo_url}
                  alt={`${college.name} logo`}
                  width={44}
                  height={44}
                  className="rounded-xl object-contain"
                />
              ) : (
                <span className="text-lg font-extrabold text-brand-600">{college.name.charAt(0)}</span>
              )}
            </div>
            <div className="pt-1 min-w-0">
              <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                {college.name}
              </h3>
            </div>
          </div>

          {/* Location */}
          {college.location && (
            <div className="flex items-center gap-1.5 text-xs text-ink-secondary mb-3">
              <MapPin className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
              <span className="truncate">{college.location}</span>
            </div>
          )}

          {/* Rating */}
          {college.avg_rating != null && college.avg_rating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(college.avg_rating!)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-ink-secondary">{college.avg_rating.toFixed(1)}</span>
              {college.review_count != null && college.review_count > 0 && (
                <span className="text-xs text-ink-muted">({college.review_count})</span>
              )}
            </div>
          )}

          {/* Programs */}
          {topPrograms.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1.5">
                <BookOpen className="w-3 h-3 text-ink-muted" />
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide">Programs</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {topPrograms.map((name) => (
                  <span key={name} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[11px] font-medium rounded-full border border-brand-100">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fee */}
          {feeLabel && (
            <div className="flex items-center gap-1.5 text-xs text-ink-secondary mb-3">
              <Banknote className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
              <span className="font-medium">{feeLabel}</span>
              <span className="text-ink-muted">/ year</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            {college.established_year && (
              <span className="text-xs text-ink-muted">Est. {college.established_year}</span>
            )}
            <span className="text-xs text-brand-600 font-semibold flex items-center gap-1 ml-auto group-hover:gap-1.5 transition-all">
              View Profile <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
