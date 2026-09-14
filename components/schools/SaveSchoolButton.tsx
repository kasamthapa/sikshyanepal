'use client'

import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SaveSchoolButton({ schoolId }: { schoolId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [requiresSignIn, setRequiresSignIn] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setRequiresSignIn(true); return null }
      return fetch(`/api/saved-schools/${schoolId}`, { cache: 'no-store', signal: controller.signal })
    })
      .then(async response => response?.ok ? response.json() : null)
      .then(data => data && setSaved(Boolean(data.saved)))
      .catch(reason => {
        if (reason instanceof Error && reason.name !== 'AbortError') setError('Could not check your shortlist.')
      })
      .finally(() => setChecking(false))
    return () => controller.abort()
  }, [schoolId])

  async function toggle() {
    if (loading || checking) return
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      setRequiresSignIn(true)
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    setLoading(true)
    setError('')
    const previous = saved
    setSaved(!previous)
    try {
      const response = await fetch(`/api/saved-schools/${schoolId}`, { method: previous ? 'DELETE' : 'POST' })
      if (response.status === 401) {
        setSaved(previous)
        router.push(`/account/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      if (!response.ok) throw new Error()
    } catch {
      setSaved(previous)
      setError('Could not update your shortlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <div><button type="button" onClick={toggle} disabled={loading || checking} aria-busy={loading || checking} aria-pressed={saved} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-60 ${saved?'border-blue-600 bg-blue-50 text-blue-700':'border-gray-200 bg-white text-gray-700'}`}><Bookmark aria-hidden="true" className={`h-4 w-4 ${saved?'fill-current':''}`}/>{checking?'Checking…':loading?'Updating…':saved?'Saved':requiresSignIn?'Sign in to save':'Save school'}</button>{error&&<p role="alert" className="mt-1 max-w-56 text-xs text-red-600">{error}</p>}</div>
}
