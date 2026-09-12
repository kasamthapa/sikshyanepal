import Link from 'next/link'
import { Mail, MapPin, ArrowUpRight, BookOpenCheck } from 'lucide-react'
import CookieSettingsButton from '@/components/privacy/CookieSettingsButton'

const exploreLinks = [
  { label: 'All Colleges',     href: '/colleges' },
  { label: 'Admissions Open',  href: '/admissions' },
  { label: 'Compare Colleges', href: '/compare' },
  { label: 'Programs',         href: '/programs' },
  { label: 'Study & Career Explorer', href: '/careers' },
  { label: 'My Path', href: '/my-path' },
  { label: 'News & Guides', href: '/news' },
  { label: 'Scholarships', href: '/scholarships' },
  { label: 'Student Community', href: '/community' },
]

const institutionLinks = [
  { label: 'Institution dashboard', href: '/account/institutions' },
  { label: 'Claim an institution', href: '/account/claim' },
  { label: 'Submit a college', href: '/submit-college' },
  { label: 'Submit a school', href: '/submit-school' },
]

const universityLinks = [
  { label: 'TU Results',     href: '/results?university=TU' },
  { label: 'KU Results',     href: '/results?university=KU' },
  { label: 'NEB Results',    href: '/results?university=NEB' },
  { label: 'TU Notices',     href: '/notices?university=TU' },
  { label: 'KU Notices',     href: '/notices?university=KU' },
  { label: 'CTEVT Notices',  href: '/notices?university=CTEVT' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0d1b3e' }} className="text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Col 1: Brand ─────────────────────────────── */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpenCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-[17px] leading-none tracking-tight">
                <span className="text-white">Sikshya</span>
                <span className="text-blue-400">Nepal</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              An independent guide to colleges, programs and education in Nepal.
              Verification status and original sources are shown where available.
            </p>

            <div className="space-y-2.5 mb-6">
              <a
                href="mailto:info@sikshyanepal.com"
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors duration-150"
              >
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                info@sikshyanepal.com
              </a>
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                Kathmandu, Nepal
              </div>
            </div>

          </div>

          {/* ── Col 2: Explore ───────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Explore
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Universities ──────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Results &amp; notices
            </h3>
            <ul className="space-y-3">
              {universityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Connect ───────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              For institutions
            </h3>
            <ul className="space-y-3">{institutionLinks.map((link) => <li key={link.label}><Link href={link.href} className="group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors duration-150 hover:text-white">{link.label}<ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" /></Link></li>)}</ul>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────── */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SikshyaNepal. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-slate-500 sm:justify-end">
            <Link href="/about/editorial-policy" className="hover:text-white transition-colors duration-150">Editorial policy</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors duration-150">Terms</Link>
            <Link href="/community/guidelines" className="hover:text-white transition-colors duration-150">Community rules</Link>
            <Link href="/safety" className="hover:text-white transition-colors duration-150">Safety</Link>
            <Link href="/copyright" className="hover:text-white transition-colors duration-150">Copyright</Link>
            <Link href="/cookies" className="hover:text-white transition-colors duration-150">Cookies</Link>
            <Link href="/refunds" className="hover:text-white transition-colors duration-150">Refunds</Link>
            <CookieSettingsButton />
            <Link href="/contact" className="hover:text-white transition-colors duration-150">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
