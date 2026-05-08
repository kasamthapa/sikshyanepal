'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Award } from 'lucide-react'

interface ScholarshipItem { id: string; title: string; amount: number | null; college?: { name: string } | null; deadline: string | null }

export default function AdminScholarshipsPage() {
  const [items, setItems] = useState<ScholarshipItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/scholarships').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="p-8 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Award className="w-6 h-6 text-green-400" /> Scholarships</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} scholarships</p>
        </div>
        <Link href="/admin/scholarships/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Scholarship
        </Link>
      </div>
      {loading ? <div className="text-center py-16 text-gray-500">Loading...</div> : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Title</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium hidden md:table-cell">College</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium hidden md:table-cell">Amount</th>
                <th className="text-right px-5 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">No scholarships. <Link href="/admin/scholarships/new" className="text-blue-400 hover:underline">Add one</Link></td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="border-b border-gray-700/50">
                  <td className="px-5 py-3"><div className="font-medium text-white">{item.title}</div></td>
                  <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{item.college?.name || 'General'}</td>
                  <td className="px-5 py-3 text-green-400 font-medium hidden md:table-cell">{item.amount ? `NPR ${item.amount.toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/scholarships/${item.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => handleDelete(item.id, item.title)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
