import Link from 'next/link'
import {
  Building2,
  BookOpen,
  FileText,
  Bell,
  Newspaper,
  Award,
  Star,
  Database,
  Settings,
  GraduationCap,
} from 'lucide-react'

const adminSections = [
  { label: 'Colleges', icon: Building2, href: '#', count: '—', color: 'bg-blue-100 text-blue-600', desc: 'Manage college listings' },
  { label: 'Programs', icon: BookOpen, href: '#', count: '—', color: 'bg-green-100 text-green-600', desc: 'Manage programs' },
  { label: 'Results', icon: FileText, href: '#', count: '—', color: 'bg-orange-100 text-orange-600', desc: 'Publish exam results' },
  { label: 'Notices', icon: Bell, href: '#', count: '—', color: 'bg-yellow-100 text-yellow-600', desc: 'University notices' },
  { label: 'News', icon: Newspaper, href: '#', count: '—', color: 'bg-purple-100 text-purple-600', desc: 'Education news' },
  { label: 'Scholarships', icon: Award, href: '#', count: '—', color: 'bg-teal-100 text-teal-600', desc: 'Manage scholarships' },
  { label: 'Reviews', icon: Star, href: '#', count: '—', color: 'bg-pink-100 text-pink-600', desc: 'Moderate student reviews' },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SikshyaNepal Admin</h1>
              <p className="text-xs text-gray-400">Content Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← View Site
            </Link>
            <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Banner */}
        <div className="bg-blue-600/20 border border-blue-600/30 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-blue-300 mb-1">Database Connection Required</h2>
              <p className="text-sm text-blue-400">
                To manage content, connect to Supabase. Use the SQL editor at{' '}
                <a
                  href="https://supabase.com/dashboard/project/pobwvtynnqgkbazunzib/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200"
                >
                  supabase.com/dashboard
                </a>{' '}
                to run the schema from <code className="bg-blue-900/50 px-1 rounded">supabase/schema.sql</code>.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-5">Content Management</h2>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {adminSections.map((section) => {
            const Icon = section.icon
            return (
              <div
                key={section.label}
                className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-gray-300">{section.count}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">{section.label}</h3>
                <p className="text-xs text-gray-500">{section.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="font-semibold text-white mb-4">Setup Instructions</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
              <span>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase Dashboard</a> → SQL Editor</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
              <span>Copy and run the contents of <code className="bg-gray-700 px-1.5 py-0.5 rounded">supabase/schema.sql</code></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
              <span>Update <code className="bg-gray-700 px-1.5 py-0.5 rounded">.env.local</code> with your Supabase anon key</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</span>
              <span>Add colleges, programs, results and notices via the Supabase Table Editor or API</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}
