import Link from 'next/link'
import { FileText, ExternalLink, Calendar } from 'lucide-react'
import type { Result } from '@/types'
import { formatDateShort, timeAgo } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

const universityColors: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'purple'> = {
  TU: 'blue',
  KU: 'green',
  PU: 'orange',
  PurU: 'purple',
  RJU: 'red',
}

interface ResultCardProps {
  result: Result
  compact?: boolean
}

export default function ResultCard({ result, compact = false }: ResultCardProps) {
  const shortName = result.university?.short_name || 'TU'
  const color = universityColors[shortName] || 'blue'

  if (compact) {
    return (
      <Link href={`/results/${result.slug}`} className="block group">
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {result.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={color}>{shortName}</Badge>
              <span className="text-xs text-gray-400">{timeAgo(result.published_date)}</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/results/${result.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {result.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={color}>{result.university?.short_name}</Badge>
              {result.program && <Badge variant="gray">{result.program}</Badge>}
              {result.semester && <Badge variant="gray">{result.semester}</Badge>}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateShort(result.published_date)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
