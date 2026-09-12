'use client'

import { useState, useEffect } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface ReviewFormProps {
  collegeId:   string
  collegeName: string
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
const LS_KEY      = (id: string) => `review_submitted_${id}`
const EXPIRY_MS   = 7 * 24 * 60 * 60 * 1000  // 7 days

export default function ReviewForm({ collegeId, collegeName }: ReviewFormProps) {
  const [form, setForm] = useState({
    student_name: '',
    program:      '',
    year:         '',
    rating:       0,
    review_text:  '',
    teaching_rating: 0,
    facilities_rating: 0,
    administration_rating: 0,
    value_rating: 0,
    placement_rating: 0,
    attendance_rating: 0,
    safety_rating: 0,
    internship_support_rating: 0,
    hidden_costs_reported: false,
    hostel_transport_note: '',
    evidence_url: '',
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [consent, setConsent] = useState(false)

  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user))) }, [])

  // Restore submitted state from localStorage (persists across refreshes)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(collegeId))
      if (raw) {
        const ts = parseInt(raw, 10)
        if (Date.now() - ts < EXPIRY_MS) {
          setSubmitted(true)
        } else {
          localStorage.removeItem(LS_KEY(collegeId))
        }
      }
    } catch {
      // localStorage not available (SSR guard)
    }
  }, [collegeId])

  const set = (field: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rating === 0)           { setError('Please select a rating'); return }
    if (!form.student_name.trim())   { setError('Please enter your name'); return }
    if (form.review_text.length < 20) { setError('Review must be at least 20 characters'); return }
    if (!consent) { setError('Confirm that this is your honest experience and does not identify private individuals.'); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
          ...form,
          college_id: collegeId,
        year: form.year ? parseInt(form.year, 10) : null,
        }),
      })

      if (res.ok) {
        // Persist submitted state so page refreshes don't show the form again
        try {
          localStorage.setItem(LS_KEY(collegeId), Date.now().toString())
        } catch {
          // ignore
        }
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit review')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (signedIn === false) return <div className="rounded-xl border border-blue-200 bg-blue-50 p-6"><h3 className="font-bold text-ink">Sign in to write a review</h3><p className="mt-2 text-sm leading-6 text-gray-600">Anyone can read reviews. Sign-in reduces fake submissions and permits safety follow-up; your account email is not displayed publicly.</p><Link href="/account/login" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white">Sign in to continue</Link></div>

  // ── Submitted state (shown across refreshes until 7-day expiry) ──────────
  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800 text-base mb-1">
              Review submitted!
            </h3>
            <p className="text-sm text-green-700 leading-relaxed mb-3">
              Your review of <strong>{collegeName}</strong> has been submitted. If not yet visible above, it may still be pending approval.
            </p>
            <p className="mt-1 text-xs text-green-700">To protect review integrity, one review per college is accepted from an account within 30 days.</p>
          </div>
        </div>
      </div>

    )
  }

  // ── Review form ───────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => set('rating', star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || form.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            </button>
          ))}
          {(hoverRating || form.rating) > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-600">
              {STAR_LABELS[hoverRating || form.rating]}
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Rate specific areas <span className="font-normal text-gray-400">(optional)</span></p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['teaching_rating', 'Teaching'], ['facilities_rating', 'Facilities'], ['administration_rating', 'Administration'], ['value_rating', 'Value for money'], ['placement_rating', 'Career / placement support'],
          ].map(([field, label]) => <div key={field} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><span className="text-xs font-medium text-gray-600">{label}</span><div className="flex">{[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => set(field, star)} aria-label={`${label}: ${star} stars`}><Star className={`h-4 w-4 ${star <= (form[field as keyof typeof form] as number) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} /></button>)}</div></div>)}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-700">Student reality <span className="font-normal text-gray-400">(optional, reviewed before publishing)</span></p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">{[
          ['attendance_rating', 'Attendance support'], ['safety_rating', 'Campus safety'], ['internship_support_rating', 'Internship support'],
        ].map(([field, label]) => <label key={field} className="text-xs font-medium text-gray-600">{label}<select value={form[field as keyof typeof form] as number} onChange={(event) => set(field, Number(event.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"><option value="0">Not sure</option>{[1,2,3,4,5].map(value => <option key={value} value={value}>{value}/5</option>)}</select></label>)}</div>
        <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-gray-600"><input type="checkbox" checked={form.hidden_costs_reported} onChange={(event) => set('hidden_costs_reported', event.target.checked)} className="mt-1"/>I experienced costs that were not clear before joining.</label>
        <textarea value={form.hostel_transport_note} onChange={(event) => set('hostel_transport_note', event.target.value)} rows={2} maxLength={300} placeholder="Optional: share a practical hostel, transport or accessibility note. Do not name private individuals." className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Optional student-status evidence URL</label>
        <input type="url" value={form.evidence_url} onChange={(e) => set('evidence_url', e.target.value)} placeholder="A private drive link, student portal image, or official record" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <p className="mt-1 text-xs leading-5 text-gray-400">Only moderators can view this. It is never displayed on your public review. Do not include passwords, citizenship numbers, or other sensitive information.</p>
      </div>

      {/* Name + Program */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Public display name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.student_name}
            onChange={(e) => set('student_name', e.target.value)}
            minLength={3}
            maxLength={60}
            placeholder="e.g. BCA Student 2025"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Program Studied
          </label>
          <input
            type="text"
            value={form.program}
            onChange={(e) => set('program', e.target.value)}
            maxLength={100}
            placeholder="e.g. BCA, BBA, +2 Science"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Year of Study / Batch
        </label>
        <input
          type="number"
          value={form.year}
          onChange={(e) => set('year', e.target.value)}
          placeholder="e.g. 2081, 2023"
          min="1990"
          max="2100"
          className="w-full sm:w-40 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">Use either AD (for example 2025) or BS (for example 2082).</p>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.review_text}
          onChange={(e) => set('review_text', e.target.value)}
          rows={5}
          minLength={20}
          maxLength={3000}
          placeholder="Share your experience — teaching quality, facilities, campus life, hostel, canteen, value for money..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className={`text-xs mt-1 ${form.review_text.length < 20 ? 'text-gray-400' : 'text-green-600'}`}>
          {form.review_text.length} characters
          {form.review_text.length < 20 && ' (minimum 20)'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <label className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" required/><span>I confirm this is my honest experience, I have not been paid to manipulate the rating, and I have not included private information or unsupported accusations. I accept the <Link href="/terms" className="font-bold text-primary underline">terms</Link> and <Link href="/privacy" className="font-bold text-primary underline">privacy policy</Link>.</span></label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || signedIn !== true}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
        <p className="text-xs text-gray-400">Reviews appear after admin approval</p>
      </div>
    </form>
  )
}
