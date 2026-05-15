import Link from 'next/link'
import { Bell, ExternalLink, Calendar, Sparkles, FileDown, Image } from 'lucide-react'
import type { Notice } from '@/types'
import { formatDateShort, timeAgo } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

const universityColors: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'purple'> = {
  TU:   'blue',
  KU:   'green',
  PU:   'orange',
  PurU: 'purple',
  RJU:  'red',
}

function isNew(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const published = new Date(dateString)
  if (isNaN(published.getTime())) return false
  return Date.now() - published.getTime() < 7 * 24 * 60 * 60 * 1000
}

interface NoticeCardProps {
  notice:   Notice
  compact?: boolean
}

export default function NoticeCard({ notice, compact = false }: NoticeCardProps) {
  const shortName   = notice.university?.short_name || 'TU'
  const color       = universityColors[shortName] || 'blue'
  const fresh       = isNew(notice.published_date)
  const contentType = notice.content_type
  const hasPdf      = contentType === 'pdf'
  const hasImage    = contentType === 'image'

  if (compact) {
    return (
      <Link href={`/notices/${notice.slug}`} className="block group">
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors">
          <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors flex-1">
                {notice.title}
              </p>
              {hasPdf && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex-shrink-0">
                  <FileDown className="w-2.5 h-2.5" />PDF
                </span>
              )}
              {hasImage && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex-shrink-0">
                  <Image className="w-2.5 h-2.5" />Image
                </span>
              )}
              {fresh && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={color}>{shortName}</Badge>
              <span className="text-xs text-gray-400">{timeAgo(notice.published_date)}</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/notices/${notice.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                {notice.title}
              </h3>
              <div className="flex flex-col gap-1 items-end flex-shrink-0 mt-0.5">
                {hasPdf && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                    <FileDown className="w-2.5 h-2.5" />PDF
                  </span>
                )}
                {hasImage && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    <Image className="w-2.5 h-2.5" />Image
                  </span>
                )}
                {fresh && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    <Sparkles className="w-2.5 h-2.5" />New
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={color}>{notice.university?.short_name}</Badge>
              <Badge variant="gray">{notice.university?.name}</Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateShort(notice.published_date)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
