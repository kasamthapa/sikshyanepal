'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, GraduationCap, ChevronDown, Search, ArrowRight } from 'lucide-react'
import SubscribeButton from '@/components/notifications/SubscribeButton'

const navLinks = [
  {
    label: 'Colleges',
    href: '/colleges',
    children: [
      { label: 'All Colleges',       href: '/colleges',            desc: 'Browse every listed college' },
      { label: 'Compare Colleges',   href: '/compare',             desc: 'Side-by-side comparison' },
      { label: 'Reviews & Ratings',  href: '/colleges?tab=reviews', desc: 'Student reviews' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    children: [
      { label: 'All Programs',   href: '/programs',                  desc: 'Search by program name' },
      { label: 'IT & Computing', href: '/programs?faculty=IT',       desc: 'BCA, BSc CSIT, BIT...' },
      { label: 'Engineering',    href: '/programs?faculty=Engineering', desc: 'BE, B.Arch, BEng...' },
      { label: 'Management',     href: '/programs?faculty=Management',  desc: 'BBA, BBS, MBA...' },
      { label: 'Medical',        href: '/programs?faculty=Medical',  desc: 'MBBS, BPH, B.Pharm...' },
    ],
  },
  { label: 'Results',      href: '/results' },
  { label: 'Notices',      href: '/notices' },
  { label: 'News',         href: '/news' },
  { label: 'Scholarships', href: '/scholarships' },
]

export default function Header() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchVal,    setSearchVal]    = useState('')
  const [scrolled,     setScrolled]     = useState(false)
  const router   = useRouter()
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Detect scroll for header shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close search on Escape
  useEffect(() => {
    if (!searchOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchOpen])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`)
    setSearchOpen(false)
    setSearchVal('')
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-card'
            : 'bg-white/80 backdrop-blur-md border-b border-slate-200/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ──────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-card-md transition-shadow">
                <GraduationCap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-ink leading-none">
                Sikshya<span className="text-brand-600">Nepal</span>
              </span>
            </Link>

            {/* ── Desktop Nav ───────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors relative ${
                      isActive(link.href)
                        ? 'text-brand-600'
                        : 'text-ink-secondary hover:text-ink hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${
                          openDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                    {/* Active underline */}
                    {isActive(link.href) && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-600 rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {link.children && openDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-xl shadow-card-xl border border-border py-1.5 z-50 animate-slide-down">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group/item"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink group-hover/item:text-brand-600 transition-colors">
                              {child.label}
                            </p>
                            {'desc' in child && (
                              <p className="text-xs text-ink-muted mt-0.5">{child.desc}</p>
                            )}
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-ink-muted mt-0.5 flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Desktop Right Actions ─────────────────────────── */}
            <div className="hidden lg:flex items-center gap-1.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-ink-secondary hover:text-ink hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Push notifications */}
              <SubscribeButton variant="header" />

              {/* Find College CTA */}
              <Link
                href="/colleges"
                className="btn-primary text-sm px-4 py-2 ml-1"
              >
                Find College
              </Link>
            </div>

            {/* ── Mobile: search + menu ─────────────────────────── */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-ink-secondary hover:bg-slate-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-lg text-ink-secondary hover:bg-slate-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search Overlay ──────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-card-xl border border-border w-full max-w-xl p-4 animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-muted" />
              <input
                autoFocus
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search colleges, programs, results..."
                className="w-full pl-10 pr-28 py-3 text-sm text-ink bg-slate-50 border border-border rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600
                           placeholder:text-ink-muted transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors active:scale-95"
              >
                Search
              </button>
            </form>
            <p className="text-xs text-ink-muted mt-2.5 ml-1">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> to search ·{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile Full-Screen Slide-Over ────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-card-xl flex flex-col animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[16px] font-bold text-ink">
                  Sikshya<span className="text-brand-600">Nepal</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-ink-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive(link.href)
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-ink hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 text-ink-muted" />
                  </Link>
                  {link.children && (
                    <div className="ml-3 mt-1 mb-2 space-y-0.5">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-ink-secondary hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="p-4 border-t border-border flex-shrink-0 space-y-2">
              <Link
                href="/colleges"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-sm justify-center py-3"
              >
                Find My College
              </Link>
              <Link
                href="/results"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary w-full text-sm justify-center py-3"
              >
                Check Results
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
