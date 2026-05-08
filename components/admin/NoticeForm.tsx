'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface NoticeFormData { title: string; slug: string; content: string; university_id: string; notice_url: string; published_date: string }
const EMPTY: NoticeFormData = { title: '', slug: '', content: '', university_id: '', notice_url: '', published_date: new Date().toISOString().split('T')[0] }

interface Props { initialData?: Partial<NoticeFormData>; noticeId?: string; isEdit?: boolean }

export default function NoticeForm({ initialData, noticeId, isEdit = false }: Props) {
  const [form, setForm] = useState<NoticeFormData>({ ...EMPTY, ...initialData })
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/colleges').then(() => {})
    // Fetch universities from supabase directly via public API
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/universities?select=id,name&order=name`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
      },
    }).then(r => r.json()).then(setUniversities).catch(() => {})
  }, [])

  const set = (field: keyof NoticeFormData, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !isEdit) next.slug = slugify(value)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(isEdit ? `/api/admin/notices/${noticeId}` : '/api/admin/notices', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { router.push('/admin/notices'); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Failed'); setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 text-gray-100 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <button type="button" onClick={() => router.back()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Notice' : 'Add Notice'}</h1>
      </div>
      {error && <div className="mb-5 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">University *</label>
            <select value={form.university_id} onChange={e => set('university_id', e.target.value)} required
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">Select university</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Publish Date</label>
            <input type="date" value={form.published_date} onChange={e => set('published_date', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Content</label>
          <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={6}
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Official Notice URL</label>
          <input type="url" value={form.notice_url} onChange={e => set('notice_url', e.target.value)}
            placeholder="https://tu.edu.np/notice/..."
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Update Notice' : 'Publish Notice'}
        </button>
        <button type="button" onClick={() => router.push('/admin/notices')} className="px-4 py-2.5 text-gray-400 hover:text-white text-sm">Cancel</button>
      </div>
    </form>
  )
}
