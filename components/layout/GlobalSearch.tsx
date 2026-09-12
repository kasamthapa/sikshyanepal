'use client'

import { Command, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'

const shortcuts = [
  ['Find a school', '/schools'], ['Find a college', '/colleges'], ['Admissions open', '/admissions?deadline=open'],
  ['My Path', '/my-path'], ['Check results', '/results'], ['Scholarships', '/scholarships'], ['Latest notices', '/notices'],
]

export default function GlobalSearch() {
  const router = useRouter(); const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const input = useRef<HTMLInputElement>(null)
  useEffect(() => { const toggle = () => setOpen(true); const key = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true) } if (event.key === 'Escape') setOpen(false) }; window.addEventListener('open-site-search', toggle); window.addEventListener('keydown', key); return () => { window.removeEventListener('open-site-search', toggle); window.removeEventListener('keydown', key) } }, [])
  useEffect(() => { if (open) window.setTimeout(() => input.current?.focus(), 0) }, [open])
  function submit(event: FormEvent) { event.preventDefault(); const value = query.trim(); if (!value) return; setOpen(false); router.push(`/search?q=${encodeURIComponent(value)}`) }
  if (!open) return null
  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#0d1b3e]/45 p-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search SikshyaNepal" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl"><form onSubmit={submit} className="flex items-center gap-3 border-b border-gray-100 px-4"><Search className="h-5 w-5 text-primary" /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search schools, colleges, results, notices…" className="h-14 min-w-0 flex-1 text-sm text-ink outline-none" /><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink"><X className="h-4 w-4" /></button></form><div className="p-3"><p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Quick actions</p><div className="grid gap-1 sm:grid-cols-2">{shortcuts.map(([label, href]) => <button key={href} type="button" onClick={() => { setOpen(false); router.push(href) }} className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-primary"><span>{label}</span><span className="text-gray-300">→</span></button>)}</div></div><div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-[11px] text-gray-400"><span>Search uses verified SikshyaNepal information.</span><span className="inline-flex items-center gap-1"><Command className="h-3 w-3" />K</span></div></div></div>
}
