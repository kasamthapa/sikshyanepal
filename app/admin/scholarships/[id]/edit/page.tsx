import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import ScholarshipForm from '@/components/admin/ScholarshipForm'

export default async function EditScholarshipPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('scholarships').select('*').eq('id', params.id).single()
  if (!data) notFound()
  return <ScholarshipForm initialData={{ ...data, amount: data.amount?.toString() || '', deadline: data.deadline?.split('T')[0] || '' }} scholarshipId={params.id} isEdit />
}
