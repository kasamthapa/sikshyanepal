import type { Metadata } from 'next'
import Link from 'next/link'
import { GitCompare, MapPin, School as SchoolIcon, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import SchoolComparePicker from '@/components/schools/SchoolComparePicker'
import type { School } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Compare Schools in Nepal', description: 'Compare ECD to Grade 10 schools in Nepal by location, grades offered, ownership, facilities and verified contact information.' }

function value(input: string | number | string[] | null | undefined) { if (Array.isArray(input)) return input.length ? input.join(', ') : 'Not listed'; return input == null || input === '' ? 'Not listed' : String(input) }
function grades(school: School) { if (school.grades_from == null || school.grades_to == null) return 'Not listed'; return `${school.grades_from === 0 ? 'ECD' : `Grade ${school.grades_from}`} to Grade ${school.grades_to}` }
function ownership(input: string | null) { return input === 'institutional' ? 'Private / Institutional' : value(input) }

export default async function CompareSchoolsPage({ searchParams }: { searchParams: { school1?: string; school2?: string; school3?: string } }) {
  const slugs = [searchParams.school1, searchParams.school2, searchParams.school3].filter((item): item is string => Boolean(item)).slice(0, 3)
  const { data } = slugs.length ? await createServerSupabaseClient().from('schools').select('*').in('slug', slugs).eq('status', 'active').or('grades_to.lte.10,grades_to.is.null') : { data: [] }
  const fetched = (data || []) as School[]
  const schools = slugs.map((slug) => fetched.find((school) => school.slug === slug)).filter((school): school is School => Boolean(school))
  const pickerItems = schools.map((school) => ({ id: school.id, name: school.name, slug: school.slug, local_level: school.local_level, district: school.district, province: school.province }))
  const rows: Array<{ label: string; get: (school: School) => string }> = [
    { label: 'Location', get: (school) => value([school.local_level || school.location, school.district, school.province].filter(Boolean) as string[]) },
    { label: 'Grades offered', get: grades },
    { label: 'School level', get: (school) => value(school.school_level?.replaceAll('_', ' ')) },
    { label: 'Ownership', get: (school) => ownership(school.ownership_type) },
    { label: 'Medium of instruction', get: (school) => value(school.medium_of_instruction) },
    { label: 'Facilities', get: (school) => value(school.facilities) },
    { label: 'Students', get: (school) => school.student_count?.toLocaleString() || 'Not listed' },
    { label: 'Teachers', get: (school) => school.teacher_count?.toLocaleString() || 'Not listed' },
    { label: 'Contact', get: (school) => school.phone || school.email || 'Not listed' },
    { label: 'Verification', get: (school) => value(school.verification_status?.replaceAll('_', ' ')) },
  ]

  return <main className="min-h-screen bg-[#f0f4ff]"><section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><nav className="text-sm text-gray-500"><Link href="/schools">Schools</Link> / Compare</nav><div className="mt-4 flex items-start gap-3"><GitCompare className="mt-1 h-7 w-7 text-primary" /><div><h1 className="font-display text-3xl font-extrabold text-ink">Compare schools</h1><p className="mt-2 max-w-2xl text-gray-500">For ECD to Grade 10. Compare only published information, then confirm fees, admissions and transport directly with each school.</p></div></div></div></section><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><SchoolComparePicker initial={pickerItems} />{schools.length ? <><p className="mt-5 text-xs text-gray-500 sm:hidden">Swipe the table sideways to see every school.</p><section className="mt-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white sm:mt-7"><table className="min-w-[720px] w-full text-sm"><thead><tr className="border-b border-gray-200 bg-gray-50"><th className="sticky left-0 z-[1] w-36 bg-gray-50 px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500 sm:w-48 sm:px-5">Compare</th>{schools.map((school) => <th key={school.id} className="min-w-60 px-5 py-4 text-left"><Link href={`/schools/${school.slug}`} className="font-display text-lg font-bold text-ink hover:text-primary">{school.name}</Link><p className="mt-1 flex items-center gap-1 text-xs font-normal text-gray-500"><MapPin className="h-3.5 w-3.5" />{school.district || school.location || 'Location pending'}</p></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label} className="border-b border-gray-100 last:border-0"><th className="sticky left-0 z-[1] bg-gray-50 px-4 py-4 text-left font-semibold text-ink sm:px-5">{row.label}</th>{schools.map((school) => <td key={school.id} className="px-5 py-4 leading-6 text-gray-600">{row.get(school)}</td>)}</tr>)}</tbody></table></section></> : <section className="mt-7 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"><SchoolIcon className="mx-auto h-11 w-11 text-gray-300" /><h2 className="mt-4 font-display text-xl font-bold text-ink">Start with a school</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Search above to compare location, grades, ownership, medium and facilities side by side.</p><Link href="/schools" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Browse schools</Link></section>}<p className="mt-6 flex items-start gap-2 text-xs leading-5 text-gray-500"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />“Source verified” may confirm registry identity and location only. Details marked “Not listed” still need confirmation from the school.</p></div></main>
}
