'use client'

import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function SaveCollegeButton({ collegeId }: { collegeId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/saved-colleges/${collegeId}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
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
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/saved-colleges/${collegeId}`, { method: saved ? 'DELETE' : 'POST' })
      if (response.status === 401) {
        router.push(`/account/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not update shortlist.')
      setSaved(Boolean(data.saved))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update shortlist.')
    } finally {
      setLoading(false)
    }
  }

  return <div><button type="button" onClick={toggle} disabled={loading || checking} aria-pressed={saved} aria-describedby={error ? `save-college-error-${collegeId}` : undefined} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${saved ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'}`}><Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />{checking ? 'Checking…' : loading ? 'Updating…' : saved ? 'Saved' : 'Save college'}</button>{error && <p id={`save-college-error-${collegeId}`} role="alert" className="mt-1 max-w-xs text-xs text-red-600">{error}</p>}</div>
}
