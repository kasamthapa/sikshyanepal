'use client'

import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SaveCollegeButton({ collegeId }: { collegeId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setChecking(false); return null }
      return fetch(`/api/saved-colleges/${collegeId}`, { cache: 'no-store', signal: controller.signal })
    })
      .then(async response => {
        if (!response) return { saved: false }
        if (response.status === 401) return { saved: false }
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Your shortlist status could not be checked.')
        return data
      })
      .then(data => setSaved(Boolean(data.saved)))
      .catch(fetchError => {
        if (fetchError instanceof Error && fetchError.name !== 'AbortError') setError(fetchError.message)
      })
      .finally(() => setChecking(false))
    return () => controller.abort()
  }, [collegeId])

  async function toggle() {
    if (loading) return
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    const previous = saved
    const next = !saved
    setSaved(next)
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/saved-colleges/${collegeId}`, { method: next ? 'POST' : 'DELETE' })
      if (response.status === 401) {
        setSaved(previous)
        router.push(`/account/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not update shortlist.')
      setSaved(Boolean(data.saved))
    } catch (updateError) {
      setSaved(previous)
      setError(updateError instanceof Error ? updateError.message : 'Could not update shortlist.')
    } finally {
      setLoading(false)
    }
  }

  return <div><button type="button" onClick={toggle} disabled={loading} aria-busy={loading} aria-pressed={saved} aria-describedby={error ? `save-college-error-${collegeId}` : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-75 ${saved ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}><Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />{loading ? (saved ? 'Saving…' : 'Removing…') : saved ? 'Saved' : 'Save college'}<span className="sr-only">{checking ? ' Shortlist status is being checked.' : ''}</span></button>{error && <p id={`save-college-error-${collegeId}`} role="alert" className="mt-1 max-w-xs text-xs text-red-600">{error}</p>}</div>
}
