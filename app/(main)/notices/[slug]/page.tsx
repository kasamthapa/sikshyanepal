import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Bell, Calendar, ExternalLink, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Notice } from '@/types'

async function getNotice(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('notices')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .eq('slug', slug)
    .single()
  return data as Notice | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const notice = await getNotice(params.slug)
  if (!notice) return { title: 'Notice Not Found' }
  return {
    title: `${notice.title} | SikshyaNepal`,
    description: notice.content?.slice(0, 160) || `Notice from ${notice.university?.name}`,
  }
}

export default async function NoticeDetailPage({ params }: { params: { slug: string } }) {
  const notice = await getNotice(params.slug)
  if (!notice) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/notices" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Notices
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-100 mb-1">{notice.university?.name}</p>
              <h1 className="text-xl font-bold">{notice.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Calendar className="w-4 h-4" />
            <span>Published on {formatDate(notice.published_date)}</span>
          </div>

          {notice.content && (
            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{notice.content}</p>
            </div>
          )}

          {notice.notice_url && (
            <a
              href={notice.notice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              View Original Notice
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
