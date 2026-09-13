import Link from 'next/link'
import { ArrowRight, Building2, CalendarDays, MapPin } from 'lucide-react'
import AdmissionStatusBadge from './AdmissionStatusBadge'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import { admissionLocation } from '@/lib/admissions'
import type { Admission } from '@/types'

export default function AdmissionCard({ admission }: { admission: Admission }) {
  const location = admissionLocation(admission)
  return <Link href={`/admissions/${admission.slug}`} aria-label={`View ${admission.title} admission details`} className="group block h-full rounded-2xl"><article className={`editorial-card editorial-card-interactive flex h-full flex-col p-5 ${admission.is_sponsored ? '!border-amber-300' : ''}`}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><AdmissionStatusBadge admission={admission} />{admission.is_sponsored ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">{admission.sponsor_label || 'Sponsored'}</span> : <VerificationBadge status={admission.verification_status} compact />}</div>
    <p className="editorial-kicker mb-2">{admission.admission_type.replaceAll('_', ' ')} admission</p>
    <h2 className="editorial-card-title text-lg leading-6 transition-colors group-hover:text-primary">{admission.title}</h2>
    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" />{admission.institution_name}</p>
    {location && <p className="editorial-meta mt-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />{location}</p>}
    {admission.summary && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{admission.summary}</p>}
    {admission.programs.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{admission.programs.slice(0, 3).map((program) => <span key={program} className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">{program}</span>)}{admission.programs.length > 3 && <span className="px-1 py-1 text-[11px] text-gray-400">+{admission.programs.length - 3}</span>}</div>}
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs"><span className="flex items-center gap-1 text-slate-600"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{admission.application_deadline ? new Date(admission.application_deadline).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date pending'}</span><span className="flex shrink-0 items-center gap-1 font-bold text-primary">View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></span></div>
  </article></Link>
}
