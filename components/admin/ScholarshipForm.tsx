'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'

interface ScholarshipFormData { title: string; description: string; amount: string; college_id: string; deadline: string; eligibility: string; application_url: string }
const EMPTY: ScholarshipFormData = { title: '', description: '', amount: '', college_id: '', deadline: '', eligibility: '', application_url: '' }

interface Props { initialData?: Partial<ScholarshipFormData>; scholarshipId?: string; isEdit?: boolean }

export default function ScholarshipForm({ initialData, scholarshipId, isEdit = false }: Props) {
  const [form, setForm] = useState<ScholarshipFormData>({ ...EMPTY, ...initialData })
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/colleges').then(r => r.json()).then(d => setColleges(d.slice(0, 100))).catch(() => {})
  }, [])

  const set = (field: keyof ScholarshipFormData, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, amount: form.amount ? parseFloat(form.amount) : null, college_id: form.college_id || null }
    const res = await fetch(isEdit ? `/api/admin/scholarships/${scholarshipId}` : '/api/admin/scholarships', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) { router.push('/admin/scholarships'); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Failed'); setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 text-gray-100 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <button type="button" onClick={() => router.back()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Scholarship' : 'Add Scholarship'}</h1>
      </div>
      {error && <div className="mb-5 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4">
        {[
          { label: 'Title *', field: 'title', placeholder: 'e.g. Merit Scholarship 2081' },
          { label: 'Eligibility', field: 'eligibility', placeholder: 'e.g. GPA 3.5+ in previous year' },
          { label: 'Application URL', field: 'application_url', placeholder: 'https://...' },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
            <input type="text" value={form[field as keyof ScholarshipFormData] as string}
              onChange={e => set(field as keyof ScholarshipFormData, e.target.value)}
              placeholder={placeholder} required={label.includes('*')}
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">College (optional)</label>
            <select value={form.college_id} onChange={e => set('college_id', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">General (no college)</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount (NPR)</label>
            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Application Deadline</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Scholarship'}
        </button>
        <button type="button" onClick={() => router.push('/admin/scholarships')} className="px-4 py-2.5 text-gray-400 hover:text-white text-sm">Cancel</button>
      </div>
    </form>
  )
}
