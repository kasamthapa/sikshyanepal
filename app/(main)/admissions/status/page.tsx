import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarCheck2, CalendarClock, ChevronRight, CircleCheck, GraduationCap, School } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { admissionState } from '@/lib/admissions'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import type { Admission } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Admission Status in Nepal – Open, Upcoming and Closing Soon', description: 'Check verified school and college admission opportunities in Nepal by current status: open, upcoming, closing soon and closed.' }

const groups = [
  { key: 'open', label: 'Open now', description: 'Applications are currently open.', icon: CircleCheck, tone: 'text-emerald-600' },
  { key: 'closing_soon', label: 'Closing soon', description: 'Deadlines within the next seven days.', icon: CalendarClock, tone: 'text-orange-600' },
  { key: 'upcoming', label: 'Opening soon', description: 'Published opportunities that have not opened yet.', icon: CalendarCheck2, tone: 'text-blue-600' },
] as const

export default async function AdmissionStatusPage() {
  const { data, error } = await createServerSupabaseClient().from('admissions').select('*, school:schools(id,name,slug,district,province), college:colleges(id,name,slug,location)').eq('status', 'published').order('application_open_at', { ascending: true, nullsFirst: false }).order('application_deadline', { ascending: true, nullsFirst: false }).limit(300)
  if (error) console.error('[admissions/status] Failed to load admissions:', error)
  const admissions = (data || []) as Admission[]
  const schoolCount = admissions.filter((item) => item.institution_type === 'school' && ['open', 'closing_soon', 'upcoming'].includes(admissionState(item))).length
  const collegeCount = admissions.filter((item) => item.institution_type === 'college' && ['open', 'closing_soon', 'upcoming'].includes(admissionState(item))).length
  return <main className="min-h-screen bg-[#f0f4ff]"><section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-11 sm:px-6 lg:px-8"><nav className="text-sm text-gray-500"><Link href="/admissions">Admissions</Link> / Status</nav><h1 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">Admission status dashboard</h1><p className="mt-3 max-w-2xl text-gray-500">A current view of verified openings. Schools are ECD–Grade 10; colleges cover +2, Bachelor, Master and higher education.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/admissions?institution=school" className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-primary"><School className="h-4 w-4" />{schoolCount} school opportunities</Link><Link href="/admissions?institution=college" className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700"><GraduationCap className="h-4 w-4" />{collegeCount} college opportunities</Link></div></div></section><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{error && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900"><strong>Admission data is temporarily unavailable.</strong> Please try again shortly. The zero counts below do not indicate that admissions are closed.</div>}<div className="grid gap-7 xl:grid-cols-3">{groups.map(({ key, label, description, icon: Icon, tone }) => { const items = admissions.filter((item) => admissionState(item) === key); return <section key={key} className="rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Icon className={`h-5 w-5 ${tone}`} /><h2 className="font-display text-xl font-bold text-ink">{label}</h2></div><p className="mt-1 text-sm text-gray-500">{description}</p></div><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">{items.length}</span></div><div className="mt-5 space-y-4">{items.slice(0, 6).map((item) => <AdmissionCard key={item.id} admission={item} />)}{!items.length && !error && <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">No published admissions in this status right now.</p>}</div>{items.length > 6 && <Link href={`/admissions?deadline=${key === 'closing_soon' ? '7' : key === 'open' ? 'open' : ''}`} className="mt-5 flex items-center gap-1 text-sm font-bold text-primary">See all matching admissions <ChevronRight className="h-4 w-4" /></Link>}</section> })}</div><section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Always check the source:</strong> admission dates can change. Open every listing’s official source before applying or paying any fee.</section></div></main>
}
