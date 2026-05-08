import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import NoticeForm from '@/components/admin/NoticeForm'

export default async function EditNoticePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('notices').select('*').eq('id', params.id).single()
  if (!data) notFound()
  return <NoticeForm initialData={{ ...data, published_date: data.published_date?.split('T')[0] }} noticeId={params.id} isEdit />
}
