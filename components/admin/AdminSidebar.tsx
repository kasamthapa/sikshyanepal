'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap,
  Building2,
  Newspaper,
  Bell,
  Award,
  Star,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Mail,
  Send,
  School,
  Flag,
  CalendarCheck2,
  CalendarClock,
  Inbox,
  UserCheck,
  ScrollText,
  BookOpen,
  Activity,
  MessageSquare,
  Database,
  BarChart3,
  Megaphone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard',        href: '/admin',                  icon: LayoutDashboard },
  { label: 'System Status',    href: '/admin/system-status',    icon: Database },
  { label: 'Search Insights',  href: '/admin/search-insights',  icon: BarChart3 },
  { label: 'Announcements',    href: '/admin/announcements',    icon: Megaphone },
  { label: 'Schools',          href: '/admin/schools',          icon: School },
  { label: 'Data Corrections', href: '/admin/corrections',      icon: Flag, pending: true },
  { label: 'Admissions',       href: '/admin/admissions',       icon: CalendarCheck2, revenue: true },
  { label: 'Entrance Exams',   href: '/admin/entrance-exams',   icon: CalendarClock },
  { label: 'Opportunities',    href: '/admin/opportunities',    icon: Send },
  { label: 'Content Queue',    href: '/admin/ingestion',        icon: Inbox, pending: true },
  { label: 'Source Health',    href: '/admin/sources',          icon: Activity },
  { label: 'Evidence Ledger',  href: '/admin/evidence',         icon: ShieldCheck },
  { label: 'Evidence Coverage', href: '/admin/evidence-coverage', icon: BarChart3 },
  { label: 'Evidence Import',   href: '/admin/evidence-bootstrap', icon: Database },
  { label: 'Profile Claims',   href: '/admin/claims',           icon: UserCheck, pending: true },
  { label: 'Audit Log',        href: '/admin/audit',            icon: ScrollText },
  { label: 'Colleges',         href: '/admin/colleges',         icon: Building2 },
  { label: 'College Data Quality', href: '/admin/colleges/data-quality', icon: CheckCircle2 },
  { label: 'Programs',         href: '/admin/programs',         icon: BookOpen },
  { label: 'Study Resources',  href: '/admin/study-resources',  icon: BookOpen },
  { label: 'Pending Colleges', href: '/admin/colleges/pending', icon: Building2,  pending: true },
  { label: 'Admission Enquiries', href: '/admin/leads',         icon: Send,        revenue: true },
  { label: 'News',             href: '/admin/news',             icon: Newspaper },
  { label: 'Notices',          href: '/admin/notices',          icon: Bell },
  { label: 'Scholarships',     href: '/admin/scholarships',     icon: Award },
  { label: 'Reviews',          href: '/admin/reviews',          icon: Star },
  { label: 'Review Responses', href: '/admin/review-responses', icon: MessageSquare, pending: true },
  { label: 'Community',        href: '/admin/community',        icon: MessageSquare, pending: true },
  { label: 'Subscribers',      href: '/admin/subscribers',      icon: Mail },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">SikshyaNepal</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon, pending, revenue }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700',
                pending  && !active && 'text-yellow-400 hover:text-yellow-300',
                revenue  && !active && 'text-green-400 hover:text-green-300',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {pending && !active && (
                <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              )}
              {revenue && !active && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-900/60 text-green-300 rounded flex-shrink-0">
                  $
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> View Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
