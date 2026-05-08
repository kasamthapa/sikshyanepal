import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import CollegeForm from '@/components/admin/CollegeForm'

export default async function EditCollegePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('colleges').select('*').eq('id', params.id).single()
  if (!data) notFound()

  return (
    <CollegeForm
      initialData={{
        ...data,
        established_year: data.established_year?.toString() || '',
      }}
      collegeId={params.id}
      isEdit
    />
  )
}
