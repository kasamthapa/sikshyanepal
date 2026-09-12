import { Metadata } from 'next'
import { Fragment } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import NoticeCard from '@/components/notices/NoticeCard'
import SearchBar from '@/components/ui/SearchBar'
import type { Notice } from '@/types'
import { Bell, RefreshCcw } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Notices Nepal | Admission, Exam & Results',
  description: 'Latest notices from TU, KU, PU and all universities in Nepal. Stay updated with admission deadlines and exam notices.',
}

const UNIVERSITIES = ['TU', 'KU', 'PU', 'PurU', 'NEB', 'CTEVT']

async function getNotices(sp: { q?: string; university?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('notices')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .order('published_date', { ascending: false })

  if (sp.q) query = query.ilike('title', `%${sp.q}%`)

  const { data } = await query.limit(100)
  let notices = (data || []) as Notice[]

  if (sp.university) {
    notices = notices.filter(
      (n) => n.university?.short_name?.toLowerCase() === sp.university?.toLowerCase()
    )
  }

  return notices
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: { q?: string; university?: string }
}) {
  const notices   = await getNotices(searchParams)
  const hasFilter = !!(searchParams.university || searchParams.q)

  function filterUrl(university: string) {
    const p = new URLSearchParams()
    if (searchParams.q) p.set('q', searchParams.q)
    if (university)     p.set('university', university)
    const s = p.toString()
    return `/notices${s ? `?${s}` : ''}`
  }

  return (
    <div className="bg-[#f0f4ff] min-h-screen">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">University Notices</p>
          <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-2"
              style={{ letterSpacing: '-0.025em' }}>
            Official Notices
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Admission deadlines, exam schedules and official announcements from Nepal&apos;s universities
          </p>
          <SearchBar placeholder="Search notices..." redirectTo="/notices" />
        </div>

        {/* University chips */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
          <div className="flex flex-wrap gap-2">
            <Link href="/notices" className={!searchParams.university ? 'chip-active' : 'chip-inactive'}>
              All
            </Link>
            {UNIVERSITIES.map((u) => (
              <Link key={u} href={filterUrl(u)} className={searchParams.university === u ? 'chip-active' : 'chip-inactive'}>
                {u}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Notices list ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Count */}
        <p className="mb-4 text-sm text-gray-500 tabular-nums">
          <span className="font-bold text-ink">{notices.length}</span>{' '}
          notice{notices.length !== 1 ? 's' : ''} found
          {searchParams.q && <> for &ldquo;{searchParams.q}&rdquo;</>}
        </p>

        {notices.length > 0 ? (
          <div className="space-y-2.5">
            {notices.map((notice, idx) => (
              <Fragment key={notice.id}>
                <NoticeCard notice={notice} />
                {idx === 4 && (
                  <AdUnit
                    key="ad-notices"
                    slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS ?? ''}
                    format="auto"
                    className="my-1 rounded-xl border border-gray-200 bg-white min-h-[90px]"
                  />
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-ink mb-2">No notices found</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              {hasFilter
                ? 'Try removing some filters or searching with different keywords.'
                : 'New notices will appear here as soon as they are published.'}
            </p>
            {hasFilter && (
              <Link href="/notices" className="btn-primary text-sm inline-flex">
                <RefreshCcw className="w-4 h-4" />
                Clear all filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
