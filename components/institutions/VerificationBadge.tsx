import { BadgeCheck, CircleAlert } from 'lucide-react'
import type { VerificationStatus } from '@/types'

const COPY: Record<VerificationStatus, { label: string; className: string }> = {
  institution_verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  source_verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  unverified: {
    label: 'Unverified',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
}

export default function VerificationBadge({
  status = 'unverified',
  compact = false,
}: {
  status?: VerificationStatus
  compact?: boolean
}) {
  const item = COPY[status]
  const Icon = status === 'unverified' ? CircleAlert : BadgeCheck
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${item.className} ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
      title={
        status === 'unverified'
          ? 'This profile is not yet verified.'
          : 'This profile is verified.'
      }
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {item.label}
    </span>
  )
}
