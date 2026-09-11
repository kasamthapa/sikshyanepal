import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Award, Calendar, CheckCircle2, ExternalLink, Search, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Scholarship } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Scholarship Finder Nepal – Check Funding Options', description: 'Match scholarships in Nepal by study level, funding type and student eligibility, with official sources and verified deadlines.' }
const LEVELS = ['+2', 'Bachelor', 'Master', 'Diploma'] as const
const GROUPS: Record<string, string> = { merit: 'Merit-based', need_based: 'Financial need', female: 'Female students', disability: 'Students with disabilities', dalit: 'Dalit students', janajati: 'Janajati students', remote_area: 'Remote-area students' }
const cleanSearch = (value?: string) => (value || '').replace(/[,().%]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
const validUrl = (value?: string | null) => { if (!value) return null; try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null } catch { return null } }
const displayDate = (value: string) => new Intl.DateTimeFormat('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
const deadlineLabel = (value: string | null) => {
  if (!value || !Number.isFinite(new Date(value).getTime())) return { text: 'Deadline not announced', tone: 'text-slate-600', open: true }
  const deadline = new Date(value); const today = new Date(); deadline.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0)
  const days = Math.round((deadline.getTime() - today.getTime()) / 86400000)
  if (days < 0) return { text: `Closed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`, tone: 'text-slate-500', open: false }
  if (days === 0) return { text: 'Closes today', tone: 'text-red-700', open: true }
  if (days === 1) return { text: 'Closes tomorrow', tone: 'text-red-700', open: true }
  return { text: `${days} days left`, tone: days <= 7 ? 'text-red-700' : 'text-orange-700', open: true }
}
const freshness = (value?: string | null) => {
  if (!value || !Number.isFinite(new Date(value).getTime())) return { text: 'Not recently rechecked', fresh: false }
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000))
  return { text: days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `Checked ${days} days ago`, fresh: days <= 30 }
}
type Params = { q?: string; level?: string; group?: string; status?: string; open?: string }

export default async function ScholarshipsPage({ searchParams }: { searchParams: Params }) {
  const db = createServerSupabaseClient()
  const q = cleanSearch(searchParams.q)
  const level = LEVELS.includes(searchParams.level as typeof LEVELS[number]) ? searchParams.level! : ''
  const group = searchParams.group && GROUPS[searchParams.group] ? searchParams.group : ''
  const status = searchParams.status === 'all' || searchParams.open === 'false' ? 'all' : 'open'
  let query = db.from('scholarships').select('*, college:colleges(name,slug,location)').eq('is_active', true).order('deadline', { ascending: true, nullsFirst: false }).limit(100)
  if (q) query = query.or(`title.ilike.%${q}%,provider_name.ilike.%${q}%,eligibility.ilike.%${q}%`)
  if (level) query = query.contains('education_levels', [level])
  if (group) query = query.contains('target_groups', [group])
  if (status === 'open') query = query.or(`deadline.gte.${new Date().toISOString()},deadline.is.null`)
  let { data, error } = await query
  let schemaLimited = false
  if (error?.code === '42703') {
    schemaLimited = true
    let fallback = db.from('scholarships').select('*, college:colleges(name,slug,location)').eq('is_active', true).order('deadline', { ascending: true, nullsFirst: false }).limit(100)
    if (q) fallback = fallback.ilike('title', `%${q}%`)
    if (status === 'open') fallback = fallback.or(`deadline.gte.${new Date().toISOString()},deadline.is.null`)
    const fallbackResult = await fallback
    data = fallbackResult.data
    error = fallbackResult.error
  }
  if (error) console.error('[scholarships:list]', { code: error.code, message: error.message })
  const items = ((schemaLimited && (level || group)) ? [] : (data || [])) as Scholarship[]
  const hasFilters = Boolean(q || level || group || status === 'all')

  return <main className="min-h-screen bg-[#f8f7f3]"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">Funding that fits you</p><h1 className="mt-2 font-display text-4xl font-bold text-ink">Scholarship finder</h1><p className="mt-3 leading-7 text-slate-600">Filter by your study level and situation. A match means “worth checking”—only the official provider can confirm eligibility and selection.</p></div>
    <form className="mt-7 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4" role="search"><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Keyword or provider</span><span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400"/><input name="q" defaultValue={q} maxLength={80} placeholder="Search scholarships" className="w-full rounded-lg border border-gray-200 py-3 pl-9 pr-3 text-sm"/></span></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Study level</span><select name="level" defaultValue={level} className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="">Any study level</option>{LEVELS.map(x=><option key={x}>{x}</option>)}</select></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Eligibility</span><select name="group" defaultValue={group} className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="">Any eligibility group</option>{Object.entries(GROUPS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Deadline</span><select name="status" defaultValue={status} className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="open">Open or date pending</option><option value="all">Include closed</option></select></label><div className="flex flex-wrap items-center gap-3 md:col-span-4"><button className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-700">Show my matches</button>{hasFilters&&<Link href="/scholarships" className="px-2 py-3 text-sm font-bold text-primary">Clear filters</Link>}<Link href="/my-path" className="ml-auto text-sm font-bold text-slate-600 hover:text-primary">Use with My Path →</Link></div></form>
    {error&&<div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="font-bold">Scholarships could not be loaded</p><p className="mt-1">Your filters are safe. Refresh the page or try again shortly.</p></div></div>}
    {!error&&schemaLimited&&<div role="status" className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="font-bold">Scholarship matching needs its database update</p><p className="mt-1">Basic scholarship listings still work. Apply <code>20260927_scholarship_matcher.sql</code> in this Supabase project to enable study-level and eligibility matching.</p></div></div>}
    {!error&&<><div className="mt-8"><h2 className="text-xl font-bold text-ink">{hasFilters?'Matching opportunities':'Current opportunities'}</h2><p className="mt-1 text-sm text-slate-500">{items.length} source-backed result{items.length===1?'':'s'}{status==='open'?' with an open or pending deadline':''}</p></div>
    {items.length?<div className="mt-4 grid gap-5 md:grid-cols-2">{items.map(s=>{const deadline=deadlineLabel(s.deadline);const checked=freshness(s.last_verified_at);const applicationUrl=validUrl(s.application_url);const sourceUrl=validUrl(s.source_url);const matchReasons=[level&&`Study level: ${level}`,group&&GROUPS[group]].filter(Boolean);return <article key={s.id} className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm ${deadline.open?'border-gray-200':'border-gray-200 opacity-75'}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{s.scholarship_type||'Scholarship'}</p>{!deadline.open&&<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">Closed</span>}</div><h3 className="mt-1 text-lg font-bold text-ink">{s.title}</h3><p className="mt-1 text-sm text-slate-500">{s.provider_name||s.college?.name||'Provider not listed'}</p></div><Award className="h-6 w-6 shrink-0 text-amber-500"/></div>{matchReasons.length>0&&<div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800"><strong>Why this matched:</strong> {matchReasons.join(' · ')}</div>}{s.coverage&&<p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{s.coverage}</p>}<div className="mt-4 flex flex-wrap gap-2">{(s.education_levels||[]).map(x=><span key={x} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{x}</span>)}{(s.target_groups||[]).slice(0,3).map(x=><span key={x} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{GROUPS[x]||x.replaceAll('_',' ')}</span>)}</div>{s.eligibility&&<p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600"><strong className="text-ink">Who should check:</strong> {s.eligibility}</p>}<div className="mt-auto pt-5"><div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-4 text-xs">{s.deadline?<span className={`flex items-center gap-1 font-bold ${deadline.tone}`}><Calendar className="h-3.5 w-3.5"/>{deadline.text} · {displayDate(s.deadline)}</span>:<span className="flex items-center gap-1 font-bold text-slate-600"><Calendar className="h-3.5 w-3.5"/>{deadline.text}</span>}<span className={`flex items-center gap-1 ${checked.fresh?'text-emerald-700':'text-amber-700'}`}><ShieldCheck className="h-3.5 w-3.5"/>{checked.text}</span></div><div className="mt-4 flex flex-wrap items-center gap-3">{applicationUrl?<a href={applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">Apply on official site <ExternalLink className="h-3.5 w-3.5"/></a>:<span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">Application link not published</span>}{sourceUrl&&sourceUrl!==applicationUrl&&<a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-primary">Check source <CheckCircle2 className="h-3.5 w-3.5"/></a>}{s.college?.slug&&<Link href={`/colleges/${s.college.slug}`} className="text-xs font-bold text-primary">College profile →</Link>}</div></div></article>})}</div>:<div className="mt-4 rounded-xl border border-gray-200 bg-white py-16 text-center"><Award className="mx-auto h-10 w-10 text-gray-300"/><h3 className="mt-3 font-bold text-ink">No matching scholarships</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Try a broader study level or eligibility group. New opportunities only appear after their source has been reviewed.</p>{hasFilters&&<Link href="/scholarships" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white">See all open scholarships</Link>}</div>}</>}
    <div className="mt-8 rounded-xl border border-[#e6e4df] bg-white p-5 text-sm leading-6 text-slate-600"><strong className="text-ink">Before you apply:</strong> confirm the deadline, required documents, award coverage and whether fees are refundable on the provider’s official page. SikshyaNepal does not guarantee selection and should never ask you to pay to “secure” a scholarship.</div>
  </div></main>
}
