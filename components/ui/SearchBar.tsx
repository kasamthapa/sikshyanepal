'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  redirectTo?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  initialValue?: string
}

export default function SearchBar({
  placeholder = 'Search colleges, programs...',
  redirectTo = '/colleges',
  className = '',
  size = 'md',
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(query.trim() ? `${redirectTo}?q=${encodeURIComponent(query.trim())}` : redirectTo)
  }

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-sm',
    lg: 'h-14 text-base',
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={`relative ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`w-full rounded-xl border border-[#d4d1ca] bg-white pl-12 pr-32 text-ink shadow-[0_1px_2px_rgba(15,22,41,0.04)] placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${sizeClasses[size]}`}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-[5.75rem] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-[#f3f1eb] hover:text-ink">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 min-h-10 -translate-y-1/2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-600"
        >
          Search
        </button>
      </div>
    </form>
  )
}
