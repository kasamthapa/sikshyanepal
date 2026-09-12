import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarCheck2, CheckCircle2, Clock3, GraduationCap } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import AdmissionFilters, { type AdmissionSearchParams } from '@/components/admissions/AdmissionFilters'
import { deadlineState } from '@/lib/admissions'
import type { Admission } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Admissions Open in Nepal – Schools, Colleges and Universities',
  description: 'Find verified admission openings, eligibility, entrance dates and application deadlines for schools, colleges and universities in Nepal.',
  alternates: { canonical: '/admissions' },
}

async function getAdmissions(sp: AdmissionSearchParams) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('admissions').select('*, school:schools(id,name,slug,district,province), college:colleges(id,name,slug,location)').eq('status', 'published').order('is_featured', { ascending: false }).order('application_deadline', { ascending: true, nullsFirst: false }).limit(200)
  if (sp.q) query = query.or(`title.ilike.%${sp.q.replace(/[,%()]/g, '')}%,institution_name.ilike.%${sp.q.replace(/[,%()]/g, '')}%`)
  if (sp.institution) query = query.eq('institution_type', sp.institution)
  if (sp.level) query = query.ilike('education_level', sp.level)
  if (sp.type) query = query.eq('admission_type', sp.type)
  if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])
  if (sp.deadline) {
    const now = new Date(); query = query.gte('application_deadline', now.toISOString())
    if (sp.deadline !== 'open') { const end = new Date(now.getTime() + Number(sp.deadline) * 86_400_000); query = query.lte('application_deadline', end.toISOString()) }
  }
  const { data, error } = await query
  if (error) console.error('[admissions]', error.message)
  return (data || []) as Admission[]
}

export default async function AdmissionsPage({ searchParams }: { searchParams: AdmissionSearchParams }) {
  const admissions = await getAdmissions(searchParams)
  const open = admissions.filter((item) => deadlineState(item.application_deadline) !== 'closed').length
  const soon = admissions.filter((item) => deadlineState(item.application_deadline) === 'closing_soon').length
  const verified = admissions.filter((item) => item.verification_status !== 'unverified').length
  return <div className="min-h-screen bg-[#f0f4ff]">
    <section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Admission calendar</p><h1 className="max-w-3xl font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Never miss an admission deadline.</h1><p className="mt-3 max-w-2xl text-gray-500">Verified openings for schools, colleges and universities—with eligibility, entrance dates and original sources in one place.</p></div></section>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><nav aria-label="Admission status" className="mb-6 flex gap-2 overflow-x-auto pb-1"><Link href="/admissions" aria-current={!searchParams.deadline ? 'page' : undefined} className={`min-h-11 whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-bold ${!searchParams.deadline ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'}`}>All admissions</Link><Link href="/admissions?deadline=open" aria-current={searchParams.deadline === 'open' ? 'page' : undefined} className={`min-h-11 whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-bold ${searchParams.deadline === 'open' ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'}`}>Open now</Link><Link href="/admissions?deadline=7" aria-current={searchParams.deadline === '7' ? 'page' : undefined} className={`min-h-11 whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-bold ${searchParams.deadline === '7' ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'}`}>Closing in 7 days</Link><Link href="/admissions/planner" className="min-h-11 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600">My planner</Link></nav><div className="mb-6 grid grid-cols-3 gap-3">{[{ Icon: CalendarCheck2, value: open, label: 'Open' }, { Icon: Clock3, value: soon, label: 'Closing soon' }, { Icon: CheckCircle2, value: verified, label: 'Verified' }].map(({ Icon, value, label }) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4"><Icon className="mb-2 h-5 w-5 text-primary" /><p className="font-mono text-2xl font-extrabold text-ink">{value}</p><p className="text-xs text-gray-500">{label}</p></div>)}</div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]"><AdmissionFilters searchParams={searchParams} count={admissions.length} /><main>{admissions.length ? <div className="grid gap-5 md:grid-cols-2">{admissions.map((item) => <AdmissionCard key={item.id} admission={item} />)}</div> : <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center"><GraduationCap className="mx-auto h-11 w-11 text-gray-300" /><h2 className="mt-4 font-display text-xl font-bold text-ink">No matching admissions</h2><p className="mt-2 text-sm text-gray-500">Try clearing a filter or return soon for newly verified openings.</p><Link href="/admissions" className="mt-5 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">View all</Link></div>}</main></div>
    </div>
  </div>
}
