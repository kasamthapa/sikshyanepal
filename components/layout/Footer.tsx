import Link from 'next/link'
import { GraduationCap, Mail, MapPin, ArrowUpRight } from 'lucide-react'

const footerLinks = {
  'Quick Links': [
    { label: 'All Colleges',     href: '/colleges' },
    { label: 'Compare Colleges', href: '/compare' },
    { label: 'College Reviews',  href: '/colleges?tab=reviews' },
    { label: 'Scholarships',     href: '/scholarships' },
  ],
  Programs: [
    { label: 'IT & Computing',  href: '/programs?faculty=IT' },
    { label: 'Engineering',     href: '/programs?faculty=Engineering' },
    { label: 'Management',      href: '/programs?faculty=Management' },
    { label: 'Medical',         href: '/programs?faculty=Medical' },
  ],
  Universities: [
    { label: 'TU Results',      href: '/results?university=TU' },
    { label: 'KU Notices',      href: '/notices?university=KU' },
    { label: 'NEB Results',     href: '/results?university=NEB' },
    { label: 'CTEVT Notices',   href: '/notices?university=CTEVT' },
  ],
}

// Simple social SVG icons (no extra dependency)
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* ── Brand column ──────────────────────────────────── */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[17px] font-bold text-white tracking-tight">
                Sikshya<span className="text-brand-300">Nepal</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              Nepal&apos;s most complete education platform. Find colleges, check results,
              and get university notices — all in one place.
            </p>

            <div className="space-y-2.5 mb-6">
              <a
                href="mailto:info@sikshyanepal.com"
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors group"
              >
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                info@sikshyanepal.com
              </a>
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                Kathmandu, Nepal
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/sikshyanepal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                           hover:bg-white/10 hover:border-white/20 transition-all"
                aria-label="Twitter/X"
              >
                <TwitterIcon className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a
                href="https://facebook.com/sikshyanepal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                           hover:bg-white/10 hover:border-white/20 transition-all"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* ── Link columns ──────────────────────────────────── */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SikshyaNepal. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
