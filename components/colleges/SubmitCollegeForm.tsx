'use client'

import { useState, FormEvent } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

const AFFILIATIONS = ['NEB', 'TU', 'KU', 'PU', 'PurU', 'Private / Independent']
const ROLES        = ['College Staff', 'Student', 'Alumni', 'Other']
const PROGRAMS     = [
  // +2 first — most common for newly submitted schools
  '+2 Science', '+2 Management', '+2 Humanities', '+2 Education',
  // Bachelor programs
  'BCA', 'BBA', 'MBBS', 'BSc CSIT', 'BIM', 'BHM',
  'MBA', 'BBS', 'BE', 'BPharm', 'BNurs', 'Other',
]

interface FormState {
  name: string
  affiliation: string
  location: string
  address: string
  phone: string
  email: string
  website: string
  programs: string[]
  description: string
  submitter_name: string
  submitter_role: string
  submitter_contact: string
}

const INITIAL: FormState = {
  name: '', affiliation: '', location: '', address: '',
  phone: '', email: '', website: '', programs: [],
  description: '', submitter_name: '', submitter_role: '',
  submitter_contact: '',
}

export default function SubmitCollegeForm() {
  const [form,    setForm]    = useState<FormState>(INITIAL)
  const [errors,  setErrors]  = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiErr,  setApiErr]  = useState<string | null>(null)

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function toggleProgram(p: string) {
    setForm((f) => ({
      ...f,
      programs: f.programs.includes(p)
        ? f.programs.filter((x) => x !== p)
        : [...f.programs, p],
    }))
  }

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!form.name.trim())             errs.name             = 'College name is required'
    if (!form.affiliation)             errs.affiliation      = 'Please select an affiliation'
    if (!form.location.trim())         errs.location         = 'Location is required'
    if (!form.programs.length)         errs.programs         = 'Select at least one program'
    if (!form.submitter_name.trim())   errs.submitter_name   = 'Your name is required'
    if (!form.submitter_role)          errs.submitter_role   = 'Please select your role'
    if (!form.submitter_contact.trim()) errs.submitter_contact = 'Contact info is required'
    if (form.website && !/^https?:\/\/.+/.test(form.website))
      errs.website = 'Must start with http:// or https://'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiErr(null)
    try {
      const res = await fetch('/api/submit-college', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSuccess(true)
      setForm(INITIAL)
    } catch (err: unknown) {
      setApiErr(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="font-display font-bold text-ink text-xl mb-2" style={{ letterSpacing: '-0.02em' }}>
          Submission received!
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Thank you. Your submission is in the manual review queue. We will contact you if evidence or clarification is needed.
          We&apos;ll verify the details and publish the college on SikshyaNepal.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm font-semibold text-[#1847c4] hover:underline"
        >
          Submit another college
        </button>
      </div>
    )
  }

  const fieldClass = (err?: string) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm text-ink placeholder-gray-400
     focus:outline-none focus:ring-2 focus:ring-[#1847c4]/20 focus:border-[#1847c4] transition-colors
     ${err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`

  const labelClass = 'block text-sm font-semibold text-ink mb-1.5'
  const errClass   = 'text-xs text-red-500 mt-1'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* ── Section 1: College Info ─────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h2 className="font-display font-bold text-ink text-lg mb-6" style={{ letterSpacing: '-0.02em' }}>
          College Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* College Name */}
          <div className="sm:col-span-2">
            <label className={labelClass}>College Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Deerwalk Institute of Technology"
              className={fieldClass(errors.name)}
            />
            {errors.name && <p className={errClass}>{errors.name}</p>}
          </div>

          {/* Affiliation */}
          <div>
            <label className={labelClass}>University Affiliation <span className="text-red-500">*</span></label>
            <select
              value={form.affiliation}
              onChange={(e) => set('affiliation', e.target.value)}
              className={fieldClass(errors.affiliation)}
            >
              <option value="">Select affiliation…</option>
              {AFFILIATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {errors.affiliation && <p className={errClass}>{errors.affiliation}</p>}
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location / City <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Kathmandu"
              className={fieldClass(errors.location)}
            />
            {errors.location && <p className={errClass}>{errors.location}</p>}
          </div>

          {/* Full Address */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Full Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="e.g. Sifal, Kathmandu-09"
              className={fieldClass()}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="e.g. 01-4523456"
              className={fieldClass()}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>College Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="e.g. info@college.edu.np"
              className={fieldClass()}
            />
          </div>

          {/* Website */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Official Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://www.yourcollege.edu.np"
              className={fieldClass(errors.website)}
            />
            {errors.website && <p className={errClass}>{errors.website}</p>}
          </div>
        </div>
      </div>

      {/* ── Section 2: Programs ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h2 className="font-display font-bold text-ink text-lg mb-2" style={{ letterSpacing: '-0.02em' }}>
          Programs Offered <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-400 mb-5">Select all that apply</p>

        <div className="flex flex-wrap gap-2.5">
          {PROGRAMS.map((prog) => {
            const active = form.programs.includes(prog)
            return (
              <button
                key={prog}
                type="button"
                onClick={() => toggleProgram(prog)}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#1847c4] border-[#1847c4] text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#1847c4] hover:text-[#1847c4]'
                }`}
              >
                {prog}
              </button>
            )
          })}
        </div>
        {errors.programs && <p className={errClass + ' mt-2'}>{errors.programs}</p>}
      </div>

      {/* ── Section 3: Description ──────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h2 className="font-display font-bold text-ink text-lg mb-6" style={{ letterSpacing: '-0.02em' }}>
          Brief Description
        </h2>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value.slice(0, 500))}
          placeholder="Brief description — programs offered, facilities, hostel availability, notable achievements, entrance requirements..."
          rows={4}
          className={fieldClass() + ' resize-none'}
        />
        <p className="text-xs text-gray-400 mt-1.5 text-right">{form.description.length}/500</p>
      </div>

      {/* ── Section 4: Submitter Info ───────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h2 className="font-display font-bold text-ink text-lg mb-2" style={{ letterSpacing: '-0.02em' }}>
          About You
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          We keep this private — it&apos;s only used to follow up if we need more details.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <div>
            <label className={labelClass}>Your Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.submitter_name}
              onChange={(e) => set('submitter_name', e.target.value)}
              placeholder="Your full name"
              className={fieldClass(errors.submitter_name)}
            />
            {errors.submitter_name && <p className={errClass}>{errors.submitter_name}</p>}
          </div>

          <div>
            <label className={labelClass}>Your Role <span className="text-red-500">*</span></label>
            <select
              value={form.submitter_role}
              onChange={(e) => set('submitter_role', e.target.value)}
              className={fieldClass(errors.submitter_role)}
            >
              <option value="">Select role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.submitter_role && <p className={errClass}>{errors.submitter_role}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Your Email or Phone <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.submitter_contact}
              onChange={(e) => set('submitter_contact', e.target.value)}
              placeholder="email@example.com or 98XXXXXXXX"
              className={fieldClass(errors.submitter_contact)}
            />
            {errors.submitter_contact && <p className={errClass}>{errors.submitter_contact}</p>}
          </div>
        </div>
      </div>

      {/* ── Submit ──────────────────────────────────── */}
      {apiErr && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {apiErr}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5
                   bg-[#1847c4] text-white text-sm font-semibold rounded-xl
                   hover:bg-[#1340b0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Submitting…' : 'Submit College'}
      </button>
    </form>
  )
}
