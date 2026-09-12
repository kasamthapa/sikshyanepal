import { redirect } from 'next/navigation'

export default function CollegeFinderRedirect({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach(item => params.append(key, item))
    else if (value) params.set(key, value)
  })
  redirect(`/colleges${params.size ? `?${params}` : ''}`)
}
