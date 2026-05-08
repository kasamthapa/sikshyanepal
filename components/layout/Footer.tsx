import Link from 'next/link'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  Colleges: [
    { label: 'All Colleges', href: '/colleges' },
    { label: 'Compare Colleges', href: '/compare' },
    { label: 'College Reviews', href: '/colleges?tab=reviews' },
    { label: 'Scholarships', href: '/scholarships' },
  ],
  Programs: [
    { label: 'IT & Computing', href: '/programs?faculty=IT' },
    { label: 'Engineering', href: '/programs?faculty=Engineering' },
    { label: 'Management', href: '/programs?faculty=Management' },
    { label: 'Medical', href: '/programs?faculty=Medical' },
  ],
  Resources: [
    { label: 'Exam Results', href: '/results' },
    { label: 'University Notices', href: '/notices' },
    { label: 'Education News', href: '/news' },
    { label: 'Old Questions', href: '/programs' },
  ],
  Universities: [
    { label: 'Tribhuvan University', href: '/notices?university=tu' },
    { label: 'Kathmandu University', href: '/notices?university=ku' },
    { label: 'Pokhara University', href: '/notices?university=pu' },
    { label: 'Purbanchal University', href: '/notices?university=puru' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Sikshya<span className="text-blue-400">Nepal</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Nepal&apos;s most comprehensive education portal. Find colleges, programs, results, and notices all in one place.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@sikshyanepal.com" className="hover:text-white transition-colors">
                  info@sikshyanepal.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+977-01-XXXXXXX</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SikshyaNepal. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
