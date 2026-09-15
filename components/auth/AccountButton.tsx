'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'

export default function AccountButton({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true
    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = await response.json().catch(() => ({}))
        if (active) setEmail(typeof data.email === 'string' ? data.email : null)
      } finally {
        if (active) setReady(true)
      }
    }
    void loadSession()
    window.addEventListener('auth-session-changed', loadSession)
    return () => { active = false; window.removeEventListener('auth-session-changed', loadSession) }
  }, [])

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Sign out failed.')
      setEmail(null)
      window.dispatchEvent(new Event('auth-session-changed'))
      onNavigate?.()
      window.location.assign('/')
    } catch {
      setSigningOut(false)
    }
  }

  if (!ready) return <span aria-hidden="true" className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg ${mobile ? 'w-full' : 'w-24'}`}/>
  if (!email) return <Link href="/account/login" onClick={onNavigate} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-white px-4 text-sm font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white ${mobile ? 'w-full' : ''}`}><UserRound className="h-4 w-4"/>Sign in</Link>
  if (mobile) return <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="truncate text-xs text-gray-500">Signed in as {email}</p><div className="mt-3 grid grid-cols-2 gap-2"><Link href="/my-path" onClick={onNavigate} className="min-h-11 rounded-lg bg-white px-3 py-2 text-center text-sm font-bold text-primary">My Path</Link><button type="button" onClick={signOut} disabled={signingOut} className="min-h-11 rounded-lg bg-white px-3 py-2 text-sm font-bold text-gray-700 disabled:opacity-60">{signingOut ? 'Logging out…' : 'Log out'}</button></div></div>
  return <button type="button" onClick={signOut} disabled={signingOut} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"><LogOut className="h-4 w-4" aria-hidden="true"/>{signingOut ? 'Logging out…' : 'Log out'}</button>
}
