import Link from 'next/link'
import { FileText, ExternalLink, Calendar, Sparkles, FileDown, ImageIcon } from 'lucide-react'
import type { Result } from '@/types'
import { formatDateShort, timeAgo } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

// Per-university left-border + icon accent colors
const UNI_ACCENT: Record<string, { border: string; icon: string; iconBg: string; badge: 'blue' | 'green' | 'orange' | 'red' | 'purple' }> = {
  TU:   { border: 'border-l-blue-500',   icon: 'text-blue-600',   iconBg: 'bg-blue-50',   badge: 'blue' },
  KU:   { border: 'border-l-emerald-500',icon: 'text-emerald-600',iconBg: 'bg-emerald-50', badge: 'green' },
  PU:   { border: 'border-l-amber-500',  icon: 'text-amber-600',  iconBg: 'bg-amber-50',  badge: 'orange' },
  PurU: { border: 'border-l-purple-500', icon: 'text-purple-600', iconBg: 'bg-purple-50', badge: 'purple' },
  NEB:  { border: 'border-l-red-500',    icon: 'text-red-600',    iconBg: 'bg-red-50',    badge: 'red' },
  CTEVT:{ border: 'border-l-orange-500', icon: 'text-orange-600', iconBg: 'bg-orange-50', badge: 'orange' },
}
const DEFAULT_ACCENT = { border: 'border-l-brand-500', icon: 'text-brand-600', iconBg: 'bg-brand-50', badge: 'blue' as const }

function isNew(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return false
  return Date.now() - d.getTime() < 24 * 60 * 60 * 1000
}

interface ResultCardProps {
  result:   Result
  compact?: boolean
  dark?:    boolean   // dark background variant (used in dark sections)
}

export default function ResultCard({ result, compact = false, dark = false }: ResultCardProps) {
  const shortName   = result.university?.short_name || 'TU'
  const accent      = UNI_ACCENT[shortName] ?? DEFAULT_ACCENT
  const fresh       = isNew(result.published_date)
  const hasPdf      = result.content_type === 'pdf'
  const hasImage    = result.content_type === 'image'

  // ── Compact (used in homepage dark section + feeds) ──────────
  if (compact) {
    return (
      <Link href={`/results/${result.slug}`} className="block group">
        <div
          className={`flex items-start gap-3 py-3 px-3 -mx-3 rounded-lg border-b last:border-0 transition-colors ${
            dark
              ? 'border-white/8 hover:bg-white/5'
              : 'border-border hover:bg-slate-50'
          }`}
        >
          {/* Icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}>
            <FileText className={`w-3.5 h-3.5 ${accent.icon}`} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5 flex-wrap">
              <p className={`text-sm font-medium line-clamp-1 flex-1 min-w-0 transition-colors ${
                dark
                  ? 'text-slate-200 group-hover:text-white'
                  : 'text-ink group-hover:text-brand-600'
              }`}>
                {result.title}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {hasPdf && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    <FileDown className="w-2.5 h-2.5" />PDF
                  </span>
                )}
                {hasImage && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                    <ImageIcon className="w-2.5 h-2.5" />Img
                  </span>
                )}
                {fresh && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                    <Sparkles className="w-2.5 h-2.5" />New
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={accent.badge}>{shortName}</Badge>
              <span className={`text-xs ${dark ? 'text-slate-500' : 'text-ink-muted'}`}>
                {timeAgo(result.published_date)}
              </span>
            </div>
          </div>

          <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity ${dark ? 'text-slate-400' : 'text-ink-muted'}`} />
        </div>
      </Link>
    )
  }

  // ── Full card (results page, grid) ────────────────────────────
  return (
    <Link href={`/results/${result.slug}`} className="block group">
      <div
        className={`bg-card rounded-xl border border-border border-l-4 ${accent.border}
                    p-4 transition-all duration-200 hover:shadow-card-lg hover:-translate-y-0.5 hover:border-border-strong`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}>
            <FileText className={`w-5 h-5 ${accent.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            {/* Title + badges row */}
            <div className="flex items-start gap-2 mb-2.5">
              <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors flex-1">
                {result.title}
              </h3>
              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                {hasPdf && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    <FileDown className="w-2.5 h-2.5" />PDF
                  </span>
                )}
                {hasImage && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 whitespace-nowrap">
                    <ImageIcon className="w-2.5 h-2.5" />Image
                  </span>
                )}
                {fresh && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 whitespace-nowrap">
                    <Sparkles className="w-2.5 h-2.5" />New
                  </span>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={accent.badge}>{result.university?.short_name}</Badge>
              {result.program  && <Badge variant="gray">{result.program}</Badge>}
              {result.semester && <Badge variant="gray">{result.semester}</Badge>}
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-muted">
              <Calendar className="w-3 h-3" />
              <span>{formatDateShort(result.published_date)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
