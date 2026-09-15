import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { CommunityComment, CommunityPost } from '@/lib/community'
import { topicLabel } from '@/lib/community'
import ReplyForm from '@/components/community/ReplyForm'
import ReportButton from '@/components/community/ReportButton'
import CommunityMedia from '@/components/community/CommunityMedia'
import VoteButtons from '@/components/community/VoteButtons'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Student Discussion | SikshyaNepal', robots: { index: false, follow: true } }
}

async function load(id: string) {
  const db = createServerSupabaseClient()
  const loadPost = (includePrivateMediaPath: boolean) => db.from('community_posts')
    .select(includePrivateMediaPath
      ? 'id,title,body,topic,status,created_at,published_at,media_url,media_path,media_type,vote_score,public_alias'
      : 'id,title,body,topic,status,created_at,published_at,media_url,media_type,vote_score,public_alias')
    .eq('id', id).eq('status', 'published').single()
  const [firstPost, commentResult] = await Promise.all([
    loadPost(true),
    db.from('community_comments').select('id,post_id,body,status,created_at,published_at,vote_score,public_alias').eq('post_id', id).eq('status', 'published').order('vote_score', { ascending: false }).order('published_at', { ascending: true }).limit(200),
  ])
  let post = firstPost.data
  if (firstPost.error?.code === '42703' && firstPost.error.message.includes('media_path')) {
    const legacyPost = await loadPost(false)
    post = legacyPost.data
  }
  const comments = commentResult.data
  return { post: post as CommunityPost | null, comments: (comments || []) as CommunityComment[] }
}

export default async function CommunityPostPage({ params }: { params: { id: string } }) {
  const { post, comments } = await load(params.id)
  if (!post) notFound()
  return <main className="min-h-screen bg-[#f6f7fb]"><div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
    <Link href="/community" className="text-sm font-bold text-primary">← All discussions</Link>
    <article className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{topicLabel(post.topic)}</span><span className="text-gray-400">@{post.public_alias || 'LegacyStudent'}</span></div>
      <h1 className="mt-4 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">{post.title}</h1>
      {post.body && <p className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-700">{post.body}</p>}
      <div className="mt-5"><CommunityMedia url={post.media_path ? `/api/community/media/${post.id}` : post.media_url} type={post.media_type}/></div>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-4"><VoteButtons targetType="post" targetId={post.id} initialScore={post.vote_score}/><div className="text-right"><span className="mr-3 text-xs text-gray-400">Shared experience—not verified information</span><ReportButton targetType="post" targetId={post.id}/></div></div>
    </article>
    <section className="mt-7"><h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink"><MessageCircle className="h-5 w-5 text-primary"/>{comments.length} replies</h2><div className="mt-4 space-y-3">
      {comments.map(comment => <article key={comment.id} className="rounded-2xl border border-gray-200 bg-white p-5"><p className="text-xs font-bold text-gray-400">@{comment.public_alias || 'LegacyStudent'}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{comment.body}</p><div className="mt-3 flex items-center justify-between"><VoteButtons targetType="comment" targetId={comment.id} initialScore={comment.vote_score}/><ReportButton targetType="comment" targetId={comment.id}/></div></article>)}
      {!comments.length && <p className="rounded-xl bg-white p-5 text-sm text-gray-500">No published replies yet.</p>}
    </div></section>
    <div className="mt-7"><ReplyForm postId={post.id}/></div>
    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-500"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"/>Replies are moderated. Account details remain private unless disclosure is legally required. Do not use this community for emergencies or unverified accusations.</p>
  </div></main>
}
