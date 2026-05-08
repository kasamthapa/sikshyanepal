import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { BookOpen, Clock, ArrowLeft, Building2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import type { Program, CollegeProgram } from '@/types'

async function getProgram(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data: program } = await supabase.from('programs').select('*').eq('slug', slug).single()
  if (!program) return null

  const { data: colleges } = await supabase
    .from('college_programs')
    .select('*, college:colleges(*)')
    .eq('program_id', program.id)
    .limit(20)

  return { program: program as Program, colleges: (colleges || []) as CollegeProgram[] }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProgram(params.slug)
  if (!data) return { title: 'Program Not Found' }
  return {
    title: `${data.program.name} | SikshyaNepal`,
    description: `Find colleges offering ${data.program.name} in Nepal. Compare fees, seats, and more.`,
  }
}

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProgram(params.slug)
  if (!data) notFound()

  const { program, colleges } = data

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue" className="capitalize">{program.degree_level}</Badge>
              <Badge variant="gray">{program.faculty}</Badge>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-3.5 h-3.5" /> {program.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Colleges offering {program.name}
          </h2>
          <Badge variant="gray">{colleges.length}</Badge>
        </div>

        {colleges.length > 0 ? (
          <div className="space-y-3">
            {colleges.map((cp) => (
              <Link key={cp.college_id} href={`/colleges/${cp.college?.slug}`} className="group block">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-gray-50 hover:bg-white">
                  <div>
                    <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {cp.college?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{cp.college?.location}</span>
                      {cp.college?.affiliation && (
                        <Badge variant="gray">{cp.college.affiliation}</Badge>
                      )}
                      {cp.scholarship_available && <Badge variant="green">Scholarship</Badge>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {cp.fee && (
                      <p className="font-semibold text-gray-900 text-sm">NPR {cp.fee.toLocaleString()}</p>
                    )}
                    {cp.seats && (
                      <p className="text-xs text-gray-500">{cp.seats} seats</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No colleges listed for this program yet.</p>
        )}
      </div>
    </div>
  )
}
