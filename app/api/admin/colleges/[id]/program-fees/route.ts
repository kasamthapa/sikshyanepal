import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff, writeAudit } from '@/lib/auth'

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PERIODS=new Set(['monthly','semester','annual','total_program','one_time','unknown'])
const noStore={'Cache-Control':'private, no-store, max-age=0'}

export async function GET(_:Request,{params}:{params:{id:string}}){
  if(!(await isStaff()))return NextResponse.json({error:'Unauthorized'},{status:401,headers:noStore})
  if(!UUID.test(params.id))return NextResponse.json({error:'Invalid college ID.'},{status:400,headers:noStore})
  const{data,error}=await createAdminSupabaseClient().from('college_programs').select('id,fee,fee_period,fee_academic_year,fee_source_url,fee_last_verified_at,program:programs(name,degree_level)').eq('college_id',params.id).order('id')
  if(error)return NextResponse.json({error:error.code==='42703'?'Run migration 20261011 before editing fee evidence.':'Programme fees could not be loaded.'},{status:500,headers:noStore})
  return NextResponse.json(data||[],{headers:noStore})
}

export async function PATCH(request:Request,{params}:{params:{id:string}}){
  if(!(await isStaff()))return NextResponse.json({error:'Unauthorized'},{status:401,headers:noStore})
  if(!UUID.test(params.id))return NextResponse.json({error:'Invalid college ID.'},{status:400,headers:noStore})
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null
  if(!body||!UUID.test(String(body.id||'')))return NextResponse.json({error:'Invalid programme link.'},{status:400,headers:noStore})
  const period=String(body.fee_period||'unknown')
  if(!PERIODS.has(period))return NextResponse.json({error:'Choose a valid fee period.'},{status:400,headers:noStore})
  const fee=body.fee==null||body.fee===''?null:Number(body.fee)
  if(fee!=null&&(!Number.isFinite(fee)||fee<0||fee>100_000_000))return NextResponse.json({error:'Enter a valid fee amount.'},{status:400,headers:noStore})
  const source=String(body.fee_source_url||'').trim()
  if(source&&!/^https:\/\//i.test(source))return NextResponse.json({error:'Fee source must be an HTTPS URL.'},{status:400,headers:noStore})
  const checked=String(body.fee_last_verified_at||'').trim()
  if(checked&&Number.isNaN(new Date(checked).getTime()))return NextResponse.json({error:'Enter a valid checked date.'},{status:400,headers:noStore})
  const row={fee,fee_period:period,fee_academic_year:String(body.fee_academic_year||'').trim().slice(0,30)||null,fee_source_url:source||null,fee_last_verified_at:checked?new Date(checked).toISOString():null}
  const{data,error}=await createAdminSupabaseClient().from('college_programs').update(row).eq('id',String(body.id)).eq('college_id',params.id).select('id').single()
  if(error||!data)return NextResponse.json({error:'Fee evidence could not be saved.'},{status:500,headers:noStore})
  await writeAudit('college_program.fee_update','college',params.id,{college_program_id:body.id,fee_period:period,has_source:Boolean(source),checked_at:row.fee_last_verified_at})
  return NextResponse.json({success:true},{headers:noStore})
}
