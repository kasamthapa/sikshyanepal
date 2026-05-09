import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import SearchBar from '@/components/ui/SearchBar'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { formatDateShort } from '@/lib/utils'
import type { News } from '@/types'
import { Newspaper, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Education News Nepal | SikshyaNepal',
  description: 'Latest education news from Nepal. Stay updated with policy changes, exam announcements, and more.',
}

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Education News</h1>
        </div>
        <p className="text-gray-500">Latest updates from Nepal&apos;s education sector</p>
      </div>

      <div className="mb-6">
        <SearchBar placeholder="Search news..." redirectTo="/news" />
      </div>

      {newsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <Link key={news.id} href={`/news/${news.slug}`} className="group block">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="relative h-44 bg-gradient-to-br from-blue-50 to-blue-100">
                  {news.image_url ? (
                    <Image src={news.image_url} alt={news.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-blue-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                    {news.title}
                  </h2>
                  {news.content && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{news.content}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateShort(news.published_date)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No news found</h3>
          <p className="text-sm text-gray-500">Check back later</p>
        </div>
      )}
    </div>
  )
}
