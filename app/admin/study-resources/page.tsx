'use client'

import { FormEvent, useEffect, useState } from 'react'
import { BookMarked, ExternalLink, Plus, Trash2 } from 'lucide-react'

type Option = { id: string; name: string; short_name?: string | null }
type Resource = { id: string; kind: 'syllabus' | 'question'; title?: string; subject?: string; semester?: string | null; year?: number | null; file_url: string; source_url: string; is_published: boolean; program?: Option; university?: Option }
const empty = { kind: 'syllabus', program_id: '', university_id: '', title: '', semester: '', year: '', file_url: '', source_url: '', is_published: false }

export default function AdminStudyResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [programs, setPrograms] = useState<Option[]>([])
  const [universities, setUniversities] = useState<Option[]>([])
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const field = 'rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500'
  const load = () => fetch('/api/admin/study-resources', { cache: 'no-store' }).then(r => r.json()).then(data => {
    if (data.error) return setMessage(data.error)
    setResources(data.resources || []); setPrograms(data.programs || []); setUniversities(data.universities || [])
  })
  useEffect(() => { load() }, [])

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('')
    const payload = { ...form, [form.kind === 'syllabus' ? 'title' : 'subject']: form.title }
    const response = await fetch('/api/admin/study-resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await response.json(); setSaving(false)
    if (!response.ok) return setMessage(data.error || 'Could not save resource')
    setForm(empty); setMessage('Resource saved.'); load()
  }
  async function toggle(item: Resource) { setMessage(''); const response=await fetch(`/api/admin/study-resources/${item.kind}/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_published: !item.is_published }) });const data=await response.json().catch(()=>({}));if(!response.ok)return setMessage(data.error||'Could not update publication status.');setMessage(item.is_published?'Resource moved to draft.':'Resource published.');load() }
  async function remove(item: Resource) { if (!window.confirm('Delete this resource?')) return;setMessage('');const response=await fetch(`/api/admin/study-resources/${item.kind}/${item.id}`, { method: 'DELETE' });const data=await response.json().catch(()=>({}));if(!response.ok)return setMessage(data.error||'Could not delete resource.');setMessage('Resource deleted.');load() }

  return <div className="p-8 text-gray-100"><div className="mb-6"><h1 className="flex items-center gap-2 text-2xl font-bold"><BookMarked className="h-6 w-6 text-cyan-400"/>Study Resources</h1><p className="mt-1 text-sm text-gray-400">Manage official syllabi and past question papers. Verify the source before publishing.</p></div>
    <form onSubmit={submit} className="mb-8 grid gap-3 rounded-xl border border-gray-700 bg-gray-800 p-5 md:grid-cols-2"><select className={field} value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}><option value="syllabus">Syllabus</option><option value="question">Past question paper</option></select><select required className={field} value={form.university_id} onChange={e=>setForm({...form,university_id:e.target.value})}><option value="">Choose university *</option>{universities.map(x=><option key={x.id} value={x.id}>{x.short_name||x.name}</option>)}</select><select required className={field} value={form.program_id} onChange={e=>setForm({...form,program_id:e.target.value})}><option value="">Choose program *</option>{programs.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><input required className={field} placeholder={form.kind==='syllabus'?'Syllabus title *':'Subject / paper title *'} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input className={field} placeholder="Semester or year level" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})}/>{form.kind==='question'&&<input type="number" min="1990" max="2100" className={field} placeholder="Question year" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/>}<input required type="url" className={`${field} md:col-span-2`} placeholder="Direct PDF / file URL *" value={form.file_url} onChange={e=>setForm({...form,file_url:e.target.value})}/><input required type="url" className={`${field} md:col-span-2`} placeholder="Official page proving this resource *" value={form.source_url} onChange={e=>setForm({...form,source_url:e.target.value})}/><label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})}/>Publish after saving</label><button disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold disabled:opacity-60"><Plus className="h-4 w-4"/>{saving?'Saving…':'Add resource'}</button>{message&&<p className="md:col-span-2 text-sm text-amber-300">{message}</p>}</form>
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800"><div className="border-b border-gray-700 px-5 py-4 font-bold">{resources.length} resources</div>{resources.map(item=><div key={`${item.kind}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700/60 px-5 py-4 last:border-0"><div><p className="font-semibold text-white">{item.title||item.subject}</p><p className="mt-1 text-xs text-gray-400">{item.kind==='syllabus'?'Syllabus':`Past question${item.year?` · ${item.year}`:''}`} · {item.program?.name} · {item.university?.short_name||item.university?.name}</p></div><div className="flex items-center gap-2"><a href={item.source_url} target="_blank" rel="noopener noreferrer" title="Check official source" className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-white"><ExternalLink className="h-4 w-4"/></a><button onClick={()=>toggle(item)} className={`rounded px-3 py-1.5 text-xs font-bold ${item.is_published?'bg-emerald-900/60 text-emerald-300':'bg-gray-700 text-gray-300'}`}>{item.is_published?'Published':'Draft'}</button><button onClick={()=>remove(item)} className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-red-400"><Trash2 className="h-4 w-4"/></button></div></div>)}{!resources.length&&<p className="py-12 text-center text-sm text-gray-500">No study resources added yet.</p>}</div>
  </div>
}
