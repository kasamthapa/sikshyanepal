'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileQuickNav from '@/components/layout/MobileQuickNav'
import GlobalSearch from '@/components/layout/GlobalSearch'
import SiteAnnouncement from '@/components/layout/SiteAnnouncement'

const AUTH_PAGES = ['/account/login', '/account/register', '/account/signup']

export default function MainChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (AUTH_PAGES.includes(pathname)) return <div id="main-content" className="site-shell min-h-screen bg-[#f8f7f3]">{children}</div>
  return <><Header/><SiteAnnouncement/><div id="main-content" className="site-shell min-h-screen bg-[#f8f7f3] pb-20 lg:pb-0">{children}</div><Footer/><MobileQuickNav/><GlobalSearch/></>
}
