import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { BookOpen, Clock, ArrowLeft, Building2, BadgeCheck, BriefcaseBusiness, CircleDollarSign, ExternalLink, GraduationCap } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import type { Program, CollegeProgram, Admission, Scholarship } from '@/types'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'
import { cache } from 'react'
import { collegeDisplayAffiliation, collegeDisplayLocation } from '@/lib/college-display'

function metaDescription(program: Program) {
  const fallback = `Explore eligibility, fees, colleges, scholarships and admissions for ${program.name} in Nepal.`
  const text = (program.overview || fallback).replace(/\s+/g, ' ').trim()
  return text.length > 157 ? `${text.slice(0, 154).trimEnd()}...` : text
}

function conciseAnswer(value: string, limit = 420) {
  const text = value.replace(/\s+/g, ' ').trim()
  if (text.length <= limit) return text
  const shortened = text.slice(0, limit)
  const sentenceEnd = shortened.lastIndexOf('. ')
  if (sentenceEnd > limit * 0.55) return shortened.slice(0, sentenceEnd + 1)
  const wordEnd = shortened.lastIndexOf(' ')
  return `${shortened.slice(0, wordEnd > 0 ? wordEnd : limit).trimEnd()}...`
}

const getProgram = cache(async function getProgram(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data: program } = await supabase.from('programs').select('*').eq('slug', slug).single()
  if (!program) return null

  const { data: colleges } = await supabase
    .from('college_programs')
    .select('*, college:colleges(*)')
    .eq('program_id', program.id)
    .limit(20)

  const visibleColleges = ((colleges || []) as CollegeProgram[]).filter(item => item.college && (item.college.status === 'active' || item.college.status == null))
  const collegeIds = visibleColleges.map(item => item.college_id)
  const today = new Date().toISOString()
  const [{ data: admissions }, { data: scholarships }] = await Promise.all([
    supabase.from('admissions').select('id,title,slug,institution_name,application_deadline,status,programs').eq('status','published').contains('programs',[program.name]).or(`application_deadline.is.null,application_deadline.gte.${today}`).order('application_deadline',{ascending:true,nullsFirst:false}).limit(8),
    collegeIds.length ? supabase.from('scholarships').select('*,college:colleges(id,name,slug)').in('college_id',collegeIds).eq('is_active',true).or(`deadline.is.null,deadline.gte.${today}`).order('deadline',{ascending:true,nullsFirst:false}).limit(8) : Promise.resolve({ data: [] }),
  ])

  return { program: program as Program, colleges: visibleColleges, admissions: (admissions || []) as Admission[], scholarships: (scholarships || []) as Scholarship[] }
})

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProgram(params.slug)
  if (!data) return { title: 'Program Not Found' }
  const description = metaDescription(data.program)
  return {
    title: `${data.program.name} in Nepal: Eligibility, Fees and Colleges`,
    description,
    alternates: { canonical: `/programs/${data.program.slug}` },
    openGraph: { title: `${data.program.name} in Nepal | SikshyaNepal`, description, url: `/programs/${data.program.slug}`, type: 'website' },
    twitter: { card: 'summary', title: `${data.program.name} in Nepal | SikshyaNepal`, description },
  }
}

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProgram(params.slug)
  if (!data) notFound()

  const { program, colleges, admissions, scholarships } = data
  const sourceBacked = Boolean(program.source_url && program.last_verified_at)
  const durationLabel = sourceBacked ? program.duration : 'Confirm with university'
  const fees = colleges.map(item => item.fee).filter((fee): fee is number => fee != null)
  const feeMin = program.average_fee_min ?? (fees.length ? Math.min(...fees) : null)
  const feeMax = program.average_fee_max ?? (fees.length ? Math.max(...fees) : null)
  const feeAnswer = feeMin != null
    ? `The currently published fee range starts at NPR ${feeMin.toLocaleString()}${feeMax && feeMax !== feeMin ? ` and reaches NPR ${feeMax.toLocaleString()}` : ''}. Confirm whether a quoted amount is annual, semester-based or total.`
    : 'No reliable fee range is recorded yet. Ask each college whether its quote is annual, semester-based or the total programme cost.'
  const programAnswers = [
    { question: `What is ${program.name} in Nepal?`, answer: program.overview && sourceBacked ? conciseAnswer(program.overview) : sourceBacked ? `${program.name} is a ${program.degree_level} programme in the ${program.faculty} field. Its source-backed duration is ${program.duration}.` : `${program.name} is listed as a ${program.degree_level} programme in the ${program.faculty} field. Its duration and entry rules still need an original university or regulator source.` },
    { question: `Who is eligible for ${program.name}?`, answer: program.eligibility || 'Eligibility differs by university and intake. Confirm the required previous qualification, subjects, grades and entrance process in the current official admission notice.' },
    { question: `How much does ${program.name} cost in Nepal?`, answer: feeAnswer },
    { question: `Where can I study ${program.name} in Nepal?`, answer: colleges.length ? `SikshyaNepal currently links ${colleges.length} active college profile${colleges.length === 1 ? '' : 's'} offering this programme. Review the list below and confirm the current intake with each college.` : 'No active college profile is linked to this programme yet. Check again later or verify options with the relevant university.' },
  ]
  const pageUrl = absoluteUrl(`/programs/${program.slug}`)
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'EducationalOccupationalProgram', '@id': `${pageUrl}#program`, name: program.name, url: pageUrl, description: program.overview || undefined, educationalCredentialAwarded: program.degree_level, occupationalCategory: program.career_paths || [], provider: colleges.slice(0, 10).filter(item => item.college).map(item => ({ '@type': 'CollegeOrUniversity', name: item.college!.name, url: absoluteUrl(`/colleges/${item.college!.slug}`) })) },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: `${program.name} in Nepal`, datePublished: program.created_at, dateModified: program.updated_at || program.last_verified_at || program.created_at, mainEntity: { '@id': `${pageUrl}#program` }, citation: program.source_url || undefined, isPartOf: { '@id': `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Programs', path: '/programs' }, { name: program.name, path: `/programs/${program.slug}` }]),
    { '@type': 'FAQPage', '@id': `${pageUrl}#questions`, mainEntity: programAnswers.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
  ] }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={jsonLd} />
      <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue" className="capitalize">{program.degree_level}</Badge>
              <Badge variant="gray">{program.faculty}</Badge>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-3.5 h-3.5" /> {durationLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-6" aria-labelledby="program-quick-answer">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Quick answer</p>
        <h2 id="program-quick-answer" className="mt-2 text-lg font-bold text-gray-950">What should I know about {program.name}?</h2>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          {sourceBacked ? `${program.name} is a ${program.degree_level} programme in ${program.faculty}, with a source-backed duration of ${program.duration}.` : `The programme name, level and linked colleges are listed here, but its duration and entry rules are awaiting an original university or regulator source.`} {colleges.length ? `${colleges.length} active college profile${colleges.length === 1 ? ' is' : 's are'} currently linked below.` : 'No active college profile is linked yet.'}
        </p>
        <p className="mt-3 text-xs leading-5 text-gray-500">Eligibility, fees and intakes can change. Use the source and freshness section and confirm the latest notice before applying.</p>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5"><GraduationCap className="h-5 w-5 text-blue-600"/><h2 className="mt-3 font-bold">Eligibility</h2><p className="mt-2 text-sm leading-6 text-gray-600">{program.eligibility || 'Confirm current eligibility with the awarding university or college.'}</p></div>
        <div className="rounded-2xl border bg-white p-5"><CircleDollarSign className="h-5 w-5 text-emerald-600"/><h2 className="mt-3 font-bold">Published fee range</h2><p className="mt-2 text-sm text-gray-600">{feeMin != null ? `NPR ${feeMin.toLocaleString()}${feeMax && feeMax !== feeMin ? ` – ${feeMax.toLocaleString()}` : ''}` : 'Fees vary by college.'}</p><p className="mt-2 text-xs leading-5 text-gray-400">Confirm whether each amount is annual, semester-based or total.</p></div>
        <div className="rounded-2xl border bg-white p-5"><BadgeCheck className="h-5 w-5 text-violet-600"/><h2 className="mt-3 font-bold">Entrance</h2><p className="mt-2 text-sm leading-6 text-gray-600">{program.entrance_requirements || 'Check the latest university admission notice.'}</p></div>
      </div>
      {program.overview && <section className="mb-6 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">About {program.name}</h2><p className="mt-3 whitespace-pre-line leading-7 text-gray-600">{program.overview}</p></section>}
      {(program.curriculum_highlights?.length || program.career_paths?.length) ? <div className="mb-6 grid gap-6 md:grid-cols-2">{program.curriculum_highlights?.length ? <section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5 text-blue-600"/>Curriculum highlights</h2><ul className="mt-4 space-y-2 text-sm text-gray-600">{program.curriculum_highlights.map(item=><li key={item}>• {item}</li>)}</ul></section>:null}{program.career_paths?.length?<section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><BriefcaseBusiness className="h-5 w-5 text-emerald-600"/>Career paths</h2><ul className="mt-4 space-y-2 text-sm text-gray-600">{program.career_paths.map(item=><li key={item}>• {item}</li>)}</ul></section>:null}</div>:null}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Colleges offering {program.name}
          </h2>
          <Badge variant="gray">{colleges.length}</Badge>
        </div>

        {colleges.length > 0 ? (
          <div className="space-y-3">
            {colleges.filter(cp => cp.college).map((cp) => (
              <Link key={cp.college_id} href={`/colleges/${cp.college?.slug}`} className="group block">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-gray-50 hover:bg-white">
                  <div>
                    <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {cp.college?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{collegeDisplayLocation(cp.college!) || 'Location not listed'}</span>
                      {cp.college?.affiliation && (
                        <Badge variant="gray">{collegeDisplayAffiliation(cp.college.affiliation)}</Badge>
                      )}
                      {cp.scholarship_available && <Badge variant="green">Scholarship</Badge>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {cp.fee && (
                      <p className="font-semibold text-gray-900 text-sm">NPR {cp.fee.toLocaleString()}</p>
                    )}
                    {cp.seats && (
                      <p className="text-xs text-gray-500">{cp.seats} seats</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600"><p>No active college profile is linked to this program yet.</p><Link href={`/colleges?program=${program.slug}`} className="mt-3 inline-flex font-bold text-primary">Search the college directory →</Link></div>
        )}
      </div>
      {admissions.length > 0 && <section className="mt-6 rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Current admissions</h2><div className="mt-4 space-y-3">{admissions.map(item=><Link key={item.id} href={`/admissions/${item.slug}`} className="flex justify-between rounded-xl bg-blue-50 p-4 text-sm"><span><strong>{item.title}</strong><span className="block text-gray-500">{item.institution_name}</span></span><span className="text-blue-700">View →</span></Link>)}</div></section>}
      {scholarships.length > 0 && <section className="mt-6 rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Related scholarships</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{scholarships.map(item=><div key={item.id} className="rounded-xl border p-4"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-gray-500">{item.college?.name}</p></div>)}</div></section>}
      <section className="mt-6 rounded-2xl border bg-white p-6" aria-labelledby="program-questions">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Student questions</p>
        <h2 id="program-questions" className="mt-2 text-lg font-bold text-gray-950">Questions about {program.name}</h2>
        <div className="mt-5 divide-y divide-gray-100">{programAnswers.map(item => <details key={item.question} className="group py-4 first:pt-0 last:pb-0"><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-gray-900 marker:hidden">{item.question}<span className="float-right text-blue-600 group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{item.answer}</p></details>)}</div>
      </section>
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm"><p className="font-semibold text-ink">Source and freshness</p><p className="mt-1 text-gray-600">{program.last_verified_at ? `Last checked ${new Date(program.last_verified_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}.` : 'A last-checked date has not been recorded yet.'} {program.source_url ? 'Confirm changing requirements on the linked original source.' : 'A primary source link has not been recorded; confirm all requirements with the university or college.'}</p>{program.source_url && <a href={program.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-700">Official program source <ExternalLink className="h-4 w-4"/></a>}</div>
    </div>
  )
}
