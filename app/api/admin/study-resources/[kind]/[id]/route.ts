import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const tables = { syllabus: 'syllabus', question: 'old_questions' } as const
type ResourceKind = keyof typeof tables

function tableFor(kind: string) {
  return kind in tables ? tables[kind as ResourceKind] : null
}
function validUrl(value: unknown) { if(typeof value!=='string')return false;try{return ['http:','https:'].includes(new URL(value).protocol)}catch{return false} }

export async function PATCH(request: Request, { params }: { params: { kind: string; id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const table = tableFor(params.kind)
  if (!table) return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 })
  let is_published: unknown
  try { const body: unknown=await request.json();if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();is_published=(body as {is_published?:unknown}).is_published } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
  if (typeof is_published !== 'boolean') return NextResponse.json({ error: 'Invalid publication status' }, { status: 400 })
  const db=createAdminSupabaseClient()
  if(is_published){const {data:item,error:readError}=await db.from(table).select('file_url,source_url').eq('id',params.id).maybeSingle();if(readError||!item)return NextResponse.json({error:'Resource not found.'},{status:404});if(!validUrl(item.file_url)||!validUrl(item.source_url))return NextResponse.json({error:'A valid file and official source are required before publishing.'},{status:400})}
  const { data, error } = await db.from(table).update({ is_published, last_verified_at: new Date().toISOString() }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('study_resource.publish', params.kind, params.id, { is_published })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { kind: string; id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const table = tableFor(params.kind)
  if (!table) return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 })
  const { error } = await createAdminSupabaseClient().from(table).delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('study_resource.delete', params.kind, params.id)
  return NextResponse.json({ success: true })
}
