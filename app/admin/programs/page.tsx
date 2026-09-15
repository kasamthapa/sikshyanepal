'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ExternalLink, Plus, ShieldCheck } from 'lucide-react'
import type { Program } from '@/types'

export default function ProgramsAdmin() {
  const [items, setItems] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/programs')
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'Could not load programmes.')
        setItems(Array.isArray(body) ? body : [])
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load programmes.'))
      .finally(() => setLoading(false))
  }, [])

  const sourceBacked = useMemo(() => items.filter((item) => item.source_url && item.last_verified_at).length, [items])
  const needsReview = items.length - sourceBacked

  return (
    <div className="p-5 text-white sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-300">Catalogue quality</p>
          <h1 className="mt-1 text-2xl font-bold">Programmes</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-400">Review duration, level and faculty against an official university or regulator source before relying on a programme record.</p>
        </div>
        <Link href="/admin/programs/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"><Plus className="h-4 w-4" />Add programme</Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Programmes" value={items.length} />
        <Metric label="Source-backed" value={sourceBacked} tone="good" icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} />
        <Metric label="Source review needed" value={needsReview} tone="warn" icon={<AlertTriangle className="h-5 w-5 text-amber-300" />} />
      </div>

      {error && <p role="alert" className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
      {loading ? <p className="py-12 text-sm text-gray-400">Loading programme records…</p> : <div className="mt-6 overflow-x-auto rounded-xl border border-gray-700 bg-gray-800"><table className="min-w-[720px] w-full text-left text-sm"><thead className="border-b border-gray-700 bg-gray-900/50 text-xs uppercase tracking-wide text-gray-400"><tr><th className="px-5 py-3">Programme</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Level / field</th><th className="px-5 py-3">Evidence</th><th className="px-5 py-3"><span className="sr-only">Edit</span></th></tr></thead><tbody className="divide-y divide-gray-700">{items.map((item) => { const verified = Boolean(item.source_url && item.last_verified_at); return <tr key={item.id} className="align-top"><td className="px-5 py-4 font-semibold text-white">{item.name}</td><td className="px-5 py-4 text-gray-300">{item.duration}</td><td className="px-5 py-4"><p className="capitalize text-gray-300">{item.degree_level}</p><p className="mt-1 text-xs text-gray-500">{item.faculty}</p></td><td className="px-5 py-4">{verified ? <span className="inline-flex items-center gap-1.5 text-emerald-300"><ShieldCheck className="h-4 w-4" />Checked {new Date(item.last_verified_at!).toLocaleDateString('en-NP')}</span> : <span className="inline-flex items-center gap-1.5 text-amber-300"><AlertTriangle className="h-4 w-4" />Source required</span>}{item.source_url && <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-white">Open source <ExternalLink className="h-3.5 w-3.5" /></a>}</td><td className="px-5 py-4 text-right"><Link href={`/admin/programs/${item.id}/edit`} className="inline-flex min-h-10 items-center rounded-lg border border-gray-600 px-3 text-xs font-bold text-white hover:border-blue-400 hover:bg-gray-700">Review</Link></td></tr> })}{!items.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">No programmes have been added.</td></tr>}</tbody></table></div>}
    </div>
  )
}

function Metric({ label, value, tone = 'plain', icon }: { label: string; value: number; tone?: 'plain' | 'good' | 'warn'; icon?: ReactNode }) {
  const className = tone === 'good' ? 'border-emerald-900/70 bg-emerald-950/30' : tone === 'warn' ? 'border-amber-900/70 bg-amber-950/30' : 'border-gray-700 bg-gray-800'
  const labelClass = tone === 'good' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber-300' : 'text-gray-400'
  return <div className={`rounded-xl border p-4 ${className}`}><p className={`text-xs font-bold uppercase tracking-wide ${labelClass}`}>{label}</p><p className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">{icon}{value}</p></div>
}
