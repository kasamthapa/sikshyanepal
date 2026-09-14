'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AccountButton({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { void supabase.auth.getUser().then(({ data }) => { setEmail(data.user?.email || null); setReady(true) }); const { data } = supabase.auth.onAuthStateChange((_event, session) => { setEmail(session?.user.email || null); setReady(true) }); return () => data.subscription.unsubscribe() }, [])
  useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close) }, [])
  async function signOut() { await supabase.auth.signOut(); setOpen(false); onNavigate?.(); window.location.assign('/') }
  if (!ready) return <Link href="/account/login" onClick={onNavigate} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-ink transition hover:border-primary hover:bg-primary-50 hover:text-primary ${mobile ? 'w-full' : ''}`}><UserRound className="h-4 w-4"/>Sign in</Link>
  if (!email) return <Link href="/account/login" onClick={onNavigate} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-white px-4 text-sm font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white ${mobile ? 'w-full' : ''}`}><UserRound className="h-4 w-4"/>Sign in</Link>
  if (mobile) return <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="truncate text-xs text-gray-500">Signed in as {email}</p><div className="mt-3 grid grid-cols-2 gap-2"><Link href="/my-path" onClick={onNavigate} className="min-h-11 rounded-lg bg-white px-3 py-2 text-center text-sm font-bold text-primary">My account</Link><button onClick={signOut} className="min-h-11 rounded-lg bg-white px-3 py-2 text-sm font-bold text-gray-600">Sign out</button></div></div>
  return <div ref={root} className="relative"><button onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label="Open account menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-primary hover:border-blue-300"><UserRound className="h-5 w-5"/></button>{open && <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-card-lg"><p className="truncate border-b border-gray-100 px-3 py-2 text-xs text-gray-500">{email}</p><Link href="/my-path" onClick={() => setOpen(false)} className="mt-1 block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-ink hover:bg-gray-50">My Path dashboard</Link><Link href="/account/saved" onClick={() => setOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-ink hover:bg-gray-50">Saved colleges</Link><Link href="/community/my-content" onClick={() => setOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold text-ink hover:bg-gray-50">My community activity</Link><button onClick={signOut} className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4"/>Sign out</button></div>}</div>
}
