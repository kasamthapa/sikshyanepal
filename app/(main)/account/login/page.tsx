'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { safeNextPath } from '@/lib/safe-next'

type Mode = 'signin' | 'register'

export default function AccountAccessPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [nextPath, setNextPath] = useState('/')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setMode(params.get('mode') === 'register' ? 'register' : 'signin')
    setNextPath(safeNextPath(params.get('next')))
    if (params.has('error')) setError('Google sign-in could not be completed. Please try again.')
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setError('')
    setConfirmationSent(false)
    const params = new URLSearchParams()
    if (nextMode === 'register') params.set('mode', 'register')
    if (nextPath !== '/') params.set('next', nextPath)
    window.history.replaceState(null, '', `/account/login${params.size ? `?${params}` : ''}`)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy || cooldown > 0) return
    setBusy(true)
    setError('')
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = mode === 'register' ? form : { email: form.email, password: form.password }
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (data.retry_after) setCooldown(Number(data.retry_after))
        throw new Error(data.error || (mode === 'register' ? 'Account creation could not be completed.' : 'Sign in could not be completed.'))
      }
      if (data.confirmation_required) { setConfirmationSent(true); return }
      router.push(nextPath)
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const field = 'mt-1 w-full rounded-lg border border-[#d9d6cf] bg-white px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50'

  if (confirmationSent) return <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#f8f7f3] px-4 py-16"><section className="w-full max-w-md rounded-xl border border-[#e6e4df] bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600"/><h1 className="mt-5 font-display text-3xl font-bold text-ink">Check your email</h1><p className="mt-3 text-sm leading-6 text-slate-600">We sent a confirmation link to <strong>{form.email}</strong>. Open it to activate your account.</p><button type="button" onClick={() => switchMode('signin')} className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white">Return to sign in</button></section></main>

  return <main id="main-content" className="min-h-screen bg-[#f8f7f3] px-4 py-12 sm:py-16"><section className="mx-auto max-w-md rounded-xl border border-[#e6e4df] bg-white p-6 shadow-sm sm:p-8">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">SikshyaNepal account</p>
    <h1 className="mt-3 font-display text-3xl font-bold text-ink">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-600">{mode === 'signin' ? 'Access your saved institutions, admission plans and personal study path.' : 'Save your shortlist, build a private study plan and track applications in one place.'}</p>
    <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Account access">
      <button type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => switchMode('signin')} className={`min-h-11 rounded-lg px-3 text-sm font-bold ${mode === 'signin' ? 'bg-white text-primary shadow-sm' : 'text-slate-600'}`}>Sign in</button>
      <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')} className={`min-h-11 rounded-lg px-3 text-sm font-bold ${mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-slate-600'}`}>Create account</button>
    </div>
    <div className="mt-6"><GoogleSignInButton next={nextPath}/></div>
    <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-[#e6e4df]"/><span>or use email</span><span className="h-px flex-1 bg-[#e6e4df]"/></div>
    <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
      {mode === 'register' && <label className="block text-sm font-semibold text-ink">Your name<input required disabled={busy} value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} className={field} autoComplete="name"/></label>}
      <label className="block text-sm font-semibold text-ink">Email<input type="email" required disabled={busy} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className={field} autoComplete="email"/></label>
      <label className="block text-sm font-semibold text-ink">Password<input type="password" minLength={mode === 'register' ? 10 : undefined} required disabled={busy} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className={field} autoComplete={mode === 'register' ? 'new-password' : 'current-password'}/>{mode === 'register' && <span className="mt-1 block text-xs font-normal text-slate-500">Use at least 10 characters.</span>}</label>
      {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">{error}{cooldown > 0 && <span className="mt-1 block font-bold">Try again in {cooldown} seconds.</span>}</p>}
      <button disabled={busy || cooldown > 0} className="min-h-12 w-full rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">{busy ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') : cooldown > 0 ? `Wait ${cooldown}s` : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
    </form>
    <p className="mt-5 text-sm text-slate-600">{mode === 'signin' ? 'New here?' : 'Already have an account?'} <button type="button" onClick={() => switchMode(mode === 'signin' ? 'register' : 'signin')} className="font-bold text-primary hover:underline">{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></p>
    <p className="mt-4 border-t border-[#e6e4df] pt-4 text-xs leading-5 text-slate-500">Institution representatives use the same account, then claim or manage an approved institution profile.</p>
  </section></main>
}
