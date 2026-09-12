import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-primary">404 · Page not found</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">This page has moved or does not exist.</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">Search SikshyaNepal or return home to find colleges, admissions, results and source-backed education guidance.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Go home
          </Link>
          <Link href="/search" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-ink hover:border-primary hover:text-primary">
            <Search className="h-4 w-4" aria-hidden="true" /> Search the site
          </Link>
        </div>
      </section>
    </main>
  )
}
