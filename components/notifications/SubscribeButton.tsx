'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, Sparkles } from 'lucide-react'

// Minimal OneSignal type — only what we use
declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: OneSignalAPI) => Promise<void> | void>
  }
}
interface OneSignalAPI {
  Notifications: {
    permission: boolean
    requestPermission: () => Promise<void>
  }
}

type Variant = 'float' | 'header'

interface Props {
  variant: Variant
}

export default function SubscribeButton({ variant }: Props) {
  const [modalOpen, setModalOpen]       = useState(false)
  const [subscribed, setSubscribed]     = useState(false)
  const [requesting, setRequesting]     = useState(false)
  const [dismissed, setDismissed]       = useState(false)

  // Check subscription state once SDK is ready
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push((os) => {
      setSubscribed(os.Notifications.permission)
    })
    // Also load dismissed state from localStorage
    setDismissed(localStorage.getItem('sn_push_dismissed') === '1')
  }, [])

  const handleSubscribe = useCallback(() => {
    setRequesting(true)
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (os) => {
      try {
        await os.Notifications.requestPermission()
        setSubscribed(os.Notifications.permission)
      } finally {
        setRequesting(false)
        setModalOpen(false)
      }
    })
  }, [])

  const handleDismiss = useCallback(() => {
    setModalOpen(false)
    setDismissed(true)
    localStorage.setItem('sn_push_dismissed', '1')
  }, [])

  // The modal (shared between both variants)
  const modal = modalOpen && (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 duration-200">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bell className="w-7 h-7 text-blue-600" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Get instant alerts when exam results drop
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Be the first to know when TU, KU, NEB, and CTEVT publish new results and notices.
          No spam — only real updates.
        </p>

        <button
          onClick={handleSubscribe}
          disabled={requesting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors mb-3"
        >
          <Bell className="w-4 h-4" />
          {requesting ? 'Enabling…' : 'Subscribe for free'}
        </button>

        <button
          onClick={handleDismiss}
          className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  )

  // ── Header variant (desktop bell icon) ──
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={() => subscribed ? undefined : setModalOpen(true)}
          title={subscribed ? 'Notifications enabled' : 'Enable notifications'}
          className={`p-2 rounded-lg transition-colors ${
            subscribed
              ? 'text-blue-600 bg-blue-50 cursor-default'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          {subscribed ? <Bell className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        </button>
        {modal}
      </>
    )
  }

  // ── Float variant (mobile bottom-right) ──
  // Don't render once subscribed or permanently dismissed
  if (subscribed || dismissed) return null

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        aria-label="Subscribe for result notifications"
      >
        <Sparkles className="w-4 h-4" />
        Get Alerts
      </button>
      {modal}
    </>
  )
}
