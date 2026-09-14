import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Clock3, ExternalLink, Megaphone, PencilLine, Scale } from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Editorial, Verification and Sponsorship Policy',
  description: 'How SikshyaNepal sources, verifies, updates, corrects and labels education information and sponsored placements.',
  alternates: { canonical: '/about/editorial-policy' },
}

const sections = [
  { Icon: BadgeCheck, title: 'How we verify information', body: 'We prioritise Nepal government, university and examination-board sources, followed by official institution publications and institution-confirmed submissions. A source-verified label applies only to the facts supported by the source shown on that page.' },
  { Icon: Clock3, title: 'Dates and changing information', body: 'Admissions, fees, seats, programs and contact details can change. Time-sensitive pages show a source and last-checked date when available. Students should confirm critical decisions on the linked original announcement.' },
  { Icon: PencilLine, title: 'Corrections', body: 'Students, parents and institutions can report incorrect or outdated information from an institution profile. Reports enter an administrative review queue; submissions do not directly overwrite public facts.' },
  { Icon: Megaphone, title: 'Advertising and sponsorship', body: 'Paid placements are labelled Sponsored. Payment can affect placement or visibility, but it must not create a false verification label, fabricated ranking, review score or unsupported factual claim.' },
  { Icon: Scale, title: 'Reviews and editorial independence', body: 'Student reviews require moderation before publication. Institutions may respond through the review process, but they cannot silently edit a student review or purchase a higher student rating.' },
]

export default function EditorialPolicyPage() {
  const pageUrl = absoluteUrl('/about/editorial-policy')
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: 'SikshyaNepal editorial, verification and sponsorship policy', dateModified: '2026-09-08', about: ['Editorial policy', 'Fact checking', 'Sponsored content', 'Corrections policy'], isPartOf: { '@id': `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Editorial policy', path: '/about/editorial-policy' }]),
  ] }
  return <main className="min-h-screen bg-[#f8f7f3]"><JsonLd data={schema} /><section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Trust and transparency</p><h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">Editorial and verification policy</h1><p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">How SikshyaNepal collects, checks, labels and corrects information—and how commercial relationships are kept visible.</p><p className="mt-3 text-xs text-gray-400">Policy last updated 8 September 2026</p></div></section><div className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><div className="space-y-4">{sections.map(({ Icon, title, body }) => <section key={title} className="rounded-2xl border border-gray-200 bg-white p-6"><div className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-display text-lg font-bold text-ink">{title}</h2><p className="mt-2 text-sm leading-7 text-gray-600">{body}</p></div></div></section>)}</div><section className="mt-6 rounded-2xl bg-[#0d1b3e] p-6 text-white"><h2 className="font-display text-lg font-bold">Source hierarchy</h2><ol className="mt-4 space-y-2 text-sm leading-6 text-blue-100/80"><li>1. Government, education board and university sources</li><li>2. Official school or college publications</li><li>3. Authorized institution representatives</li><li>4. Moderated student experience, clearly presented as experience rather than institutional fact</li></ol><div className="mt-5 flex flex-wrap gap-3"><Link href="/schools#data-quality" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary">School verification <ExternalLink className="h-3.5 w-3.5" /></Link><Link href="/notices" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white">View sourced notices</Link></div></section></div></main>
}
