import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FileText, Calendar, ExternalLink, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Result } from '@/types'

async function getResult(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('results')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .eq('slug', slug)
    .single()
  return data as Result | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getResult(params.slug)
  if (!result) return { title: 'Result Not Found' }
  return {
    title: `${result.title} | SikshyaNepal`,
    description: `Check ${result.title} result published by ${result.university?.name}.`,
  }
}

export default async function ResultDetailPage({ params }: { params: { slug: string } }) {
  const result = await getResult(params.slug)
  if (!result) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/results" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Results
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-2">{result.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {result.university?.short_name}
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
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">University</p>
              <p className="font-semibold text-gray-900 text-sm">{result.university?.short_name}</p>
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

          {result.result_url ? (
            <a
              href={result.result_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Check Result on Official Website
            </a>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              Result link will be available soon. Please check the official university website.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
