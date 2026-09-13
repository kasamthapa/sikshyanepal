import Link from 'next/link'
import { Bell, ExternalLink, Sparkles, FileDown, ImageIcon } from 'lucide-react'
import type { Notice } from '@/types'
import { formatDateShort, timeAgo } from '@/lib/utils'

const UNI_ACCENT: Record<string, { bar: string; badge: string }> = {
  TU:    { bar: 'bg-blue-500',    badge: 'bg-blue-50   text-blue-700   border-blue-200' },
  KU:    { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PU:    { bar: 'bg-amber-500',   badge: 'bg-amber-50  text-amber-700  border-amber-200' },
  PurU:  { bar: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  NEB:   { bar: 'bg-red-500',     badge: 'bg-red-50    text-red-700    border-red-200' },
  CTEVT: { bar: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200' },
}
const DEFAULT_ACCENT = { bar: 'bg-[#1847c4]', badge: 'bg-blue-50 text-[#1847c4] border-blue-200' }

function isNew(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return false
  return Date.now() - d.getTime() < 24 * 60 * 60 * 1000
}

interface NoticeCardProps {
  notice:   Notice
  compact?: boolean
  dark?:    boolean   // kept for API compat
}

export default function NoticeCard({ notice, compact = false }: NoticeCardProps) {
  const shortName = notice.university?.short_name || 'TU'
  const accent    = UNI_ACCENT[shortName] ?? DEFAULT_ACCENT
  const fresh     = isNew(notice.published_date)
  const hasPdf    = notice.content_type === 'pdf'
  const hasImage  = notice.content_type === 'image'

  // ── Compact (homepage panels) ─────────────────────────────────
  if (compact) {
    return (
      <Link href={`/notices/${notice.slug}`} className="group block rounded-lg">
        <div className="relative flex min-h-11 items-center gap-3 rounded-lg border-b border-gray-100 py-2.5 pl-4 pr-2 transition-colors last:border-0 hover:bg-[#f5f3ee]">
          {/* Colored dot */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${accent.bar}`} />

          <p className="text-sm font-medium text-gray-800 line-clamp-1 flex-1 min-w-0 group-hover:text-[#1847c4] transition-colors duration-200">
            {notice.title}
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
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${accent.badge}`}>
              {shortName}
            </span>
            <span className="text-[10px] font-mono text-gray-400 hidden sm:block">
              {timeAgo(notice.published_date)}
            </span>
          </div>

          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-40 text-gray-400 transition-opacity" />
        </div>
      </Link>
    )
  }

  // ── Full list card ─────────────────────────────────────────────
  return (
    <Link href={`/notices/${notice.slug}`} className="group block rounded-2xl">
      <div className="editorial-card editorial-card-interactive relative overflow-hidden p-4 pl-5">
        {/* Left w-1 indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent.bar}`} />

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-gray-400" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title + badges */}
            <div className="flex items-start gap-2 mb-2">
              <h3 className="editorial-card-title line-clamp-2 flex-1 text-[15px] leading-6 transition-colors group-hover:text-primary">
                {notice.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                {hasPdf && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    <FileDown className="w-2.5 h-2.5" />PDF
                  </span>
                )}
                {hasImage && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 whitespace-nowrap">
                    <ImageIcon className="w-2.5 h-2.5" />Image
                  </span>
                )}
                {fresh && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 whitespace-nowrap">
                    <Sparkles className="w-2.5 h-2.5" />New
                  </span>
                )}
              </div>
            </div>

            {/* Meta row — font-mono */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${accent.badge}`}>
                {notice.university?.short_name}
              </span>
              {notice.university?.name && (
                <span className="text-[10px] font-mono text-gray-400 truncate max-w-[140px]">
                  {notice.university.name}
                </span>
              )}
              <span className="text-[10px] font-mono text-gray-400 ml-auto">
                {formatDateShort(notice.published_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
