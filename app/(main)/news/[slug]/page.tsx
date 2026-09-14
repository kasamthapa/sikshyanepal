import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ArrowLeft, Calendar, User, Download, ExternalLink, ShieldCheck, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { News } from '@/types'
import PdfViewer from '@/components/results/PdfViewer'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema, SITE_URL } from '@/lib/seo'

const BASE_URL = SITE_URL

async function getNews(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('news').select('*').eq('slug', slug).eq('status', 'published').single()
  return data as News | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const news = await getNews(params.slug)
  if (!news) return { title: 'News Not Found' }
  return {
    title:       news.title,
    description: news.content?.slice(0, 160),
    openGraph:   { images: news.image_url ? [news.image_url] : [] },
    alternates: { canonical: `/news/${news.slug}` },
  }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const news = await getNews(params.slug)
  if (!news) notFound()

  const hasPdf = news.content_type === 'pdf' && !!news.news_pdf_url
  const pageUrl = absoluteUrl(`/news/${news.slug}`)
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'NewsArticle', '@id': `${pageUrl}#article`, headline: news.title, articleSection: news.content_category?.replaceAll('_', ' ') || 'College news', keywords: news.education_levels?.join(', '), description: news.content?.slice(0, 300) || undefined, datePublished: news.published_date || undefined, dateModified: news.updated_at || news.created_at || news.published_date || undefined, mainEntityOfPage: { '@id': `${pageUrl}#webpage` }, image: news.image_url ? [news.image_url] : undefined, author: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: news.author_name || 'SikshyaNepal Editorial' }, publisher: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'SikshyaNepal', logo: { '@type': 'ImageObject', url: `${BASE_URL}/og-image.png` } }, citation: news.source_url || undefined },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: news.title, mainEntity: { '@id': `${pageUrl}#article` }, isPartOf: { '@id': `${BASE_URL}/#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Education news', path: '/news' }, { name: news.title, path: `/news/${news.slug}` }]),
  ] }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={jsonLd} />
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to News
      </Link>

      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
        {news.image_url && (
          <div className="relative h-64 sm:h-80">
            <Image src={news.image_url} alt={news.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {news.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            {news.published_date && <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <time dateTime={news.published_date}>{formatDate(news.published_date)}</time>
            </span>}
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" aria-hidden="true" />
              {news.author_name || 'SikshyaNepal'}
            </span>
            {hasPdf && (
              <a
                href={news.news_pdf_url!}
                download
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            )}
          </div>
          {news.content && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
                {news.content}
              </p>
            </div>
          )}
          {news.college_id && <p className="mt-6 flex items-center gap-2 text-sm text-gray-600"><Building2 className="h-4 w-4 text-primary" />This update is linked to a college profile in the SikshyaNepal directory.</p>}
          {news.disclosure && <p className="mt-4 border-l-2 border-gray-300 pl-3 text-xs leading-5 text-gray-600">{news.disclosure}</p>}
          {(news.source_url || news.last_verified_at) && <section className="mt-7 border-t border-gray-200 pt-5 text-sm" aria-label="Source information"><p className="flex items-center gap-2 font-semibold text-ink"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />{news.source_url ? 'Source summary' : 'Publication information'}</p>{news.source_url && <p className="mt-2 max-w-2xl text-gray-600">Summary based on the linked official announcement. Check the source for final details.</p>}{news.last_verified_at && <p className="mt-2 text-gray-600">Checked <time dateTime={news.last_verified_at}>{formatDate(news.last_verified_at)}</time></p>}{news.source_url && <a href={news.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary">{news.source_name || 'Open official source'} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}</section>}
        </div>
      </article>

      {/* ── Embedded PDF (official circular attached to news) ─────────── */}
      {hasPdf && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Attached Document</h2>
          <PdfViewer pdfUrl={news.news_pdf_url!} title={news.title} />
        </div>
      )}
    </div>
  )
}
