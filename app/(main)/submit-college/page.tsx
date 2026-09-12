import { Metadata } from 'next'
import { Building2, Clock, ShieldCheck } from 'lucide-react'
import SubmitCollegeForm from '@/components/colleges/SubmitCollegeForm'

export const metadata: Metadata = {
  title: 'Add Your College',
  description: 'Submit your college to SikshyaNepal. Help students discover your institution. Reviewed and published within 48 hours.',
}

export default function SubmitCollegePage() {
  return (
    <div className="bg-[#f0f4ff] min-h-screen">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#1847c4]" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              College Submission
            </p>
          </div>
          <h1
            className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3"
            style={{ letterSpacing: '-0.025em' }}
          >
            Add Your College to SikshyaNepal
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
            Help students discover your institution. Submissions are reviewed within 48 hours
            and published to Nepal&apos;s most visited education portal.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-5 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              Reviewed within 48 hours
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
              No login required
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              Free listing
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SubmitCollegeForm />
      </div>
    </div>
  )
}
