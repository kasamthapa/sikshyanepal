import { createServerSupabaseClient } from '@/lib/supabase'
import { Building2, Newspaper, Bell, Award, Star, FileText } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createServerSupabaseClient()
  const [colleges, news, notices, scholarships, reviews, results] = await Promise.all([
    supabase.from('colleges').select('id', { count: 'exact', head: true }),
    supabase.from('news').select('id', { count: 'exact', head: true }),
    supabase.from('notices').select('id', { count: 'exact', head: true }),
    supabase.from('scholarships').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('results').select('id', { count: 'exact', head: true }),
  ])
  return {
    colleges: colleges.count || 0,
    news: news.count || 0,
    notices: notices.count || 0,
    scholarships: scholarships.count || 0,
    pendingReviews: reviews.count || 0,
    results: results.count || 0,
  }
}

const cards = [
  { label: 'Colleges', key: 'colleges', icon: Building2, href: '/admin/colleges', color: 'text-blue-400 bg-blue-900/30' },
  { label: 'News Articles', key: 'news', icon: Newspaper, href: '/admin/news', color: 'text-purple-400 bg-purple-900/30' },
  { label: 'Notices', key: 'notices', icon: Bell, href: '/admin/notices', color: 'text-yellow-400 bg-yellow-900/30' },
  { label: 'Scholarships', key: 'scholarships', icon: Award, href: '/admin/scholarships', color: 'text-green-400 bg-green-900/30' },
  { label: 'Pending Reviews', key: 'pendingReviews', icon: Star, href: '/admin/reviews', color: 'text-orange-400 bg-orange-900/30' },
  { label: 'Results', key: 'results', icon: FileText, href: '/admin/reviews', color: 'text-teal-400 bg-teal-900/30' },
]

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-8 text-gray-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back to SikshyaNepal admin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {cards.map(({ label, key, icon: Icon, href, color }) => (
          <Link key={key} href={href} className="group block">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {key === 'pendingReviews' && stats.pendingReviews > 0 && (
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                    {stats.pendingReviews} pending
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats[key as keyof typeof stats]}
              </p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: '+ Add College', href: '/admin/colleges/new' },
              { label: '+ Add News Article', href: '/admin/news/new' },
              { label: '+ Add Notice', href: '/admin/notices/new' },
              { label: '+ Add Scholarship', href: '/admin/scholarships/new' },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="block px-4 py-2.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="font-semibold text-white mb-4">Site Links</h3>
          <div className="space-y-2">
            {[
              { label: 'View Homepage', href: '/' },
              { label: 'College Listings', href: '/colleges' },
              { label: 'Results Page', href: '/results' },
              { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard/project/pobwvtynnqgkbazunzib' },
            ].map(({ label, href }) => (
              <a key={href} href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                className="block px-4 py-2.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                {label} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
