import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'

interface CollegeDecisionCheckProps { collegeSlug: string; sourceUrl?: string | null; website?: string | null }

export default function CollegeDecisionCheck({ collegeSlug, sourceUrl, website }: CollegeDecisionCheckProps) {
  const officialLink = sourceUrl || website

  return (
    <section className="border-y border-border bg-[#fcfbf8] py-6 sm:py-7" aria-labelledby="application-guide-heading">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Application guide</p>
        <h2 id="application-guide-heading" className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-ink">Plan your application with confidence</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-secondary">Use the college’s official notice for final eligibility, fees and deadlines. These three checks make it easier to prepare before you apply.</p>
      </div>

      <ol className="mt-6 grid gap-0 border-y border-[#e6e4df] sm:grid-cols-3">
        {[
          ['01', 'Check eligibility', 'Read the current notice for your exact programme and intake.'],
          ['02', 'Get the full cost', 'Ask for a written breakdown of tuition, admission and exam fees.'],
          ['03', 'Keep documents ready', 'Prepare academic records, ID and any required photographs.'],
        ].map(([number, title, detail], index) => (
          <li key={number} className={`py-4 ${index ? 'border-t border-[#e6e4df] sm:border-l sm:border-t-0 sm:pl-5' : 'sm:pr-5'}`}>
            <p className="font-mono text-xs font-bold tracking-wide text-accent">{number}</p>
            <h3 className="mt-2 text-sm font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-secondary">{detail}</p>
          </li>
        ))}
      </ol>

      <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Application planning tools">
        <Link href={`/compare?college1=${collegeSlug}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Compare colleges <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        <Link href="/tools/college-cost-calculator" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Estimate study costs <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        <Link href="/admissions/planner#application-checklist" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Prepare documents <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        {officialLink ? <a href={officialLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Open official source <ExternalLink className="h-4 w-4" aria-hidden="true" /></a> : <Link href={`/colleges/${collegeSlug}#college-contact`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Contact the college <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
      </nav>
    </section>
  )
}
