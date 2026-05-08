'use client'

import Link from 'next/link'
import { GitCompare, Plus, MapPin, Star, Building2 } from 'lucide-react'

export default function ComparePage() {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Compare Colleges</h1>
        </div>
        <p className="text-gray-500">Select up to 3 colleges to compare side-by-side</p>
      </div>

      {/* Compare Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center hover:border-blue-300 transition-colors">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-3">Add College {i + 1}</p>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Building2 className="w-4 h-4" /> Browse Colleges
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison Table Template */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <GitCompare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No Colleges Selected</h2>
        <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
          Select colleges from the browse page to compare fees, programs, ratings, and more side-by-side.
        </p>
        <Link
          href="/colleges"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Browse All Colleges
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {[
          { icon: MapPin, label: 'Location', desc: 'Compare colleges by city and district' },
          { icon: Star, label: 'Ratings', desc: 'Compare student reviews and ratings' },
          { icon: Building2, label: 'Programs', desc: 'Compare programs, fees, and seats' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900 text-sm">{label}</p>
              <p className="text-xs text-blue-700 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
