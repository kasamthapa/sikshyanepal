'use client'

import { useState, useEffect, FormEvent } from 'react'
import { X, Send, CheckCircle, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Program {
  name: string
}

interface Props {
  collegeName: string
  collegeId:   string
  isFeatured:  boolean
  programs:    Program[]
  onClose:     () => void
  onSuccess?:  () => void
}

export default function ApplyNowModal({
  collegeName, collegeId, isFeatured, programs, onClose, onSuccess,
}: Props) {
  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    email:   '',
    program: '',
    message: '',
    website: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [reference,setReference]=useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [consent, setConsent] = useState(false)

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim())    errs.name    = 'Full name is required'
    if (!form.phone.trim())   errs.phone   = 'Phone number is required'
    else if (!/^[9][6-9]\d{8}$|^\d{2}-\d{6,7}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid Nepali phone number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.program)        errs.program = 'Please select a program'
    if (!consent) errs.consent = 'Please confirm that we may use these details for this enquiry'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, consent, college_id: collegeId, college_name: collegeName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setReference(typeof data.reference==='string'?data.reference:'')
      setSuccess(true)
      onSuccess?.()  // notify parent to persist localStorage
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm text-ink placeholder-gray-400
     focus:outline-none focus:ring-2 focus:ring-[#1847c4]/20 focus:border-[#1847c4] transition-colors
     ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="admission-enquiry-title">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl
                      max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <h2 id="admission-enquiry-title" className="font-display font-bold text-ink text-lg leading-tight"
                style={{ letterSpacing: '-0.02em' }}>
              Ask {collegeName} about admission
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Send an enquiry through SikshyaNepal. This is not an official application or seat confirmation.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close admission enquiry"
            className="ml-3 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Commercial placement disclosure; verification and review scores remain independent. */}
          {isFeatured && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg mb-5 w-fit">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-amber-800">Sponsored placement</span>
            </div>
          )}

          {success ? (
            /* ── Success state ─────────────────────────────── */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-ink text-xl mb-2"
                  style={{ letterSpacing: '-0.02em' }}>
                Enquiry received
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-1">
                Your request for <span className="font-semibold text-ink">{collegeName}</span> has been recorded with the phone number{' '}
                <span className="font-semibold text-[#1847c4]">{form.phone}</span>.
              </p>
              <p className="mt-2 text-xs leading-5 text-gray-400">Response times vary. For an urgent deadline, use the official phone, email or website shown on the college profile.</p>
              {reference&&<p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">Enquiry reference: <strong className="text-ink">{reference}</strong></p>}
              <button
                onClick={onClose}
                className="mt-6 w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* ── Form ─────────────────────────────────────── */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="hidden" aria-hidden="true">
                <label htmlFor="admission-website">Leave this field empty</label>
                <input id="admission-website" name="website" type="text" value={form.website} onChange={event => set('website', event.target.value)} tabIndex={-1} autoComplete="off" />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="admission-name" className="block text-sm font-semibold text-ink mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="admission-name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ram Sharma"
                  className={inputClass('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'admission-name-error' : undefined}
                />
                {errors.name && <p id="admission-name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="admission-phone" className="block text-sm font-semibold text-ink mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="admission-phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="98XXXXXXXX"
                  className={inputClass('phone')}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'admission-phone-error' : 'admission-phone-help'}
                />
                <p id="admission-phone-help" className="text-xs text-gray-500 mt-1">Used only to respond to this admission enquiry</p>
                {errors.phone && <p id="admission-phone-error" className="text-xs text-red-600 mt-0.5">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="admission-email" className="block text-sm font-semibold text-ink mb-1.5">
                  Email Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="admission-email"
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="youremail@example.com"
                  className={inputClass('email')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'admission-email-error' : undefined}
                />
                {errors.email && <p id="admission-email-error" className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Program */}
              <div>
                <label htmlFor="admission-program" className="block text-sm font-semibold text-ink mb-1.5">
                  Program Interested In <span className="text-red-500">*</span>
                </label>
                <select
                  id="admission-program"
                  value={form.program}
                  onChange={e => set('program', e.target.value)}
                  className={inputClass('program')}
                  aria-invalid={Boolean(errors.program)}
                  aria-describedby={errors.program ? 'admission-program-error' : undefined}
                >
                  <option value="">Select a program…</option>
                  {programs.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
                {errors.program && <p id="admission-program-error" className="text-xs text-red-600 mt-1">{errors.program}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="admission-message" className="block text-sm font-semibold text-ink mb-1.5">
                  Your Message <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="admission-message"
                  value={form.message}
                  onChange={e => set('message', e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Any questions or specific requirements?"
                  className={inputClass('message') + ' resize-none'}
                />
                <p className="text-xs text-gray-400 mt-0.5 text-right">{form.message.length}/300</p>
              </div>

              {apiError && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {apiError}
                </div>
              )}

              <div>
                <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={event => { setConsent(event.target.checked); setErrors(current => ({ ...current, consent: '' })) }}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#1847c4]"
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? 'admission-consent-error' : undefined}
                  />
                  <span>I agree that SikshyaNepal may store these details and share them with {collegeName} only so the institution can respond to this enquiry. I have read the <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">Privacy Policy</Link>.</span>
                </label>
                {errors.consent && <p id="admission-consent-error" className="mt-1 text-xs text-red-600">{errors.consent}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1847c4]
                           text-white font-semibold rounded-xl hover:bg-[#1340b0]
                           disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send admission enquiry</>
                }
              </button>

              <p className="text-center text-xs text-gray-500">
                Do not include citizenship numbers, marksheets, passwords or payment details.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
