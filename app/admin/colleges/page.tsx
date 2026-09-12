'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Archive, RotateCcw, Star, Building2, Search, ExternalLink } from 'lucide-react'
import ConfirmDialog, { ConfirmState, CONFIRM_CLOSED } from '@/components/ui/ConfirmDialog'
import { ToastList, useToast } from '@/components/ui/Toast'

interface College {
  id: string
  name: string
  slug: string
  location: string
  affiliation: string | null
  is_featured: boolean
  status: 'active' | 'pending_review' | 'inactive' | null
  created_at: string
}

export default function AdminCollegesPage() {
  const [colleges,  setColleges]  = useState<College[]>([])
  const [filtered,  setFiltered]  = useState<College[]>([])
  const [search,    setSearch]    = useState('')
  const [view,      setView]      = useState<'active' | 'archived'>('active')
  const [loading,   setLoading]   = useState(true)
  const [working,   setWorking]   = useState<string | null>(null)
  const [dialog,    setDialog]    = useState<ConfirmState>(CONFIRM_CLOSED)
  const { toasts, toast, dismiss } = useToast()

  useEffect(() => {
    fetch(`/api/admin/colleges?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setColleges(Array.isArray(data) ? data : [])
        setFiltered(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load colleges'); setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(colleges.filter((c) => {
      const inView = view === 'archived' ? c.status === 'inactive' : c.status === 'active' || c.status == null
      return inView && (c.name.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q))
    }))
  }, [search, colleges, view])

  const handleArchive = (id: string, name: string) => {
    setDialog({
      isOpen: true,
      title: 'Archive College',
      message: `Archive "${name}"? It will disappear from the public directory, but its programmes, evidence, reviews and history will be preserved.`,
      confirmLabel: 'Archive',
      variant: 'info',
      onConfirm: async () => {
        setDialog(CONFIRM_CLOSED)
        setWorking(id)
        try {
          const res = await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' })
          if (!res.ok) { const data = await res.json().catch(() => ({})); toast.error(data.error || 'Failed to archive college'); return }
          setColleges((prev) => prev.map((college) => college.id === id ? { ...college, status: 'inactive', is_featured: false } : college))
          toast.success(`"${name}" archived`)
        } catch {
          toast.error('Network error — college not archived')
        } finally {
          setWorking(null)
        }
      },
    })
  }

  const restoreCollege = async (college: College) => {
    setWorking(college.id)
    try {
      const res = await fetch(`/api/admin/colleges/${college.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) })
      if (!res.ok) { const data = await res.json().catch(() => ({})); toast.error(data.error || 'Failed to restore college'); return }
      setColleges(prev => prev.map(item => item.id === college.id ? { ...item, status: 'active' } : item))
      toast.success(`"${college.name}" restored`)
    } catch { toast.error('Network error — college not restored') }
    finally { setWorking(null) }
  }

  const toggleFeatured = async (college: College) => {
    setWorking(college.id)
    try {
      const res = await fetch(`/api/admin/colleges/${college.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !college.is_featured }),
      })
      if (!res.ok) { toast.error('Failed to update featured status'); return }
      setColleges((prev) =>
        prev.map((c) => c.id === college.id ? { ...c, is_featured: !c.is_featured } : c)
      )
      toast.success(college.is_featured ? 'Removed from featured' : 'Marked as featured')
    } catch {
      toast.error('Network error')
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="p-8 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" /> Colleges
          </h1>
          <p className="text-gray-400 text-sm mt-1">{colleges.filter(c => c.status === 'active' || c.status == null).length} active · {colleges.filter(c => c.status === 'inactive').length} archived</p>
        </div>
        <Link
          href="/admin/colleges/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add College
        </Link>
      </div>

      <div className="mb-4 flex gap-2" aria-label="College status view">
        {(['active', 'archived'] as const).map(option => <button key={option} onClick={() => setView(option)} aria-pressed={view === option} className={`min-h-11 rounded-lg px-4 text-sm font-semibold capitalize ${view === option ? 'bg-blue-600 text-white' : 'border border-gray-700 bg-gray-800 text-gray-300'}`}>{option}</button>)}
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
                      <a
                        href={`/colleges/${college.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {college.slug} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{college.location}</td>
                    <td className="px-5 py-3 text-gray-400 hidden lg:table-cell">{college.affiliation || '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(college)}
                        disabled={working === college.id}
                        title="Toggle featured"
                        className={`transition-colors disabled:opacity-50 ${
                          college.is_featured ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${college.is_featured ? 'fill-yellow-400' : ''}`} />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {view === 'active' && <Link
                          href={`/admin/colleges/${college.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>}
                        {view === 'active' ? <button
                          onClick={() => handleArchive(college.id, college.name)}
                          disabled={working === college.id}
                          title="Archive college"
                          className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button> : <button onClick={() => void restoreCollege(college)} disabled={working === college.id} title="Restore college" className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"><RotateCcw className="h-3.5 w-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        {...dialog}
        onCancel={() => setDialog(CONFIRM_CLOSED)}
      />
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
