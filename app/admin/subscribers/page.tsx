import { createServerSupabaseClient } from '@/lib/supabase'
import { Mail, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import ExportCsvButton from './ExportCsvButton'

export const dynamic = 'force-dynamic'

interface Subscriber {
  id:         string
  email:      string
  created_at: string
  is_active:  boolean
}

async function getSubscribers() {
  const supabase = createServerSupabaseClient()
  const [listRes, countRes] = await Promise.all([
    supabase
      .from('subscribers')
      .select('id, email, created_at, is_active')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ])
  return {
    subscribers: (listRes.data ?? []) as Subscriber[],
    totalActive: countRes.count ?? 0,
  }
}

export default async function SubscribersPage() {
  const { subscribers, totalActive } = await getSubscribers()

  return (
    <div className="p-8 text-gray-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Email Subscribers</h1>
        <p className="text-gray-400 mt-1">Users who subscribed for result alerts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-900/40 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalActive}</p>
          <p className="text-sm text-gray-400">Active subscribers</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-900/40 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{subscribers.length}</p>
          <p className="text-sm text-gray-400">Total (inc. inactive)</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex items-center">
          <ExportCsvButton subscribers={subscribers} />
        </div>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No subscribers yet</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Email</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Joined</th>
                <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-700/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-800/50'}`}
                >
                  <td className="px-5 py-3.5 text-gray-200">{s.email}</td>
                  <td className="px-5 py-3.5 text-gray-400">{formatDate(s.created_at)}</td>
                  <td className="px-5 py-3.5">
                    {s.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
