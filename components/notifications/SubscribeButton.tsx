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

function ensureOneSignal() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  if (!appId) return Promise.reject(new Error('not-configured'))
  if (document.querySelector('script[data-sikshyanepal-onesignal]')) return Promise.resolve()
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async os => {
    const service = os as OneSignalAPI & { init?: (options: Record<string, unknown>) => Promise<void> }
    if (service.init) await service.init({ appId, serviceWorkerPath: '/OneSignalSDKWorker.js', notifyButton: { enable: false }, allowLocalhostAsSecureOrigin: true })
  })
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    script.dataset.sikshyanepalOnesignal = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('load-failed'))
    document.head.appendChild(script)
  })
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
  const [error, setError]               = useState('')

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

  const handleSubscribe = useCallback(async () => {
    setError('')
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setError('Push alerts are not supported in this browser. You can still use email alerts.')
      return
    }
    if (Notification.permission === 'denied') {
      setError('Notifications are blocked. Allow them in your browser site settings, then try again.')
      return
    }
    setRequesting(true)
    try {
      await ensureOneSignal()
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('timeout')), 10000)
        window.OneSignalDeferred = window.OneSignalDeferred || []
        window.OneSignalDeferred.push(async (os) => {
          try {
            await os.Notifications.requestPermission()
            setSubscribed(os.Notifications.permission || Notification.permission === 'granted')
            if (!os.Notifications.permission && Notification.permission !== 'granted') throw new Error('not-granted')
            resolve()
          } catch (reason) {
            reject(reason)
          } finally {
            window.clearTimeout(timeout)
          }
        })
      })
      setModalOpen(false)
    } catch (reason) {
      setError(reason instanceof Error && reason.message === 'not-granted'
        ? 'Notification permission was not granted. Check your browser settings and try again.'
        : 'Alerts could not be enabled right now. Please try again later.')
    } finally {
      setRequesting(false)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    setModalOpen(false)
    setDismissed(true)
    localStorage.setItem('sn_push_dismissed', '1')
  }, [])

  // The modal (shared between both variants)
  const modal = modalOpen && (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="notification-dialog-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 duration-200">
        <button
          onClick={handleDismiss}
          aria-label="Close notification dialog"
          className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bell className="w-7 h-7 text-blue-600" />
        </div>

        <h3 id="notification-dialog-title" className="text-lg font-bold text-gray-900 text-center mb-2">
          Get result and notice alerts
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          SikshyaNepal will notify you when it publishes a new TU, KU, NEB or CTEVT update.
        </p>

        {error && <p role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">{error}</p>}

        <button
          onClick={handleSubscribe}
          disabled={requesting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors mb-3"
        >
          <Bell className="w-4 h-4" />
          {requesting ? 'Enabling…' : 'Enable alerts'}
        </button>

        <button
          onClick={handleDismiss}
          className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {requesting ? 'Close' : 'Maybe later'}
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
          aria-label={subscribed ? 'Notifications enabled' : 'Enable result and notice notifications'}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
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
        className="lg:hidden fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        aria-label="Subscribe for result notifications"
      >
        <Sparkles className="w-4 h-4" />
        Get Alerts
      </button>
      {modal}
    </>
  )
}
