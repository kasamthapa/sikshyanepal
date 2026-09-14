import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, ExternalLink } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { formatDateShort } from '@/lib/utils'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema, SITE_URL } from '@/lib/seo'
import { COLLEGE_NEWS_TOPICS, isCollegeNewsTopic } from '@/lib/college-news'
import type { News } from '@/types'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return Object.keys(COLLEGE_NEWS_TOPICS).map(topic => ({ topic }))
}

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  if (!isCollegeNewsTopic(params.topic)) return {}
  const topic = COLLEGE_NEWS_TOPICS[params.topic]
  return { title: topic.title, description: topic.description, alternates: { canonical: `/news/topic/${params.topic}` }, openGraph: { title: topic.title, description: topic.description, url: `/news/topic/${params.topic}`, type: 'website' } }
}

export default async function CollegeNewsTopicPage({ params }: { params: { topic: string } }) {
  if (!isCollegeNewsTopic(params.topic)) notFound()
  const topic = COLLEGE_NEWS_TOPICS[params.topic]
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('news').select('*').eq('status', 'published').eq('content_category', topic.category).order('published_date', { ascending: false }).limit(40)
  const articles = (data || []) as News[]
  const pageUrl = absoluteUrl(`/news/topic/${params.topic}`)
  const structured = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${pageUrl}#page`, url: pageUrl, name: topic.title, description: topic.description, isPartOf: { '@id': `${SITE_URL}/#website` }, mainEntity: { '@id': `${pageUrl}#articles` } },
    { '@type': 'ItemList', '@id': `${pageUrl}#articles`, numberOfItems: articles.length, itemListElement: articles.map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/news/${article.slug}`), name: article.title })) },
    { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: `How does SikshyaNepal verify ${topic.label.toLowerCase()}?`, acceptedAnswer: { '@type': 'Answer', text: topic.answer } }] },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'College news', path: '/news' }, { name: topic.label, path: `/news/topic/${params.topic}` }]),
  ] }

  return <main className="min-h-screen bg-[#f8f7f3]">
    <JsonLd data={structured} />
    <header className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><nav className="mb-5 text-sm text-gray-500"><Link href="/news" className="hover:text-primary">College news</Link> <span aria-hidden="true">/</span> {topic.label}</nav><h1 className="max-w-4xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{topic.title}</h1><p className="mt-4 max-w-3xl leading-7 text-gray-600">{topic.description}</p><div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950"><strong>How to use this page:</strong> {topic.answer}</div></div></header>
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-ink">Latest verified updates</h2><span className="text-sm text-gray-500">{articles.length} article{articles.length === 1 ? '' : 's'}</span></div>
      {articles.length ? <div className="grid gap-5 md:grid-cols-2">{articles.map(article => <article key={article.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar className="h-3.5 w-3.5" />{formatDateShort(article.published_date)}</p><h2 className="mt-3 text-lg font-semibold leading-snug text-ink"><Link href={`/news/${article.slug}`} className="hover:text-primary">{article.title}</Link></h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{article.content}</p><Link href={`/news/${article.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Read verified update <ExternalLink className="h-3.5 w-3.5" /></Link></article>)}</div> : <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center"><h2 className="font-semibold text-ink">No verified updates yet</h2><p className="mt-2 text-sm text-gray-500">The newsroom will add an item after its source and claims pass the publication rules.</p></div>}
    </div>
  </main>
}
