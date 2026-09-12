'use client'

/* eslint-disable @next/next/no-img-element -- announcement images are admin-supplied external URLs. */
import Link from 'next/link'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Announcement = {
  id: string
  title: string
  message: string
  image_url: string | null
  link_url: string | null
  link_label: string | null
  placement: 'banner' | 'popup'
}

export default function SiteAnnouncement() {
  const [item, setItem] = useState<Announcement | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/announcements', { cache: 'no-store', signal: controller.signal })
      .then(async response => response.ok ? response.json() : [])
      .then(data => {
        if (!Array.isArray(data)) return
        const visible = data.find(announcement => (
          sessionStorage.getItem(`sn_announcement_${announcement.id}`) !== 'dismissed'
        ))
        if (visible) setItem(visible)
      })
      .catch(error => {
        if (error instanceof Error && error.name !== 'AbortError') console.warn('Announcement could not be loaded.')
      })
    return () => controller.abort()
  }, [])

  if (!item) return null

  const close = () => {
    sessionStorage.setItem(`sn_announcement_${item.id}`, 'dismissed')
    setItem(null)
  }

  const body = (
    <>
      <div className="min-w-0 flex-1">
        {item.image_url && <img src={item.image_url} alt={`Announcement: ${item.title}`} width="640" height="240" loading="lazy" decoding="async" className="mb-3 h-36 w-full rounded-xl object-cover" />}
        <strong className="block pr-7 font-display text-lg leading-snug">{item.title}</strong>
        <p className="mt-1.5 leading-6 text-amber-900/80">{item.message}</p>
        {item.link_url && (
          <Link href={item.link_url} className="mt-4 inline-flex rounded-lg bg-amber-950 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900">
            {item.link_label || 'Learn more'} →
          </Link>
        )}
      </div>
      <button type="button" onClick={close} aria-label="Dismiss announcement" className="absolute right-2 top-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-amber-950/60 hover:bg-amber-100 hover:text-amber-950 active:bg-amber-200">
        <X className="h-4 w-4" />
      </button>
    </>
  )

  return item.placement === 'popup' ? (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-[2px] sm:items-center" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby={`announcement-${item.id}`} className="relative w-full max-w-md rounded-2xl bg-amber-50 p-6 text-sm text-amber-950 shadow-2xl">
        <span id={`announcement-${item.id}`} className="sr-only">Site announcement: {item.title}</span>
        {body}
      </section>
    </div>
  ) : (
    <aside className="border-b border-amber-200 bg-amber-50" aria-label="Site announcement">
      <div className="relative mx-auto flex max-w-7xl gap-3 px-4 py-3 text-sm text-amber-950 sm:px-6">{body}</div>
    </aside>
  )
}
