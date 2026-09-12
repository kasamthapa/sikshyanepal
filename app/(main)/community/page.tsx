import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { COMMUNITY_TOPICS, CommunityPost, topicLabel } from '@/lib/community'
import NewPostForm from '@/components/community/NewPostForm'
import CommunityMedia from '@/components/community/CommunityMedia'
import VoteButtons from '@/components/community/VoteButtons'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Student Community | SikshyaNepal', description: 'A moderated, pseudonymous space for students in Nepal to discuss college and study life safely.', alternates: { canonical: '/community' }, robots: { index: false, follow: true } }

async function getPosts(topic?: string, sort?: string) {
  const db = createServerSupabaseClient()
  let query = db.from('community_posts').select('id,title,body,topic,status,created_at,published_at,media_url,media_type,vote_score,public_alias,community_comments(count)').eq('status', 'published')
  query = sort === 'top' ? query.order('vote_score', { ascending: false }).order('published_at', { ascending: false }) : query.order('published_at', { ascending: false })
  if (topic && COMMUNITY_TOPICS.some(item => item.value === topic)) query = query.eq('topic', topic)
  const { data, error } = await query.limit(50)
  return { posts: (data || []) as CommunityPost[], failed: Boolean(error) }
}

function timeLabel(value: string | null) {
  return value ? new Intl.DateTimeFormat('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Recently'
}

export default async function CommunityPage({ searchParams }: { searchParams: { topic?: string; sort?: string } }) {
  const { posts, failed } = await getPosts(searchParams.topic, searchParams.sort)
  return <main className="min-h-screen bg-[#f6f7fb]">
    <section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Student community</p><h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">Speak freely under a name you choose.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Google sign-in keeps the community accountable, but students only see your chosen public name. Your real name and email stay private. Every post and reply is reviewed before publication.</p><div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0"/><span>Never share contact details, precise addresses, private messages, threats, accusations or identifying details. This board is not an emergency service.</span></div></div></section>
    <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><nav aria-label="Community topics" className="flex gap-2 overflow-x-auto pb-2"><Link href={`/community${searchParams.sort === 'top' ? '?sort=top' : ''}`} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${!searchParams.topic ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'}`}>All topics</Link>{COMMUNITY_TOPICS.map(item => <Link key={item.value} href={`/community?topic=${item.value}${searchParams.sort === 'top' ? '&sort=top' : ''}`} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${searchParams.topic === item.value ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'}`}>{item.label}</Link>)}</nav><div className="flex rounded-lg border border-gray-200 bg-white p-1 text-xs font-bold"><Link href={`/community${searchParams.topic ? `?topic=${searchParams.topic}` : ''}`} className={`rounded-md px-3 py-1.5 ${searchParams.sort !== 'top' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>New</Link><Link href={`/community?${searchParams.topic ? `topic=${searchParams.topic}&` : ''}sort=top`} className={`rounded-md px-3 py-1.5 ${searchParams.sort === 'top' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>Top</Link></div></div>
        {failed ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900"><h2 className="font-bold">Community could not load</h2><p className="mt-2 text-sm">Install the newest community database migration and try again.</p></div> : posts.length ? <div className="space-y-3">{posts.map(post => <article key={post.id} className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"><div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{topicLabel(post.topic)}</span><span className="text-gray-400">@{post.public_alias || 'LegacyStudent'} · {timeLabel(post.published_at || post.created_at)}</span></div><Link href={`/community/${post.id}`}><h2 className="mt-3 text-lg font-bold text-ink hover:text-primary">{post.title}</h2>{post.body && <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{post.body}</p>}</Link><div className="mt-4"><CommunityMedia url={post.media_url} type={post.media_type} compact/></div><div className="mt-4 flex items-center justify-between"><VoteButtons targetType="post" targetId={post.id} initialScore={post.vote_score}/><p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><MessageCircle className="h-4 w-4"/>{post.community_comments?.[0]?.count || 0} replies</p></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><MessageCircle className="mx-auto h-10 w-10 text-gray-300"/><h2 className="mt-4 font-bold text-ink">No published discussions yet</h2><p className="mt-2 text-sm text-gray-500">Start a useful discussion. It will appear after moderation.</p></div>}
      </div>
      <aside><NewPostForm/><Link href="/community/my-content" className="mt-3 block text-center text-xs font-bold text-primary hover:underline">Manage my posts and replies</Link><div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">Community rules</h2><ul className="mt-3 space-y-2 text-xs leading-5 text-gray-600"><li>• Be respectful and useful.</li><li>• Never identify, threaten or target anyone.</li><li>• No contact details, ads, scams or exam leaks.</li><li>• No impersonation or unverified accusations.</li><li>• Read the <Link href="/community/guidelines" className="font-bold text-primary">full community rules</Link>.</li></ul></div></aside>
    </div>
  </main>
}
