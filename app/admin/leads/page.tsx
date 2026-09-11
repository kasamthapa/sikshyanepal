'use client'

import { useEffect, useState, useCallback } from 'react'
import { Phone, Mail, GraduationCap, MessageSquare, Trash2, RefreshCw, Building2, TrendingUp } from 'lucide-react'
import ConfirmDialog, { ConfirmState, CONFIRM_CLOSED } from '@/components/ui/ConfirmDialog'
import { ToastList, useToast } from '@/components/ui/Toast'

interface Lead {
  id: string
  college_id: string
  college_name: string
  student_name: string
  student_email: string | null
  student_phone: string
  program_interest: string | null
  message: string | null
  status: 'new' | 'contacted' | 'enrolled' | 'rejected'
  created_at: string
  retention_expires_at?: string | null
}

const STATUS_CONFIG = {
  new:       { label: 'New',       bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  contacted: { label: 'Contacted', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  enrolled:  { label: 'Enrolled',  bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  rejected:  { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
} as const

const ALL_STATUSES = ['new', 'contacted', 'enrolled', 'rejected'] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NP', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminLeadsPage() {
  const [leads,    setLeads]    = useState<Lead[]>([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [dialog,   setDialog]   = useState<ConfirmState>(CONFIRM_CLOSED)
  const { toasts, toast, dismiss } = useToast()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const url = filter === 'all'
      ? `/api/admin/leads?limit=200&t=${Date.now()}`
      : `/api/admin/leads?status=${filter}&limit=200&t=${Date.now()}`
    try {
      const res  = await fetch(url, { cache: 'no-store' })
      const data = await res.json()
      setLeads(data.leads || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || `Failed to update status (${res.status})`)
        return
      }
      await fetchLeads()
      toast.success('Status updated')
    } catch {
      toast.error('Network error — status not updated')
    } finally {
      setUpdating(null)
    }
  }

  function confirmDelete(id: string, name: string) {
    setDialog({
      isOpen: true,
      title: 'Delete Application',
      message: `Delete ${name}'s application? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setDialog(CONFIRM_CLOSED)
        try {
          const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            const err = await res.json()
            toast.error(err.error || 'Failed to delete')
            return
          }
          setLeads((l) => l.filter((x) => x.id !== id))
          setTotal((t) => t - 1)
          toast.success('Application deleted')
        } catch {
          toast.error('Network error — lead not deleted')
        }
      },
    })
  }

  const counts: Record<string, number> = { new: 0, contacted: 0, enrolled: 0, rejected: 0 }
  leads.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1 })

  return (
    <div className="p-6 lg:p-8 text-gray-100 min-h-screen">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admission enquiries</h1>
          <p className="text-gray-400 mt-0.5 text-sm">
            Student requests for college admission information — {total} total
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s]
          return (
            <div key={s} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <span className="text-xs text-gray-400 font-medium capitalize">{s}</span>
              </div>
              <p className="text-2xl font-bold text-white">{counts[s] || 0}</p>
            </div>
          )
        })}
      </div>

      {/* Conversion metric */}
      {total > 0 && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-green-900/30 border border-green-700/50 rounded-xl text-sm text-green-300">
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <span>
            Enrollment rate:{' '}
            <strong className="text-green-200">
              {Math.round(((counts.enrolled || 0) / total) * 100)}%
            </strong>{' '}
            ({counts.enrolled || 0} enrolled out of {total} applications)
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { label: `All (${total})`, value: 'all' },
          ...ALL_STATUSES.map((s) => ({
            label: `${STATUS_CONFIG[s].label} (${counts[s] || 0})`,
            value: s,
          })),
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leads list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading leads…</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
          <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No leads found</p>
          <p className="text-sm text-gray-600 mt-1">Enquiries appear here after students request college information</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const cfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new
            return (
              <div
                key={lead.id}
                className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-700/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm">
                      {lead.student_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{lead.student_name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-2">
                      <a
                        href={`tel:${lead.student_phone}`}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-medium text-white">{lead.student_phone}</span>
                      </a>
                      {lead.student_email && (
                        <a
                          href={`mailto:${lead.student_email}`}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {lead.student_email}
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {lead.college_name}
                      </span>
                      {lead.program_interest && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {lead.program_interest}
                        </span>
                      )}
                    </div>

                    {lead.message && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-gray-500">
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span className="italic">&ldquo;{lead.message}&rdquo;</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 mt-2">Received {formatDate(lead.created_at)}{lead.retention_expires_at?` · scheduled deletion ${formatDate(lead.retention_expires_at)}`:''}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col items-center gap-2 flex-shrink-0">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      disabled={updating === lead.id}
                      className="bg-gray-700 border border-gray-600 text-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => confirmDelete(lead.id, lead.student_name)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      title="Delete lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog {...dialog} onCancel={() => setDialog(CONFIRM_CLOSED)} />
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
