import { createAdminSupabaseClient } from '@/lib/supabase'
import { BellRing, CheckCircle2, CircleAlert, Mail, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import ExportCsvButton from './ExportCsvButton'

export const dynamic = 'force-dynamic'

interface Subscriber {
  id:         string
  email:      string
  created_at: string
  is_active:  boolean
}

interface DeliveryRun {
  id: string
  category: 'results'
  status: 'processing' | 'sent' | 'partial' | 'failed'
  item_count: number
  recipient_count: number
  sent_count: number
  error_count: number
  started_at: string
  completed_at: string | null
}

async function getSubscribers() {
  const supabase = createAdminSupabaseClient()
  const [listRes, countRes, deliveryRes] = await Promise.all([
    supabase
      .from('subscribers')
      .select('id, email, created_at, is_active')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('notification_delivery_runs')
      .select('id,category,status,item_count,recipient_count,sent_count,error_count,started_at,completed_at')
      .order('started_at', { ascending: false })
      .limit(30),
  ])
  return {
    subscribers: (listRes.data ?? []) as Subscriber[],
    totalActive: countRes.count ?? 0,
    deliveries: (deliveryRes.data ?? []) as DeliveryRun[],
  }
}

export default async function SubscribersPage() {
  const { subscribers, totalActive, deliveries } = await getSubscribers()

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

      <section className="mt-8" aria-labelledby="delivery-history-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="delivery-history-heading" className="flex items-center gap-2 text-lg font-bold text-white"><BellRing className="h-5 w-5 text-blue-300" aria-hidden="true" />Result alert delivery</h2>
            <p className="mt-1 text-sm text-gray-400">Recent result-alert batches. A repeated scraper run with the same results is recorded once.</p>
          </div>
          <span className="text-xs text-gray-500">Last 30 batches</span>
        </div>
        {deliveries.length === 0 ? (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-sm text-gray-400">No result-alert batch has been recorded yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800">
            <table className="min-w-[720px] w-full text-sm">
              <thead><tr className="border-b border-gray-700 text-left text-gray-400"><th className="px-5 py-3.5 font-medium">Started</th><th className="px-5 py-3.5 font-medium">Status</th><th className="px-5 py-3.5 font-medium">Results</th><th className="px-5 py-3.5 font-medium">Recipients</th><th className="px-5 py-3.5 font-medium">Sent</th><th className="px-5 py-3.5 font-medium">Errors</th></tr></thead>
              <tbody>{deliveries.map((delivery) => <tr key={delivery.id} className="border-b border-gray-700/50 last:border-0"><td className="whitespace-nowrap px-5 py-3.5 text-gray-400">{formatDate(delivery.started_at)}</td><td className="px-5 py-3.5"><DeliveryStatus status={delivery.status} /></td><td className="px-5 py-3.5 text-gray-200">{delivery.item_count}</td><td className="px-5 py-3.5 text-gray-200">{delivery.recipient_count}</td><td className="px-5 py-3.5 font-semibold text-emerald-300">{delivery.sent_count}</td><td className="px-5 py-3.5"><span className={delivery.error_count ? 'font-semibold text-amber-200' : 'text-gray-500'}>{delivery.error_count}</span></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function DeliveryStatus({ status }: { status: DeliveryRun['status'] }) {
  const styles = {
    sent: 'bg-emerald-950/60 text-emerald-300',
    partial: 'bg-amber-950/60 text-amber-200',
    failed: 'bg-red-950/60 text-red-300',
    processing: 'bg-blue-950/60 text-blue-200',
  }
  const labels = { sent: 'Sent', partial: 'Partially sent', failed: 'Failed', processing: 'Processing' }
  const Icon = status === 'sent' ? CheckCircle2 : status === 'failed' ? CircleAlert : BellRing
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{labels[status]}</span>
}
