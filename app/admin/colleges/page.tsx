'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Star, Building2, Search, ExternalLink } from 'lucide-react'

interface College {
  id: string
  name: string
  slug: string
  location: string
  affiliation: string | null
  is_featured: boolean
  created_at: string
}

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [filtered, setFiltered] = useState<College[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/colleges')
      .then((r) => r.json())
      .then((data) => {
        setColleges(data)
        setFiltered(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(colleges.filter((c) => c.name.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q)))
  }, [search, colleges])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' })
    setColleges((prev) => prev.filter((c) => c.id !== id))
    setDeleting(null)
  }

  const toggleFeatured = async (college: College) => {
    await fetch(`/api/admin/colleges/${college.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !college.is_featured }),
    })
    setColleges((prev) => prev.map((c) => c.id === college.id ? { ...c, is_featured: !c.is_featured } : c))
  }

  return (
    <div className="p-8 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" /> Colleges
          </h1>
          <p className="text-gray-400 text-sm mt-1">{colleges.length} total colleges</p>
        </div>
        <Link href="/admin/colleges/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add College
        </Link>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading colleges...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium hidden md:table-cell">Location</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium hidden lg:table-cell">Affiliation</th>
                <th className="text-center px-5 py-3 text-gray-400 font-medium">Featured</th>
                <th className="text-right px-5 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">No colleges found</td>
                </tr>
              ) : (
                filtered.map((college) => (
                  <tr key={college.id} className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-white">{college.name}</div>
                      <a href={`/colleges/${college.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
                        {college.slug} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{college.location}</td>
                    <td className="px-5 py-3 text-gray-400 hidden lg:table-cell">{college.affiliation || '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleFeatured(college)} title="Toggle featured"
                        className={`transition-colors ${college.is_featured ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}>
                        <Star className={`w-4 h-4 ${college.is_featured ? 'fill-yellow-400' : ''}`} />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/colleges/${college.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(college.id, college.name)}
                          disabled={deleting === college.id}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
