import Link from 'next/link'
import { ExternalLink, Sparkles, FileDown, ImageIcon } from 'lucide-react'
import type { Result } from '@/types'
import { formatDateShort, timeAgo } from '@/lib/utils'

const UNI_BADGE: Record<string, string> = {
  TU:    'bg-blue-100   text-blue-700',
  KU:    'bg-green-100  text-green-700',
  PU:    'bg-orange-100 text-orange-700',
  PurU:  'bg-purple-100 text-purple-700',
  NEB:   'bg-red-100    text-red-700',
  CTEVT: 'bg-yellow-100 text-yellow-700',
}

const UNI_BAR: Record<string, string> = {
  TU:    'bg-blue-500',
  KU:    'bg-emerald-500',
  PU:    'bg-amber-500',
  PurU:  'bg-purple-500',
  NEB:   'bg-red-500',
  CTEVT: 'bg-orange-500',
}

function isNew(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return false
  return Date.now() - d.getTime() < 24 * 60 * 60 * 1000
}

interface ResultCardProps {
  result:   Result
  compact?: boolean
  dark?:    boolean
}

export default function ResultCard({ result, compact = false }: ResultCardProps) {
  const shortName = result.university?.short_name || 'TU'
  const badge     = UNI_BADGE[shortName] ?? 'bg-blue-100 text-blue-700'
  const bar       = UNI_BAR[shortName]   ?? 'bg-[#1847c4]'
  const fresh     = isNew(result.published_date)
  const hasPdf    = result.content_type === 'pdf'
  const hasImage  = result.content_type === 'image'

  // ── Compact (homepage panels) ─────────────────────────────────
  if (compact) {
    return (
      <Link href={`/results/${result.slug}`} className="group block rounded-lg">
        <div className="relative flex min-h-11 items-center gap-3 rounded-lg border-b border-gray-100 py-2.5 pl-4 pr-2 transition-colors last:border-0 hover:bg-[#f5f3ee]">
          {/* Colored dot */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${bar}`} />

          <p className="text-sm font-medium text-gray-800 line-clamp-1 flex-1 min-w-0 group-hover:text-[#1847c4] transition-colors duration-200">
            {result.title}
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasPdf && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                <FileDown className="w-2.5 h-2.5" />PDF
              </span>
            )}
            {fresh && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                <Sparkles className="w-2.5 h-2.5" />New
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge}`}>
              {shortName}
            </span>
            <span className="text-[10px] font-mono text-gray-400 hidden sm:block">
              {timeAgo(result.published_date)}
            </span>
          </div>

          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-40 text-gray-400 transition-opacity" />
        </div>
      </Link>
    )
  }

  // ── Full list card ────────────────────────────────────────────
  return (
    <Link href={`/results/${result.slug}`} className="group block rounded-2xl">
      <div className="editorial-card editorial-card-interactive relative overflow-hidden py-4 pl-5 pr-4">
        {/* Left w-1 bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${bar}`} />

        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {/* Title */}
            <h3 className="editorial-card-title mb-2 line-clamp-2 text-[15px] leading-6 transition-colors group-hover:text-primary">
              {result.title}
            </h3>

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${badge}`}>
                {result.university?.short_name}
              </span>
              {result.program && (
                <span className="text-xs font-mono text-gray-500 px-2 py-0.5 rounded border border-gray-200 bg-gray-50">
                  {result.program}
                </span>
              )}
              {result.semester && (
                <span className="text-xs font-mono text-gray-500 px-2 py-0.5 rounded border border-gray-200 bg-gray-50">
                  {result.semester}
                </span>
              )}
              {hasPdf && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                  <FileDown className="w-3 h-3" />PDF
                </span>
              )}
              {hasImage && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700">
                  <ImageIcon className="w-2.5 h-2.5" />Image
                </span>
              )}
              {fresh && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                  <Sparkles className="w-2.5 h-2.5" />New
                </span>
              )}
              <span className="text-xs font-mono text-gray-400 ml-auto">
                {formatDateShort(result.published_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
