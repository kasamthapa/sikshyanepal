import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { News } from '@/types'

async function getNews(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('news').select('*').eq('slug', slug).single()
  return data as News | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const news = await getNews(params.slug)
  if (!news) return { title: 'News Not Found' }
  return {
    title: `${news.title} | SikshyaNepal`,
    description: news.content?.slice(0, 160),
    openGraph: { images: news.image_url ? [news.image_url] : [] },
  }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const news = await getNews(params.slug)
  if (!news) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to News
      </Link>

      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {news.image_url && (
          <div className="relative h-64 sm:h-80">
            <Image src={news.image_url} alt={news.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">{news.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(news.published_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              SikshyaNepal Editorial
            </span>
          </div>
          {news.content && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base">{news.content}</p>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
