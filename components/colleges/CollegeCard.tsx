import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ArrowRight, BookOpen, Banknote } from 'lucide-react'
import type { College } from '@/types'
import Badge from '@/components/ui/Badge'

// Map affiliation strings → badge color
const AFFIL_COLORS: Record<string, 'blue' | 'green' | 'orange' | 'purple' | 'gray'> = {
  'Tribhuvan University':  'blue',
  'Kathmandu University':  'green',
  'Pokhara University':    'orange',
  'Purbanchal University': 'purple',
  'Private':               'gray',
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
  const affiliColor = AFFIL_COLORS[college.affiliation ?? ''] ?? 'gray'
  const affiliShort = affiliationShort(college.affiliation)

  // Top 3 program names from nested college_programs
  const topPrograms = (college.programs ?? [])
    .slice(0, 3)
    .map((cp) => cp.program?.name)
    .filter(Boolean) as string[]

  // Fee range label
  const hasFees = college.fee_min != null && college.fee_max != null
  const feeLabel = hasFees
    ? college.fee_min === college.fee_max
      ? formatFee(college.fee_min!)
      : `${formatFee(college.fee_min!)} – ${formatFee(college.fee_max!)}`
    : null

  return (
    <Link href={`/colleges/${college.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 h-full flex flex-col">
        {/* Cover */}
        <div className="relative h-36 bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
          {college.cover_url ? (
            <Image src={college.cover_url} alt={college.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-blue-300 opacity-50">
                {college.name.charAt(0)}
              </span>
            </div>
          )}
          {college.is_featured && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-white shadow-sm">
                ★ Featured
              </span>
            </div>
          )}
          {affiliShort && (
            <div className="absolute top-2 right-2">
              <Badge variant={affiliColor}>{affiliShort}</Badge>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          {/* Logo + Name */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0 -mt-8 relative z-10">
              {college.logo_url ? (
                <Image
                  src={college.logo_url}
                  alt={`${college.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-lg object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-blue-600">{college.name.charAt(0)}</span>
              )}
            </div>
            <div className="pt-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {college.name}
              </h3>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{college.location}</span>
          </div>

          {/* Rating */}
          {college.avg_rating != null && college.avg_rating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(college.avg_rating!)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 font-medium">{college.avg_rating.toFixed(1)}</span>
              {college.review_count != null && college.review_count > 0 && (
                <span className="text-xs text-gray-400">({college.review_count})</span>
              )}
            </div>
          )}

          {/* Top programs */}
          {topPrograms.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1.5">
                <BookOpen className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Programs</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {topPrograms.map((name) => (
                  <span key={name} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fee range */}
          {feeLabel && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <Banknote className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{feeLabel} / year</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            {college.established_year && (
              <span className="text-xs text-gray-500">Est. {college.established_year}</span>
            )}
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1 ml-auto group-hover:gap-1.5 transition-all">
              View Profile <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
