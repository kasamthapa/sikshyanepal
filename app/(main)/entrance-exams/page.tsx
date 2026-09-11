import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, CalendarClock, CalendarPlus, CheckCircle2, ExternalLink, FileText, Search } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { EntranceExam } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Entrance Exams in Nepal – Dates, Deadlines and Eligibility', description: 'Track verified entrance exam application deadlines, exam dates, fees, eligibility and official notices for study in Nepal.' }
const LEVELS = ['+2', 'Bachelor', 'Master', 'Diploma'] as const
const cleanSearch = (value?: string) => (value || '').replace(/[,().%]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
const validUrl = (value?: string | null) => { if (!value) return null; try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null } catch { return null } }
const validDate = (value?: string | null) => Boolean(value && Number.isFinite(new Date(value).getTime()))
const dateLabel = (value: string | null) => validDate(value) ? new Intl.DateTimeFormat('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value!)) : 'Not announced'
const daysFromToday = (value: string) => { const end = new Date(value); const today = new Date(); end.setHours(0,0,0,0); today.setHours(0,0,0,0); return Math.round((end.getTime()-today.getTime())/86400000) }
const stateFor = (exam: EntranceExam) => {
  if (!validDate(exam.application_deadline)) return { label: 'Date pending', tone: 'bg-amber-50 text-amber-800', days: null }
  const days = daysFromToday(exam.application_deadline!)
  if (days < 0) return { label: 'Closed', tone: 'bg-gray-100 text-gray-600', days }
  if (days === 0) return { label: 'Closes today', tone: 'bg-red-50 text-red-700', days }
  if (days <= 7) return { label: `${days} day${days===1?'':'s'} left`, tone: 'bg-red-50 text-red-700', days }
  return { label: 'Applications open', tone: 'bg-emerald-50 text-emerald-700', days }
}
const calendarLink = (exam: EntranceExam) => {
  if (!validDate(exam.exam_date)) return null
  const start = new Date(exam.exam_date!); const end = new Date(start.getTime()+60*60*1000)
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(exam.title)}&dates=${stamp(start)}/${stamp(end)}&details=${encodeURIComponent(`Confirm time and venue on the official notice: ${exam.exam_url||exam.source_url||''}`)}`
}

export default async function EntranceExamsPage({ searchParams }: { searchParams: { q?: string; level?: string; status?: string } }) {
  const db = createServerSupabaseClient()
  const q = cleanSearch(searchParams.q)
  const level = LEVELS.includes(searchParams.level as typeof LEVELS[number]) ? searchParams.level! : ''
  const status = searchParams.status === 'all' ? 'all' : 'open'
  let query = db.from('entrance_exams').select('*, university:universities(name,short_name)').eq('status', 'published').order('application_deadline', { ascending: true, nullsFirst: false }).limit(150)
  if (q) query = query.or(`title.ilike.%${q}%,program.ilike.%${q}%,exam_body.ilike.%${q}%`)
  if (level) query = query.eq('education_level', level)
  const { data, error } = await query
  if (error) console.error('[entrance-exams:list]', { code:error.code, message:error.message })
  const exams = (data || []) as EntranceExam[]
  const open = exams.filter(exam => stateFor(exam).days === null || stateFor(exam).days! >= 0)
  const closed = exams.filter(exam => { const days=stateFor(exam).days; return days !== null && days < 0 && days >= -90 })
  const visible = status === 'all' ? [...open, ...closed] : open
  const hasFilters = Boolean(q || level || status === 'all')

  return <main className="min-h-screen bg-[#f8f7f3]"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">Plan before the deadline</p><h1 className="mt-2 font-display text-4xl font-bold text-ink">Entrance exams in Nepal</h1><p className="mt-3 text-base leading-7 text-slate-600">Compare application deadlines, exam dates, eligibility and official notices. Confirm the final time, venue and fee with the exam authority before paying.</p></div>
    <form className="mt-7 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_180px_auto]" role="search"><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Exam, program or authority</span><span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input name="q" maxLength={80} defaultValue={q} placeholder="e.g. IOE, MBBS, CMAT" className="w-full rounded-lg border border-gray-200 py-3 pl-9 pr-3 text-sm outline-none focus:border-primary"/></span></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Study level</span><select name="level" defaultValue={level} className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="">All levels</option>{LEVELS.map(item=><option key={item}>{item}</option>)}</select></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Application status</span><select name="status" defaultValue={status} className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="open">Open or date pending</option><option value="all">Include last 90 days</option></select></label><button className="mt-auto h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white">Find exams</button>{hasFilters&&<Link href="/entrance-exams" className="text-sm font-bold text-primary sm:col-span-4">Clear filters</Link>}</form>
    {error?<div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="font-bold">Entrance exams could not be loaded</p><p className="mt-1">No empty result is being assumed. Refresh or try again shortly.</p></div></div>:<><div className="mt-8 flex items-center justify-between"><div><h2 className="text-xl font-bold text-ink">{status==='all'?'Current and recently closed':'Open and upcoming'}</h2><p className="mt-1 text-sm text-slate-500">{visible.length} source-backed exam{visible.length===1?'':'s'} listed</p></div><Link href="/deadlines?type=exam" className="text-sm font-bold text-primary">Deadline calendar →</Link></div>
    {visible.length?<div className="mt-4 grid gap-4 lg:grid-cols-2">{visible.map(exam=><ExamCard key={exam.id} exam={exam}/>)}</div>:<div className="mt-4 rounded-xl border border-gray-200 bg-white px-6 py-14 text-center"><CalendarClock className="mx-auto h-10 w-10 text-gray-300"/><h3 className="mt-3 font-bold text-ink">No matching exams</h3><p className="mt-1 text-sm text-gray-500">Try a broader level or search term. Exams appear after an official notice is reviewed.</p>{hasFilters&&<Link href="/entrance-exams" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white">See all open exams</Link>}</div>}</>}
    <section className="mt-8 rounded-xl border border-[#e6e4df] bg-white p-5 text-sm leading-6 text-slate-600"><strong className="text-ink">Your exam check:</strong> verify eligibility, application deadline, payment method, admit-card date, exam time and venue on the official notice. Add the exam to your calendar only after those details are confirmed.</section>
  </div></main>
}

function ExamCard({ exam }: { exam: EntranceExam }) {
  const state=stateFor(exam); const official=validUrl(exam.exam_url)||validUrl(exam.source_url); const syllabus=validUrl(exam.syllabus_url); const calendar=calendarLink(exam)
  return <article className={`flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${state.days!==null&&state.days<0?'opacity-75':''}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide text-primary"><span>{exam.education_level||'Entrance'}</span>{exam.exam_body&&<span className="text-slate-400">· {exam.exam_body}</span>}</div><h3 className="mt-2 text-lg font-bold text-ink">{exam.title}</h3>{exam.program&&<p className="mt-1 text-sm text-slate-500">{exam.program}</p>}</div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${state.tone}`}>{state.label}</span></div>
    <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-[#f8f7f3] p-4 text-sm"><div><p className="text-xs text-slate-500">Apply by</p><p className="mt-1 font-bold text-ink">{dateLabel(exam.application_deadline)}</p></div><div><p className="text-xs text-slate-500">Exam date</p><p className="mt-1 font-bold text-ink">{dateLabel(exam.exam_date)}</p></div>{exam.fee!=null&&<div><p className="text-xs text-slate-500">Application fee</p><p className="mt-1 font-bold text-ink">NPR {Number(exam.fee).toLocaleString()}</p></div>}<div><p className="text-xs text-slate-500">Source check</p><p className="mt-1 flex items-center gap-1 font-medium text-slate-700"><CheckCircle2 className={`h-3.5 w-3.5 ${exam.last_verified_at?'text-emerald-600':'text-amber-600'}`}/>{exam.last_verified_at?dateLabel(exam.last_verified_at):'Check before applying'}</p></div></div>
    {exam.eligibility&&<p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600"><strong className="text-ink">Who should check:</strong> {exam.eligibility}</p>}
    <div className="mt-auto flex flex-wrap gap-3 border-t border-gray-100 pt-4">{official?<a href={official} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">Official notice <ExternalLink className="h-4 w-4"/></a>:<span className="text-sm font-semibold text-slate-500">Official link not available</span>}{syllabus&&<a href={syllabus} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600"><FileText className="h-4 w-4"/>Syllabus</a>}{calendar&&<a href={calendar} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600"><CalendarPlus className="h-4 w-4"/>Add exam date</a>}</div></article>
}
