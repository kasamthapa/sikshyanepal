'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LocateFixed, MapPin, Navigation, ShieldCheck } from 'lucide-react'
import { districtsForProvince, NEPAL_PROVINCES } from '@/lib/nepal-geography'

type School = { id: string; name: string; slug: string; district: string; local_level: string | null; verification_status: string; grades_from: number | null; grades_to: number | null; distance_km: number }

export default function NearbySchoolsPage() {
  const [items, setItems] = useState<School[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')

  function find() {
    if (!navigator.geolocation) return setError('Location is not supported by this browser. Browse by district below instead.')
    setLoading(true); setError(''); setSearched(false); setItems([])
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const response = await fetch(`/api/schools/nearby?lat=${position.coords.latitude}&lng=${position.coords.longitude}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setItems(Array.isArray(data) ? data : [])
        setSearched(true)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not find nearby schools.')
      } finally {
        setLoading(false)
      }
    }, () => {
      setLoading(false); setError('Location permission was not granted. Browse by district below instead.')
    }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 })
  }

  return <main className="min-h-screen bg-[#f8f7f3]">
    <section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-5xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">School discovery</p><h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">Schools near you</h1><p className="mt-3 max-w-2xl text-gray-500">See schools with verified map coordinates, ordered by straight-line distance. Your location is used for this search only and is not saved.</p><button onClick={find} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-600 disabled:opacity-50"><LocateFixed className="h-4 w-4" />{loading ? 'Finding schools…' : 'Use my location'}</button></div></section>
    <div className="mx-auto max-w-5xl space-y-7 px-4 py-8 sm:px-6">
      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error}</div>}
      {items.length > 0 && <section><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold text-ink">Nearest mapped schools</h2><span className="text-xs text-gray-500">{items.length} results</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(school => <Link key={school.id} href={`/schools/${school.slug}`} className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"><div className="flex items-start justify-between gap-3"><h3 className="font-display text-lg font-bold text-ink">{school.name}</h3><span className="whitespace-nowrap rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-primary">{school.distance_km < 1 ? `${Math.round(school.distance_km * 1000)} m` : `${school.distance_km.toFixed(1)} km`}</span></div><p className="mt-3 flex items-start gap-1.5 text-sm text-gray-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{school.local_level || school.district}</p><p className="mt-2 text-xs text-gray-500">{school.grades_from != null && school.grades_to != null ? `${school.grades_from === 0 ? 'ECD' : `Grade ${school.grades_from}`}–Grade ${school.grades_to}` : 'Level details pending'}</p><p className="mt-4 flex items-start gap-1.5 text-xs leading-5 text-gray-400"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />Distance is approximate. Confirm route and transport.</p></Link>)}</div></section>}
      {searched && !items.length && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><Navigation className="mx-auto h-10 w-10 text-gray-300" /><h2 className="mt-4 font-display text-xl font-bold text-ink">No mapped schools nearby yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Many official registry profiles do not include coordinates. Choose your province and district below to see the complete directory.</p></div>}
      {!searched && !loading && !error && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><Navigation className="mx-auto h-10 w-10 text-gray-300" /><h2 className="mt-4 font-display text-xl font-bold text-ink">Find schools around you</h2><p className="mt-2 text-sm text-gray-500">Allow location access, or browse the full registry by district below.</p></div>}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="font-display text-xl font-bold text-ink">Browse by district</h2><p className="mt-1 text-sm text-gray-500">This includes schools even when exact map coordinates are unavailable.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><select value={province} onChange={event => { setProvince(event.target.value); setDistrict('') }} aria-label="Province" className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-ink"><option value="">Choose province</option>{NEPAL_PROVINCES.map(item => <option key={item}>{item}</option>)}</select><select value={district} onChange={event => setDistrict(event.target.value)} disabled={!province} aria-label="District" className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-ink disabled:bg-gray-50 disabled:text-gray-400"><option value="">{province ? 'Choose district' : 'Province first'}</option>{districtsForProvince(province).map(item => <option key={item}>{item}</option>)}</select><Link href={district ? `/schools?province=${encodeURIComponent(province)}&district=${encodeURIComponent(district)}` : '#'} aria-disabled={!district} className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold ${district ? 'bg-primary text-white' : 'pointer-events-none bg-gray-100 text-gray-400'}`}>View schools</Link></div></section>
    </div>
  </main>
}
