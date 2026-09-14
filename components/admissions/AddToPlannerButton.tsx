'use client'

import Link from 'next/link'
import { CheckCircle2, ListPlus, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Props = {
  admissionId: string
}

export default function AddToPlannerButton({ admissionId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const autoAddAttempted = useRef(false)

  const addToPlanner = useCallback(async () => {
    if (state === 'saving' || state === 'saved') return
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('addToPlanner', '1')
      router.push(`/account/login?next=${encodeURIComponent(`${pathname}?${params.toString()}`)}`)
      return
    }

    setState('saving')
    setMessage('')
    try {
      const response = await fetch('/api/admission-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admission_id: admissionId, status: 'not_started', checklist: {}, notes: '' }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'This admission could not be added to your planner.')
      setState('saved')
      const params = new URLSearchParams(searchParams.toString())
      params.delete('addToPlanner')
      router.replace(`${pathname}${params.size ? `?${params.toString()}` : ''}`, { scroll: false })
    } catch (reason) {
      setState('error')
      setMessage(reason instanceof Error ? reason.message : 'This admission could not be added to your planner.')
    }
  }, [admissionId, pathname, router, searchParams, state])

  useEffect(() => {
    if (searchParams.get('addToPlanner') !== '1' || autoAddAttempted.current) return
    autoAddAttempted.current = true
    void addToPlanner()
  }, [addToPlanner, searchParams])

  if (state === 'saved') {
    return <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Added to your planner</p><Link href="/admissions/planner" className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-emerald-800 hover:underline">View admission planner</Link></div>
  }

  return <div className="mt-4"><button type="button" onClick={() => void addToPlanner()} disabled={state === 'saving'} aria-busy={state === 'saving'} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-600 disabled:cursor-wait disabled:opacity-60">{state === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ListPlus className="h-4 w-4" aria-hidden="true" />}{state === 'saving' ? 'Adding to planner…' : 'Add to admission planner'}</button>{state === 'error' && <p role="alert" className="mt-2 text-sm leading-5 text-red-700">{message}</p>}</div>
}
