'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import ApplyNowModal from './ApplyNowModal'

interface Program {
  name: string
}

interface Props {
  collegeName: string
  collegeId:   string
  isSponsored: boolean
  programs:    Program[]
}

const LS_KEY    = (id: string) => `applied_${id}`
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000  // 30 days

export default function ApplyNowButton({
  collegeName, collegeId, isSponsored, programs,
}: Props) {
  const [open,    setOpen]    = useState(false)
  const [applied, setApplied] = useState(false)

  // Restore applied state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(collegeId))
      if (raw) {
        const ts = parseInt(raw, 10)
        if (Date.now() - ts < EXPIRY_MS) {
          setApplied(true)
        } else {
          localStorage.removeItem(LS_KEY(collegeId))
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, [collegeId])

  // Called by the modal after a successful submission
  const handleSuccess = () => {
    try {
      localStorage.setItem(LS_KEY(collegeId), Date.now().toString())
    } catch {
      // ignore
    }
    setApplied(true)
    setOpen(false)
  }

  // ── Already applied state ────────────────────────────────────────────────
  if (applied) {
    return (
      <div className="mt-4">
        <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl">
          <CheckCircle className="w-4 h-4" />
          Admission request sent
        </div>
        <p className="mt-1.5 text-center text-xs text-gray-400">
          Saved in SikshyaNepal. Response time depends on the college.
        </p>
      </div>
    )
  }

  // ── Apply Now button ─────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1847c4] text-white text-sm font-semibold rounded-xl hover:bg-[#1340b0] transition-colors shadow-sm"
      >
        <Send className="w-4 h-4" />
        Request admission information
      </button>

      {open && (
        <ApplyNowModal
          collegeName={collegeName}
          collegeId={collegeId}
          isSponsored={isSponsored}
          programs={programs}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
