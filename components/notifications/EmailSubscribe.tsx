'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function EmailSubscribe() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()

      if (res.ok) {
        setState('success')
        setEmail('')
      } else {
        setErrorMsg(data.error || 'Something went wrong. Try again.')
        setState('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center justify-center gap-3 py-4 px-6 bg-emerald-50 rounded-2xl border border-emerald-200 max-w-md mx-auto">
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <p className="text-sm font-medium text-emerald-700">
          You&apos;ll be notified when results drop
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
            placeholder="your@email.com"
            className="w-full pl-9 pr-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-5 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 disabled:opacity-60 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
        >
          {state === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</>
          ) : (
            'Subscribe for result alerts'
          )}
        </button>
      </form>
      {state === 'error' && (
        <p className="mt-2 text-xs text-red-300 text-center">{errorMsg}</p>
      )}
      <p className="mt-2 text-xs text-blue-200 text-center">
        No spam. Unsubscribe any time.
      </p>
    </div>
  )
}
