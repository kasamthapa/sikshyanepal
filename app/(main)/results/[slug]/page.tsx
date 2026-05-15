import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FileText, Calendar, ExternalLink, ArrowLeft, Globe, Download, ZoomIn } from 'lucide-react'
import NextImage from 'next/image'
import { formatDate } from '@/lib/utils'
import type { Result } from '@/types'
import PdfViewer from '@/components/results/PdfViewer'

const BASE_URL = 'https://sikshyanepal.vercel.app'

const UNIVERSITY_HOMEPAGES: Record<string, string> = {
  TU:    'https://tribhuvan-university.edu.np',
  KU:    'https://ku.edu.np',
  NEB:   'https://neb.gov.np',
  CTEVT: 'https://ctevt.org.np',
  PU:    'https://pu.edu.np',
}

async function getResult(slug: string) {
  const supabase = createServerSupabaseClient()
  const decoded  = decodeURIComponent(slug)
  const { data } = await supabase
    .from('results')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .eq('slug', decoded)
    .single()
  return data as Result | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getResult(params.slug)
  if (!result) return { title: 'Result Not Found' }
  return {
    title:       `${result.title} | SikshyaNepal`,
    description: `Check ${result.title} result published by ${result.university?.name}. Program: ${result.program || 'All'}. Semester: ${result.semester || 'All'}.`,
    openGraph: {
      title:       `${result.title} | SikshyaNepal`,
      description: `${result.university?.name} result - ${result.program || ''} ${result.semester || ''}`,
      url:         `${BASE_URL}/results/${result.slug}`,
    },
    alternates: { canonical: `${BASE_URL}/results/${result.slug}` },
  }
}

export default async function ResultDetailPage({ params }: { params: { slug: string } }) {
  const result = await getResult(params.slug)
  if (!result) notFound()

  const contentType = result.content_type
  const hasPdf      = contentType === 'pdf' && !!result.result_pdf_url
  const hasImage    = contentType === 'image' && !!result.result_pdf_url
  const uniSlug     = result.university?.short_name

  const jsonLd = {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      result.title,
    datePublished: result.published_date,
    publisher: {
      '@type': 'Organization',
      name:    result.university?.name,
      url:     result.university?.website,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':   `${BASE_URL}/results/${result.slug}`,
    },
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Script
        id="result-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/results"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Results
      </Link>

      {/* ── Header card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold mb-2">{result.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {uniSlug}
                </span>
                {result.program && (
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    {result.program}
                  </span>
                )}
                {result.semester && (
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    {result.semester}
                  </span>
                )}
                {result.year && (
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    {result.year}
                  </span>
                )}
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
          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">University</p>
              <p className="font-semibold text-gray-900 text-sm">{uniSlug}</p>
            </div>
            {result.program && (
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Program</p>
                <p className="font-semibold text-gray-900 text-sm">{result.program}</p>
              </div>
            )}
            {result.semester && (
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Semester</p>
                <p className="font-semibold text-gray-900 text-sm">{result.semester}</p>
              </div>
            )}
            {result.year && (
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Year</p>
                <p className="font-semibold text-gray-900 text-sm">{result.year}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Calendar className="w-4 h-4" />
            <span>Published on {formatDate(result.published_date)}</span>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {hasPdf && (
                <a
                  href={result.result_pdf_url!}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              )}
              {hasImage && (
                <a
                  href={result.result_pdf_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                  View Full Size
                </a>
              )}
              {result.result_url && (
                <a
                  href={result.result_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-colors ${
                    hasPdf
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <ExternalLink className="w-5 h-5" />
                  {hasPdf ? 'View on Official Website' : 'Check Result on Official Website'}
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
            {!result.result_url && !hasPdf && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                Result link will be available soon. Please check the official university website.
              </div>
            )}
            {(result.result_url || hasPdf) && (
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
          <h2 className="text-base font-semibold text-gray-900 mb-3">Result PDF</h2>
          <PdfViewer pdfUrl={result.result_pdf_url!} title={result.title} />
        </div>
      )}

      {/* ── Inline image viewer ───────────────────────────────────────── */}
      {hasImage && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Result Image</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <div className="relative w-full" style={{ minHeight: '400px' }}>
              <NextImage
                src={result.result_pdf_url!}
                alt={result.title}
                fill
                className="object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized   // university PDFs/images may be on external domains
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
              <a
                href={result.result_pdf_url!}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <a
                href={result.result_pdf_url!}
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
