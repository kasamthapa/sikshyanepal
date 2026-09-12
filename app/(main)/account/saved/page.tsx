'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowRight, Bookmark, Calculator, CalendarCheck, CheckCircle2, Clock3, GitCompare, Loader2, MapPin, Trash2 } from 'lucide-react'
import { cleanCollegeText } from '@/lib/college-display'
import SavedSchools from '../saved-schools/page'

type Saved = {
  college_id: string
  saved_at: string
  program_count: number | null
  published_fee_count: number | null
  open_admission_count: number | null
  college: {
    id: string
    name: string
    slug: string
    location: string
    affiliation: string | null
    education_levels: string[] | null
    verification_status: string
    last_verified_at: string | null
  } | null
}

const levelLabel = (level: string) => level === 'plus_two' ? '+2' : level.charAt(0).toUpperCase() + level.slice(1)
const sourceState = (value:string|null) => {
  if (!value) return { label:'Check date missing', tone:'bg-amber-50 text-amber-800', current:false }
  const checked=new Date(value); if(Number.isNaN(checked.getTime())) return { label:'Check date missing', tone:'bg-amber-50 text-amber-800', current:false }
  const days=Math.max(0,Math.floor((Date.now()-checked.getTime())/86_400_000))
  return days<=180?{label:`Checked ${days===0?'today':`${days} days ago`}`,tone:'bg-emerald-50 text-emerald-700',current:true}:{label:'Recheck recommended',tone:'bg-amber-50 text-amber-800',current:false}
}

export default function SavedPage() {
  const [savedType, setSavedType] = useState<'colleges' | 'schools'>('colleges')
  const [items, setItems] = useState<Saved[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [needsLogin, setNeedsLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setSavedType(new URLSearchParams(window.location.search).get('type') === 'schools' ? 'schools' : 'colleges')
    const controller = new AbortController()
    fetch('/api/saved-colleges', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { setNeedsLogin(true); return [] }
        if (!response.ok) throw new Error('Your shortlist could not be loaded.')
        return response.json()
      })
      .then(data => { if (Array.isArray(data)) setItems(data.filter(item => item.college)) })
      .catch(fetchError => {
        if (fetchError instanceof Error && fetchError.name !== 'AbortError') setError(fetchError.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const compareUrl = useMemo(() => {
    const params = new URLSearchParams()
    selected.forEach((slug, index) => params.set(`college${index + 1}`, slug))
    return `/compare?${params.toString()}`
  }, [selected])
  const openAdmissionTotal = items.reduce((total, item) => total + (item.open_admission_count || 0), 0)
  const decisionReadyCount = items.filter(item => item.program_count != null && item.program_count > 0 && item.published_fee_count != null && item.published_fee_count > 0 && sourceState(item.college?.last_verified_at || null).current).length

  const toggleSelection = (slug: string) => {
    setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : current.length < 3 ? [...current, slug] : current)
  }

  const remove = async (item: Saved) => {
    setRemoving(item.college_id)
    setError('')
    try {
      const response = await fetch(`/api/saved-colleges/${item.college_id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('This college could not be removed. Please try again.')
      setItems(current => current.filter(saved => saved.college_id !== item.college_id))
      if (item.college) setSelected(current => current.filter(slug => slug !== item.college!.slug))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'This college could not be removed.')
    } finally {
      setRemoving(null)
    }
  }

  if (savedType === 'schools') return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12"><h1 className="font-display text-3xl font-extrabold text-ink">Saved institutions</h1><p className="mt-2 text-gray-500">Keep your college and school shortlists together.</p><nav aria-label="Saved institution type" className="mt-6 inline-flex rounded-xl border border-gray-200 bg-white p-1"><Link href="/account/saved" className="min-h-11 rounded-lg px-4 py-3 text-sm font-bold text-gray-600">Colleges</Link><Link href="/account/saved?type=schools" aria-current="page" className="min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">Schools</Link></nav><SavedSchools /></main>

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Saved institution type" className="mb-7 inline-flex rounded-xl border border-gray-200 bg-white p-1"><Link href="/account/saved" aria-current="page" className="min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">Colleges</Link><Link href="/account/saved?type=schools" className="min-h-11 rounded-lg px-4 py-3 text-sm font-bold text-gray-600">Schools</Link></nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-ink"><Bookmark className="h-7 w-7 text-blue-600" />Saved colleges</h1>
          <p className="mt-2 text-gray-500">Build a realistic shortlist, then compare programs, fees and admissions.</p>
        </div>
        {items.length >= 2 && (
          <Link href={selected.length >= 2 ? compareUrl : '#saved-list'} aria-disabled={selected.length < 2} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${selected.length >= 2 ? 'bg-primary text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-100 text-gray-400'}`}>
            <GitCompare className="h-4 w-4" />Compare selected ({selected.length}/3)
          </Link>
        )}
      </div>

      {error && <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}

      {!loading && !needsLogin && items.length > 0 && <section className="mt-7 grid gap-3 sm:grid-cols-4" aria-label="Shortlist progress"><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Shortlist</p><p className="mt-1 text-2xl font-bold text-ink">{items.length}</p><p className="text-xs text-slate-500">saved college{items.length===1?'':'s'}</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ready to compare</p><p className="mt-1 text-2xl font-bold text-ink">{selected.length}/2</p><p className="text-xs text-slate-500">select at least two</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Admissions open</p><p className="mt-1 text-2xl font-bold text-ink">{openAdmissionTotal}</p><p className="text-xs text-slate-500">current saved-college listings</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Decision ready</p><p className="mt-1 text-2xl font-bold text-ink">{decisionReadyCount}</p><p className="text-xs text-slate-500">program, fee and fresh check</p></div></section>}

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Loading your shortlist…</div>
      ) : needsLogin ? (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center"><p>Sign in to see and save your college shortlist.</p><Link href="/account/login?next=/account/saved" className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-white">Sign in</Link></div>
      ) : (
        <div id="saved-list" className="mt-8 space-y-3">
          {items.map(item => item.college && (
            <article key={item.college_id} className={`rounded-2xl border bg-white p-5 transition ${selected.includes(item.college.slug) ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <label className="mt-1 flex cursor-pointer items-center" title="Select for comparison">
                  <input type="checkbox" checked={selected.includes(item.college.slug)} disabled={!selected.includes(item.college.slug) && selected.length >= 3} onChange={() => toggleSelection(item.college!.slug)} className="h-4 w-4 accent-primary" />
                  <span className="sr-only">Compare {item.college.name}</span>
                </label>
                <div className="min-w-0 flex-1">
                  <Link href={`/colleges/${item.college.slug}`} className="font-display text-lg font-bold text-ink hover:text-primary">{item.college.name}</Link>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{cleanCollegeText(item.college.location) || 'Location not listed'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {cleanCollegeText(item.college.affiliation) && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{cleanCollegeText(item.college.affiliation)}</span>}
                    {(item.college.education_levels || []).map(level => <span key={level} className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">{levelLabel(level)}</span>)}
                    {item.open_admission_count != null && item.open_admission_count > 0 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">{item.open_admission_count} open admission{item.open_admission_count===1?'':'s'}</span>}
                    {item.program_count != null && <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">{item.program_count} recorded program{item.program_count===1?'':'s'}</span>}
                    {item.published_fee_count === 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">Fees not published</span>}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${sourceState(item.college.last_verified_at).tone}`}>{sourceState(item.college.last_verified_at).current?<CheckCircle2 className="h-3 w-3"/>:<Clock3 className="h-3 w-3"/>}{sourceState(item.college.last_verified_at).label}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row">
                  <Link href={`/colleges/${item.college.slug}`} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-primary hover:border-blue-300">View profile</Link>
                  <button type="button" onClick={() => void remove(item)} disabled={removing === item.college_id} aria-label={`Remove ${item.college.name} from saved colleges`} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4 sm:grid-cols-3"><button type="button" onClick={()=>toggleSelection(item.college!.slug)} className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700 hover:border-blue-300 hover:text-primary"><span className="flex items-center gap-2"><GitCompare className="h-4 w-4"/>{selected.includes(item.college.slug)?'Selected':'Select to compare'}</span><ArrowRight className="h-4 w-4"/></button><Link href="/tools/college-cost-calculator" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700 hover:border-blue-300 hover:text-primary"><span className="flex items-center gap-2"><Calculator className="h-4 w-4"/>Plan real cost</span><ArrowRight className="h-4 w-4"/></Link><Link href="/admissions/planner#application-checklist" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700 hover:border-blue-300 hover:text-primary"><span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4"/>Prepare documents</span><ArrowRight className="h-4 w-4"/></Link></div>
            </article>
          ))}
          {!items.length && <div className="rounded-2xl border bg-white p-10 text-center"><Bookmark className="mx-auto h-10 w-10 text-gray-200" /><h2 className="mt-3 font-display text-xl font-bold text-ink">Your shortlist is empty</h2><p className="mt-2 text-sm text-gray-500">Save colleges from their profile pages to compare realistic options here.</p><Link href="/colleges" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Explore colleges</Link></div>}
        </div>
      )}
      {items.length >= 2 && <p className="mt-4 text-xs text-gray-500">Select two or three colleges to compare them side by side.</p>}
    </main>
  )
}
