import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' }
type SearchRow = { id?: unknown; title?: unknown; name?: unknown; institution_name?: unknown }

function normaliseQuery(value: string | null) {
  return (value || '')
    .normalize('NFKC')
    .replace(/[%_(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function rankByText<T>(items: T[], text: (item: T) => string, query: string) {
  const needle = query.toLocaleLowerCase()
  return [...items].sort((a, b) => {
    const left = text(a).toLocaleLowerCase()
    const right = text(b).toLocaleLowerCase()
    const leftRank = left === needle ? 0 : left.startsWith(needle) ? 1 : 2
    const rightRank = right === needle ? 0 : right.startsWith(needle) ? 1 : 2
    return leftRank - rightRank || left.localeCompare(right)
  })
}

export async function GET(request: Request) {
  const query = normaliseQuery(new URL(request.url).searchParams.get('q'))
  if (query.length < 2) return NextResponse.json({ error: 'Enter at least two characters to search.' }, { status: 400, headers: noStore })

  const db = createServerSupabaseClient()
  const pattern = `%${query}%`
  const sections = [
    ['admissions', db.from('admissions').select('id,title,slug,institution_name,application_deadline').eq('status', 'published').or(`title.ilike.${pattern},institution_name.ilike.${pattern}`).order('application_deadline', { ascending: true, nullsFirst: false }).limit(8)],
    ['schools', db.from('schools').select('id,name,slug,district,province,verification_status').eq('status', 'active').ilike('name', pattern).order('name').limit(8)],
    ['colleges', db.from('colleges').select('id,name,slug,location,affiliation').or('status.eq.active,status.is.null').ilike('name', pattern).order('name').limit(8)],
    ['programs', db.from('programs').select('id,name,slug,faculty,duration').or(`name.ilike.${pattern},faculty.ilike.${pattern}`).order('name').limit(8)],
    ['news', db.from('news').select('id,title,slug,published_date').eq('status', 'published').ilike('title', pattern).order('published_date', { ascending: false }).limit(10)],
    ['notices', db.from('notices').select('id,title,slug,published_date').ilike('title', pattern).order('published_date', { ascending: false }).limit(10)],
    ['results', db.from('results').select('id,title,slug,published_date').ilike('title', pattern).order('published_date', { ascending: false }).limit(10)],
    ['scholarships', db.from('scholarships').select('id,title,amount,deadline').eq('is_active', true).or(`title.ilike.${pattern},description.ilike.${pattern}`).order('deadline', { ascending: true, nullsFirst: false }).limit(6)],
  ] as const

  const settled = await Promise.allSettled(sections.map(([, operation]) => operation))
  const unavailable: string[] = []
  const values: Record<string, SearchRow[]> = {}
  settled.forEach((result, index) => {
    const name = sections[index][0]
    if (result.status === 'rejected' || result.value.error) {
      unavailable.push(name)
      values[name] = []
      console.error(`[public-search:${name}]`, result.status === 'rejected' ? result.reason : result.value.error)
      return
    }
    values[name] = result.value.data || []
  })

  let programColleges: SearchRow[] = []
  const programIds = values.programs.map(program => String(program.id || '')).filter(Boolean)
  if (programIds.length) {
    const joined = await db.from('college_programs').select('college:colleges!inner(id,name,slug,location,affiliation,status)').in('program_id', programIds).eq('college.status', 'active').limit(20)
    if (joined.error) {
      unavailable.push('college programme links')
      console.error('[public-search:college-programmes]', joined.error)
    } else {
      programColleges = (joined.data || []).flatMap(item => Array.isArray(item.college) ? item.college : item.college ? [item.college] : [])
    }
  }

  const colleges = [...values.colleges, ...programColleges].filter((college, index, all) => all.findIndex(item => item.id === college.id) === index)
  const result = {
    admissions: rankByText(values.admissions, item => `${String(item.title || '')} ${String(item.institution_name || '')}`, query),
    schools: rankByText(values.schools, item => String(item.name || ''), query),
    colleges: rankByText(colleges, item => String(item.name || ''), query).slice(0, 12),
    programs: rankByText(values.programs, item => String(item.name || ''), query),
    news: values.news.slice(0, 6),
    notices: values.notices.slice(0, 6),
    results: values.results.slice(0, 6),
    scholarships: rankByText(values.scholarships, item => String(item.title || ''), query),
    unavailable,
  }
  return NextResponse.json(result, { headers: noStore })
}
