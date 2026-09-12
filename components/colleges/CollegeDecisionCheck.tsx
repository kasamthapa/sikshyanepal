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
    <section className="bg-white px-1 py-2" aria-labelledby="decision-check-heading">
      <div className="max-w-2xl">
        <h2 id="decision-check-heading" className="text-xl font-semibold text-gray-950">Before you apply to {collegeName}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          This check shows which application details are documented. Confirm changing information with the institution before paying or submitting documents.
        </p>
      </div>

      <ul className="mt-5 grid border-y border-gray-200 sm:grid-cols-2">
        {checks.map(check => {
          const style = stateStyle[check.state]
          const Icon = style.icon
          return (
            <li key={check.label} className="border-b border-gray-100 py-4 sm:odd:pr-5 sm:even:border-l sm:even:pl-5">
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

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-900">Next steps</h3>
        <ol className="mt-2 grid text-sm sm:grid-cols-2">
          <li><Link href={`/compare?college1=${collegeSlug}`} className="flex min-h-11 items-center justify-between border-b border-gray-100 py-2 pr-3 font-semibold text-gray-700 hover:text-blue-700">Compare colleges <ArrowRight className="h-4 w-4" /></Link></li>
          <li><Link href="/tools/college-cost-calculator" className="flex min-h-11 items-center justify-between border-b border-gray-100 py-2 pr-3 font-semibold text-gray-700 sm:pl-5 hover:text-blue-700">Estimate total cost <ArrowRight className="h-4 w-4" /></Link></li>
          <li><Link href="/admissions/planner#application-checklist" className="flex min-h-11 items-center justify-between border-b border-gray-100 py-2 pr-3 font-semibold text-gray-700 hover:text-blue-700">Prepare documents <ArrowRight className="h-4 w-4" /></Link></li>
          <li>{officialLink ? <a href={officialLink} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between border-b border-gray-100 py-2 pr-3 font-semibold text-gray-700 sm:pl-5 hover:text-blue-700">Check the official source <ExternalLink className="h-4 w-4" /></a> : <Link href={`/colleges/${collegeSlug}#college-contact`} className="flex min-h-11 items-center justify-between border-b border-gray-100 py-2 pr-3 font-semibold text-gray-700 sm:pl-5 hover:text-blue-700">Contact the college <ArrowRight className="h-4 w-4" /></Link>}</li>
        </ol>
      </div>
    </section>
  )
}
