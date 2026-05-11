'use client'

import { Download } from 'lucide-react'

interface Subscriber {
  id:         string
  email:      string
  created_at: string
  is_active:  boolean
}

export default function ExportCsvButton({ subscribers }: { subscribers: Subscriber[] }) {
  const handleExport = () => {
    const header = 'email,joined,status'
    const rows = subscribers.map((s) =>
      `${s.email},${new Date(s.created_at).toISOString().slice(0, 10)},${s.is_active ? 'active' : 'inactive'}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      disabled={subscribers.length === 0}
      className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  )
}
