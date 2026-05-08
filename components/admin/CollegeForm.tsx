'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { Save, ArrowLeft } from 'lucide-react'

interface CollegeFormData {
  name: string
  slug: string
  description: string
  location: string
  address: string
  phone: string
  email: string
  website: string
  affiliation: string
  established_year: string
  logo_url: string
  cover_url: string
  is_featured: boolean
}

const EMPTY: CollegeFormData = {
  name: '', slug: '', description: '', location: '', address: '',
  phone: '', email: '', website: '', affiliation: '', established_year: '',
  logo_url: '', cover_url: '', is_featured: false,
}

interface Props {
  initialData?: Partial<CollegeFormData>
  collegeId?: string
  isEdit?: boolean
}

const AFFILIATIONS = [
  'Tribhuvan University', 'Kathmandu University', 'Pokhara University',
  'Purbanchal University', 'Rajarshi Janak University', 'Mid-Western University', 'Far-Western University',
]

export default function CollegeForm({ initialData, collegeId, isEdit = false }: Props) {
  const [form, setForm] = useState<CollegeFormData>({ ...EMPTY, ...initialData })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (field: keyof CollegeFormData, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !isEdit) next.slug = slugify(value as string)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      established_year: form.established_year ? parseInt(form.established_year) : null,
    }

    const url = isEdit ? `/api/admin/colleges/${collegeId}` : '/api/admin/colleges'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/colleges')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save college')
      setSaving(false)
    }
  }

  const Field = ({ label, field, type = 'text', placeholder = '' }: {
    label: string; field: keyof CollegeFormData; type?: string; placeholder?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="p-8 text-gray-100 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <button type="button" onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit College' : 'Add New College'}</h1>
          <p className="text-gray-400 text-sm">Fill in the college information below</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="College Name *" field="name" placeholder="e.g. Tribhuvan University Institute of Science and Technology" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="auto-generated from name"
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
            <Field label="Established Year" field="established_year" type="number" placeholder="e.g. 1990" />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Affiliation</label>
              <select
                value={form.affiliation}
                onChange={(e) => set('affiliation', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select affiliation</option>
                {AFFILIATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder="Brief description of the college..."
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="font-semibold text-white mb-4">Location & Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="City / District *" field="location" placeholder="e.g. Kathmandu" />
            <Field label="Full Address" field="address" placeholder="e.g. Kirtipur, Kathmandu" />
            <Field label="Phone" field="phone" placeholder="+977-01-XXXXXXX" />
            <Field label="Email" field="email" type="email" placeholder="info@college.edu.np" />
            <div className="md:col-span-2">
              <Field label="Website URL" field="website" placeholder="https://www.college.edu.np" />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="font-semibold text-white mb-4">Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Logo URL" field="logo_url" placeholder="https://..." />
            <Field label="Cover Image URL" field="cover_url" placeholder="https://..." />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="font-semibold text-white mb-4">Settings</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set('is_featured', e.target.checked)}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-blue-600' : 'bg-gray-600'}`} />
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_featured ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-300">Feature this college on homepage</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Update College' : 'Add College'}
        </button>
        <button type="button" onClick={() => router.push('/admin/colleges')}
          className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}
