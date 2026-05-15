import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Bell, Calendar, ExternalLink, ArrowLeft, Globe, Download, ZoomIn } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Notice } from '@/types'
import PdfViewer from '@/components/results/PdfViewer'

const BASE_URL = 'https://sikshyanepal.vercel.app'

const UNIVERSITY_HOMEPAGES: Record<string, string> = {
  TU:    'https://tribhuvan-university.edu.np',
  KU:    'https://ku.edu.np',
  NEB:   'https://neb.gov.np',
  CTEVT: 'https://ctevt.org.np',
  PU:    'https://pu.edu.np',
}

async function getNotice(slug: string) {
  const supabase = createServerSupabaseClient()
  const decoded  = decodeURIComponent(slug)
  const { data } = await supabase
    .from('notices')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .eq('slug', decoded)
    .single()
  return data as Notice | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const notice = await getNotice(params.slug)
  if (!notice) return { title: 'Notice Not Found' }
  return {
    title:       `${notice.title} | SikshyaNepal`,
    description: notice.content?.slice(0, 160) || `Notice from ${notice.university?.name}`,
    alternates:  { canonical: `${BASE_URL}/notices/${notice.slug}` },
  }
}

export default async function NoticeDetailPage({ params }: { params: { slug: string } }) {
  const notice = await getNotice(params.slug)
  if (!notice) notFound()

  const contentType = notice.content_type
  const hasPdf      = contentType === 'pdf'  && !!notice.notice_pdf_url
  const hasImage    = contentType === 'image' && !!notice.notice_pdf_url
  const uniSlug     = notice.university?.short_name

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/notices"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Notices
      </Link>

      {/* ── Header card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-orange-100 mb-1">{notice.university?.name}</p>
              <h1 className="text-xl font-bold mb-2">{notice.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {hasPdf && (
                  <span className="bg-green-500/80 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    PDF Available
                  </span>
                )}
                {hasImage && (
                  <span className="bg-blue-400/80 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    Image Available
                  </span>
                )}
              </div>
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

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {hasPdf && (
                <a
                  href={notice.notice_pdf_url!}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              )}
              {hasImage && (
                <a
                  href={notice.notice_pdf_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                  View Full Size
                </a>
              )}
              {notice.notice_url && (
                <a
                  href={notice.notice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-colors ${
                    hasPdf || hasImage
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <ExternalLink className="w-5 h-5" />
                  {hasPdf || hasImage ? 'View on Official Website' : 'View Original Notice'}
                </a>
              )}
              {uniSlug && UNIVERSITY_HOMEPAGES[uniSlug] && (
                <a
                  href={UNIVERSITY_HOMEPAGES[uniSlug]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  {uniSlug} Official Site
                </a>
              )}
            </div>
            {(notice.notice_url || hasPdf || hasImage) && (
              <p className="text-xs text-gray-400">
                External links may occasionally be unavailable. Use the official site link if needed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Embedded PDF viewer ───────────────────────────────────────── */}
      {hasPdf && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Notice PDF</h2>
          <PdfViewer pdfUrl={notice.notice_pdf_url!} title={notice.title} />
        </div>
      )}

      {/* ── Inline image viewer ───────────────────────────────────────── */}
      {hasImage && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Notice Image</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <div className="relative w-full" style={{ minHeight: '400px' }}>
              <NextImage
                src={notice.notice_pdf_url!}
                alt={notice.title}
                fill
                className="object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
              <a
                href={notice.notice_pdf_url!}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <a
                href={notice.notice_pdf_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                Full size
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
