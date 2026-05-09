import Link from 'next/link'
import { Bell, ArrowLeft } from 'lucide-react'

export default function NoticeNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notice not found</h1>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          This notice may have been removed or the link may be outdated.
          Check the official university website for the latest notices.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/notices"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notices
          </Link>
        </div>
      </div>
    </div>
  )
}
