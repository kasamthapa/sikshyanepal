import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarPlus, CheckCircle2, ExternalLink, FileCheck2, Mail, Phone, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import AdmissionStatusBadge from '@/components/admissions/AdmissionStatusBadge'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import ApplyNowButton from '@/components/colleges/ApplyNowButton'
import { admissionState } from '@/lib/admissions'
import type { Admission } from '@/types'
import ShareButton from '@/components/ui/ShareButton'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AdmissionWithHistory = Admission & { deadline_history: { id: string; previous_deadline: string | null; new_deadline: string | null; changed_at: string }[] }
async function getAdmission(slug: string) {
  const db = createServerSupabaseClient()
  const { data } = await db.from('admissions').select('*, school:schools(id,name,slug,district,province), college:colleges(id,name,slug,location)').eq('slug', slug).eq('status', 'published').single()
  if (!data) return null
  const { data: history } = await db.from('admission_deadline_history').select('id,previous_deadline,new_deadline,changed_at').eq('admission_id', data.id).order('changed_at', { ascending: false }).limit(10)
  return { ...data, deadline_history: history || [] } as AdmissionWithHistory
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getAdmission(params.slug)
  if (!item) return { title: 'Admission not found' }
  return { title: `${item.title} – Eligibility and Deadline`, description: item.summary || `Admission details, eligibility and deadline for ${item.institution_name}.`, alternates: { canonical: `/admissions/${item.slug}` } }
}

function date(value: string | null) { return value ? new Date(value).toLocaleString('en-NP', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not announced' }

export default async function AdmissionPage({ params }: { params: { slug: string } }) {
  const item = await getAdmission(params.slug); if (!item) notFound()
  const status = admissionState(item)
  const closed = status === 'closed'
  const upcoming = status === 'upcoming'
  const pageUrl = absoluteUrl(`/admissions/${item.slug}`)
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'EducationEvent', '@id': `${pageUrl}#admission`, name: item.title, description: item.summary || item.details || undefined, startDate: item.application_open_at || undefined, endDate: item.application_deadline || undefined, eventStatus: closed ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled', organizer: { '@type': 'EducationalOrganization', name: item.institution_name, url: item.application_url || item.source_url }, url: pageUrl, mainEntityOfPage: { '@id': `${pageUrl}#webpage` } },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: item.title, datePublished: item.published_at || item.created_at, dateModified: item.updated_at, mainEntity: { '@id': `${pageUrl}#admission` }, citation: item.source_url, isPartOf: { '@id': `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Admissions', path: '/admissions' }, { name: item.title, path: `/admissions/${item.slug}` }]),
  ] }
  return <div className="min-h-screen bg-[#f0f4ff]"><JsonLd data={jsonLd} />
    <section className="bg-[#0d1b3e] text-white"><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><nav className="mb-6 text-xs text-blue-200"><Link href="/admissions">Admissions</Link> <span className="mx-2">/</span> {item.institution_name}</nav><div className="flex flex-wrap items-center gap-2"><AdmissionStatusBadge admission={item} /><VerificationBadge status={item.verification_status} />{item.is_sponsored && <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-950">{item.sponsor_label || 'Sponsored placement'}</span>}</div><div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-300">{item.admission_type} admission</p><h1 className="mt-2 max-w-4xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">{item.title}</h1><p className="mt-4 text-lg font-semibold text-blue-100">{item.institution_name}</p></div><ShareButton title={`${item.title} | SikshyaNepal`} /></div></div></section>
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px]"><main className="space-y-6"><section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-ink">Admission overview</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">{item.details || item.summary || 'Additional details have not been published.'}</p>{item.programs.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold text-ink">Available programs</h3><div className="mt-3 flex flex-wrap gap-2">{item.programs.map((p) => <span key={p} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary">{p}</span>)}</div></div>}</section>
      {item.eligibility && <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Eligibility</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">{item.eligibility}</p></section>}
      {item.required_documents.length > 0 && <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink"><FileCheck2 className="h-5 w-5 text-primary" />Documents required</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{item.required_documents.map((doc) => <li key={doc} className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />{doc}</li>)}</ul></section>}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl font-bold text-ink">Verification and source</h2><p className="mt-1 text-sm text-gray-500">Always confirm critical dates on the original notice.</p></div><VerificationBadge status={item.verification_status} /></div><dl className="mt-5 divide-y divide-gray-100 text-sm"><div className="flex justify-between gap-4 py-3"><dt className="text-gray-500">Source</dt><dd className="text-right font-semibold text-ink">{item.source_name}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-gray-500">Last checked</dt><dd className="text-right font-semibold text-ink">{date(item.last_verified_at)}</dd></div></dl><a href={item.source_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">View original announcement <ExternalLink className="h-4 w-4" /></a></section>
      {item.deadline_history.length > 0 && <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-ink">Deadline change history</h2><p className="mt-1 text-sm text-gray-500">Dates were updated from the original source. The newest change appears first.</p><ol className="mt-5 space-y-3">{item.deadline_history.map(change => <li key={change.id} className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950"><p className="font-semibold">{date(change.previous_deadline)} → {date(change.new_deadline)}</p><p className="mt-1 text-xs text-amber-800">Updated {date(change.changed_at)}</p></li>)}</ol></section>}
    </main><aside className="space-y-5"><section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">Important dates</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-xs text-gray-400">Applications open</dt><dd className="mt-1 font-semibold text-ink">{date(item.application_open_at)}</dd></div><div><dt className="text-xs text-gray-400">Application deadline</dt><dd className="mt-1 font-semibold text-ink">{date(item.application_deadline)}</dd></div>{item.entrance_exam_at && <div><dt className="text-xs text-gray-400">Entrance examination</dt><dd className="mt-1 font-semibold text-ink">{date(item.entrance_exam_at)}</dd></div>}</dl>{item.application_deadline && <a href={`/api/admissions/${item.id}/calendar`} className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-ink"><CalendarPlus className="h-4 w-4 text-primary" />Add deadline to calendar</a>}</section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">Application</h2>{item.application_fee != null && <p className="mt-3 text-sm text-gray-500">Application fee <strong className="text-ink">NPR {item.application_fee.toLocaleString()}</strong></p>}{item.available_seats != null && <p className="mt-2 text-sm text-gray-500">Available seats <strong className="text-ink">{item.available_seats}</strong></p>}{closed ? <div className="mt-4 rounded-xl bg-gray-100 p-3 text-center text-sm font-semibold text-gray-500">This deadline has passed</div> : upcoming ? <div className="mt-4 rounded-xl bg-blue-50 p-3 text-center text-sm font-semibold text-blue-900">Applications open {date(item.application_open_at)}. Save or share this page so you can return on time.</div> : item.college_id ? <ApplyNowButton collegeName={item.institution_name} collegeId={item.college_id} isSponsored={item.is_sponsored} programs={(item.programs.length ? item.programs : ['Not sure yet']).map((name) => ({ name }))} /> : item.application_url ? <a href={item.application_url} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Apply on official website <ExternalLink className="h-4 w-4" /></a> : <p className="mt-3 text-sm text-gray-500">Contact the institution using the details below.</p>}{item.contact_phone && <a href={`tel:${item.contact_phone}`} className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><Phone className="h-4 w-4 text-primary" />{item.contact_phone}</a>}{item.contact_email && <a href={`mailto:${item.contact_email}`} className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><Mail className="h-4 w-4 text-primary" />{item.contact_email}</a>}</section>
      <div className="rounded-2xl bg-blue-50 p-5 text-sm text-blue-900"><ShieldCheck className="mb-2 h-5 w-5 text-primary" /><strong>Student safety:</strong><p className="mt-1 leading-6 text-blue-800/80">Pay fees only through official institution channels. SikshyaNepal never asks you to transfer admission fees to personal accounts.</p></div></aside></div>
  </div>
}
