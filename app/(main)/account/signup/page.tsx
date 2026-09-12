import { redirect } from 'next/navigation'

export default function SignupRedirect({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : ''
  redirect(`/account/login?mode=register${next}`)
}
