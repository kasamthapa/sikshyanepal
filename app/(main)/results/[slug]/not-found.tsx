import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export default function ResultNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Result not found</h1>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          This result may have been removed or the link may be outdated.
          Check the official university website for the latest results.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </Link>
        </div>
      </div>
    </div>
  )
}
