'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, BookOpenCheck, Search } from 'lucide-react'
import SubscribeButton from '@/components/notifications/SubscribeButton'
import AccountButton from '@/components/auth/AccountButton'

const navLinks = [
  {
    label: 'Colleges',
    href: '/colleges',
    sub: [
      { label: 'All Colleges', href: '/colleges' },
      { label: '+2 Colleges', href: '/colleges?level=%2B2' },
      { label: 'Bachelor Colleges', href: '/colleges?level=bachelor' },
      { label: 'Master Colleges', href: '/colleges?level=master' },
      { label: 'Compare Colleges', href: '/compare' },
      { label: 'Plan Study Costs', href: '/tools/college-cost-calculator' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    sub: [
      { label: 'All Programs', href: '/programs' },
      { label: 'IT & Computing', href: '/programs?faculty=it' },
      { label: 'Engineering', href: '/programs?faculty=engineering' },
      { label: 'Management', href: '/programs?faculty=management' },
      { label: 'Medical', href: '/programs?faculty=medical' },
      { label: 'Study & Career Explorer', href: '/careers' },
    ],
  },
  { label: 'Admissions', href: '/admissions', sub: [
    { label: 'Open Admissions', href: '/admissions?deadline=open' },
    { label: 'College Admissions', href: '/admissions?institution=college' },
    { label: 'Deadlines', href: '/deadlines' },
    { label: 'Admission Planner', href: '/admissions/planner' },
  ]},
  {
    label: 'Schools',
    href: '/schools',
    sub: [
      { label: 'All Schools', href: '/schools' },
      { label: 'Verified Schools', href: '/schools?verified=true' },
      { label: 'Secondary Schools', href: '/schools?level=secondary' },
      { label: 'Community Schools', href: '/schools?ownership=community' },
    ],
  },
  {
    label: 'Resources',
    href: '/news',
    sub: [
      { label: 'News & Guides', href: '/news' },
      { label: 'Results', href: '/results' },
      { label: 'Notices', href: '/notices' },
      { label: 'Scholarships', href: '/scholarships' },
      { label: 'Entrance Exams', href: '/entrance-exams' },
      { label: 'Opportunities', href: '/opportunities' },
      { label: 'Study Resources', href: '/study-resources' },
      { label: 'Student Community', href: '/community' },
      { label: 'Student Wellbeing', href: '/wellbeing' },
    ],
  },
  {
    label: 'Tools',
    href: '/my-path',
    sub: [
      { label: 'My Path', href: '/my-path' },
      { label: 'Compare Colleges', href: '/compare' },
      { label: 'College Cost Calculator', href: '/tools/college-cost-calculator' },
      { label: 'SEE & NEB GPA Calculator', href: '/tools/gpa-calculator' },
      { label: 'Career Explorer', href: '/careers' },
      { label: 'Saved Institutions', href: '/account/saved' },
      { label: 'नेपाली (Beta)', href: '/ne' },
    ],
  },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop,   setOpenDrop]   = useState<string | null>(null)
  const [scrolled,   setScrolled]   = useState(false)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileDialogRef = useRef<HTMLDivElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)
  const restoreMobileFocusRef = useRef(true)
  const pathname = usePathname()

  const closeMobileMenu = useCallback((restoreFocus = true) => {
    restoreMobileFocusRef.current = restoreFocus
    setMobileOpen(false)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    restoreMobileFocusRef.current = false
    setMobileOpen(false)
    setOpenDrop(null)
  }, [pathname])

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Keep keyboard focus inside the drawer, then return it to the trigger when
  // the student dismisses the menu without navigating away.
  useEffect(() => {
    if (!mobileOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const trigger = mobileTriggerRef.current
    mobileCloseRef.current?.focus()

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !mobileDialogRef.current) return
      const controls = Array.from(mobileDialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(control => control.getClientRects().length > 0)
      if (!controls.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      if (restoreMobileFocusRef.current) (previouslyFocused || trigger)?.focus()
    }
  }, [mobileOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDrop) return
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.nav-dropdown')) {
        setOpenDrop(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDrop])

  // Close any open navigation layer on Escape key.
  useEffect(() => {
    if (!openDrop && !mobileOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDrop(null)
        closeMobileMenu(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeMobileMenu, openDrop, mobileOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
          scrolled ? 'shadow-sm border-b border-border' : 'border-b border-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ─────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpenCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-[17px] leading-none tracking-tight">
                <span className="text-ink">Sikshya</span>
                <span className="text-primary">Nepal</span>
              </span>
            </Link>

            {/* ── Desktop nav ──────────────────────────────── */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  // nav-dropdown class is the sentinel for outside-click detection
                  className="relative nav-dropdown"
                >
                  {link.sub ? (
                    /* Items with sub-menu: button toggles dropdown, no navigation */
                    <button
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      className={`flex items-center gap-0.5 px-3.5 py-2 text-sm font-[500] rounded-lg transition-colors duration-150 ${
                        isActive(link.href)
                          ? 'text-primary bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    /* Plain links: navigate directly */
                    <Link
                      href={link.href}
                      className={`flex items-center gap-0.5 px-3.5 py-2 text-sm font-[500] rounded-lg transition-colors duration-150 ${
                        isActive(link.href)
                          ? 'text-primary bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {link.sub && openDrop === link.label && (
                    <div className={`absolute top-full z-50 ${link.label === 'Explore' ? 'right-0' : 'left-0'}`}>
                      {/* Invisible bridge: fills the gap between trigger bottom and
                          dropdown top so the mouse never "misses" while moving down */}
                      <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                      <div className="mt-1.5 max-h-[70vh] w-64 overflow-y-auto overscroll-contain rounded-xl border border-border bg-white py-1.5 shadow-card-lg animate-slide-down">
                        {link.sub.map((s) => (
                          <Link
                            key={s.label}
                            href={s.href}
                            onClick={() => setOpenDrop(null)}
                            className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary transition-colors duration-150"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Desktop right actions ────────────────────── */}
            <div className="hidden xl:flex items-center gap-2">
              <button onClick={() => window.dispatchEvent(new Event('open-site-search'))} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-500 hover:border-blue-200 hover:text-primary" aria-label="Search SikshyaNepal"><Search className="h-4 w-4" /><span className="hidden xl:inline">Search</span><kbd className="hidden xl:inline rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400">⌘K</kbd></button>
              <SubscribeButton variant="header" />
              <AccountButton />
              <Link
                href="/colleges"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors duration-150"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
              >
                Find a College
              </Link>
            </div>

            {/* ── Mobile ───────────────────────────────────── */}
            <div className="flex items-center gap-1 xl:hidden">
              <SubscribeButton variant="header" />
              <button
                ref={mobileTriggerRef}
                type="button"
                onClick={() => {
                  if (mobileOpen) closeMobileMenu(true)
                  else {
                    restoreMobileFocusRef.current = true
                    setMobileOpen(true)
                  }
                }}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink-secondary hover:bg-gray-100 active:bg-gray-200"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-site-navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-over ────────────────────────────────────── */}
      {mobileOpen && (
        <div id="mobile-site-navigation" className="fixed inset-0 z-[300] xl:hidden" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => closeMobileMenu(true)}
          />
          <div ref={mobileDialogRef} className="absolute inset-y-0 right-0 flex w-[min(100%,24rem)] flex-col bg-white shadow-card-xl motion-safe:animate-slide-down">

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
              <Link href="/" onClick={() => closeMobileMenu(false)} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                  <BookOpenCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-display font-bold text-[16px]">
                  <span className="text-ink">Sikshya</span>
                  <span className="text-primary">Nepal</span>
                </span>
              </Link>
              <button
                ref={mobileCloseRef}
                type="button"
                onClick={() => closeMobileMenu(true)}
                aria-label="Close navigation menu"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink-secondary hover:bg-gray-100 active:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.sub ? <button
                    type="button"
                    onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                    aria-expanded={openDrop === link.label}
                    aria-controls={`mobile-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                    className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${isActive(link.href) ? 'bg-primary-50 text-primary' : 'text-ink hover:bg-gray-50'}`}
                  >
                    {link.label}<ChevronDown className={`h-4 w-4 transition-transform ${openDrop === link.label ? 'rotate-180' : ''}`}/>
                  </button> : <Link href={link.href} onClick={() => closeMobileMenu(false)} className={`flex min-h-11 items-center rounded-xl px-3 py-3 text-sm font-semibold ${isActive(link.href) ? 'bg-primary-50 text-primary' : 'text-ink hover:bg-gray-50'}`}>{link.label}</Link>}
                  {link.sub && openDrop === link.label && (
                    <div id={`mobile-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="ml-3 mt-0.5 mb-1 space-y-0.5">
                      <Link href={link.href} onClick={() => closeMobileMenu(false)} className="block rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-primary-50">View {link.label}</Link>
                      {link.sub.map((s) => (
                        <Link
                          key={s.label}
                          href={s.href}
                          onClick={() => closeMobileMenu(false)}
                          className="block px-3 py-2 text-sm text-ink-secondary hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTAs */}
            <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
              <AccountButton mobile onNavigate={() => closeMobileMenu(false)} />
              <Link
                href="/colleges"
                onClick={() => closeMobileMenu(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                Find My College
              </Link>
              <Link
                href="/results"
                onClick={() => closeMobileMenu(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-primary border-2 border-primary text-sm font-semibold rounded-xl hover:bg-primary-50 transition-colors"
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
