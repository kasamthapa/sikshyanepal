import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react'

type CheckState = 'available' | 'confirm' | 'missing'

type DecisionCheck = {
  label: string
  detail: string
  state: CheckState
}

interface CollegeDecisionCheckProps {
  collegeName: string
  collegeSlug: string
  checks: DecisionCheck[]
  sourceUrl?: string | null
  website?: string | null
}

const stateStyle: Record<CheckState, { icon: typeof CheckCircle2; className: string; text: string }> = {
  available: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700', text: 'Available' },
  confirm: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-800', text: 'Confirm' },
  missing: { icon: CircleDashed, className: 'bg-gray-100 text-gray-600', text: 'Not listed' },
}

export default function CollegeDecisionCheck({ collegeName, collegeSlug, checks, sourceUrl, website }: CollegeDecisionCheckProps) {
  const officialLink = sourceUrl || website

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6" aria-labelledby="decision-check-heading">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Before you apply</p>
        <h2 id="decision-check-heading" className="mt-2 text-xl font-semibold text-gray-950">Decision check for {collegeName}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          This is a completeness check, not a college ranking. Confirm every changing detail with the institution before paying or submitting documents.
        </p>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {checks.map(check => {
          const style = stateStyle[check.state]
          const Icon = style.icon
          return (
            <li key={check.label} className="rounded-xl border border-gray-100 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{check.label}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">{check.detail}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${style.className}`}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />{style.text}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-900">Your next actions</h3>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <li><Link href={`/compare?college1=${collegeSlug}`} className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">1. Compare options <ArrowRight className="h-4 w-4" /></Link></li>
          <li><Link href="/tools/college-cost-calculator" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">2. Plan total cost <ArrowRight className="h-4 w-4" /></Link></li>
          <li><Link href="/admissions/planner#application-checklist" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">3. Prepare documents <ArrowRight className="h-4 w-4" /></Link></li>
          <li>{officialLink ? <a href={officialLink} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">4. Verify officially <ExternalLink className="h-4 w-4" /></a> : <Link href={`/colleges/${collegeSlug}#college-contact`} className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">4. Contact college <ArrowRight className="h-4 w-4" /></Link>}</li>
        </ol>
      </div>
    </section>
  )
}
