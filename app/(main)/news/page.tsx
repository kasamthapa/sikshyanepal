import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import SearchBar from '@/components/ui/SearchBar'
import { formatDateShort } from '@/lib/utils'
import type { News } from '@/types'
import { Calendar, Newspaper } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Education News Nepal | SikshyaNepal',
  description: 'Latest education news from Nepal. Stay updated with policy changes, exam announcements, and more.',
}

// Intentional gradient palette — each card gets a different one
const CARD_GRADIENTS = [
  { from: 'from-blue-600',    to: 'to-indigo-700',  text: 'text-blue-100',   label: 'bg-blue-500/30' },
  { from: 'from-violet-600',  to: 'to-purple-700',  text: 'text-violet-100', label: 'bg-violet-500/30' },
  { from: 'from-emerald-600', to: 'to-teal-700',    text: 'text-emerald-100',label: 'bg-emerald-500/30' },
  { from: 'from-orange-500',  to: 'to-rose-600',    text: 'text-orange-100', label: 'bg-orange-500/30' },
  { from: 'from-sky-600',     to: 'to-cyan-700',    text: 'text-sky-100',    label: 'bg-sky-500/30' },
  { from: 'from-rose-600',    to: 'to-pink-700',    text: 'text-rose-100',   label: 'bg-rose-500/30' },
]

async function getNews(searchParams: { q?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('news').select('*').order('published_date', { ascending: false })
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)
  const { data } = await query.limit(30)
  return (data || []) as News[]
}

export default async function NewsPage({ searchParams }: { searchParams: { q?: string } }) {
  const newsList = await getNews(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8">
        <p className="section-label">EDUCATION NEWS</p>
        <h1 className="section-heading">Latest Updates</h1>
        <p className="text-ink-secondary text-sm mt-1">
          Policy changes, exam announcements, and education news from Nepal
        </p>
      </div>

      <div className="mb-6">
        <SearchBar placeholder="Search news..." redirectTo="/news" />
      </div>

      {newsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {newsList.map((news, idx) => {
            const grad   = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
            // First two initials of the title for the large background letter
            const initial = news.title.charAt(0).toUpperCase()

            return (
              <Link key={news.id} href={`/news/${news.slug}`} className="group block">
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card
                                hover:shadow-card-xl hover:-translate-y-1 transition-all duration-200">

                  {/* ── Cover / Placeholder ─────────────────── */}
                  <div className="relative h-40 overflow-hidden flex-shrink-0">
                    {news.image_url ? (
                      <Image
                        src={news.image_url}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      /* Intentional gradient placeholder — never looks broken */
                      <div className={`w-full h-full bg-gradient-to-br ${grad.from} ${grad.to} relative flex items-center justify-center overflow-hidden`}>
                        {/* Dot grid texture */}
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                            backgroundSize: '20px 20px',
                          }}
                        />
                        {/* Giant initial letter watermark */}
                        <span className={`absolute right-4 bottom-0 text-[80px] font-black leading-none ${grad.text} opacity-20 select-none`}>
                          {initial}
                        </span>
                        {/* "S" logo mark */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <span className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-lg font-black">
                            S
                          </span>
                          <span className={`text-xs font-semibold ${grad.text} opacity-80 tracking-wide`}>
                            SikshyaNepal
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Content ─────────────────────────────── */}
                  <div className="p-4">
                    <h2 className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-2
                                   group-hover:text-brand-600 transition-colors">
                      {news.title}
                    </h2>
                    {news.content && (
                      <p className="text-xs text-ink-secondary line-clamp-2 mb-3 leading-relaxed">
                        {news.content}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateShort(news.published_date)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-7 h-7 text-ink-muted" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">No news found</h3>
          <p className="text-sm text-ink-secondary">Check back later for the latest updates</p>
        </div>
      )}
    </div>
  )
}
