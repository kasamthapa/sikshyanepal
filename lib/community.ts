export const COMMUNITY_TOPICS = [
  { value: 'college-life', label: 'College life' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'programs', label: 'Programs & careers' },
  { value: 'entrance-exams', label: 'Entrance exams' },
  { value: 'scholarships', label: 'Scholarships' },
  { value: 'study-help', label: 'Study help' },
  { value: 'wellbeing', label: 'Student wellbeing' },
  { value: 'other', label: 'Other' },
] as const

export type CommunityTopic = typeof COMMUNITY_TOPICS[number]['value']

export type CommunityPost = {
  id: string
  title: string
  body: string
  topic: CommunityTopic
  status: 'pending' | 'published' | 'rejected' | 'hidden'
  created_at: string
  published_at: string | null
  media_url?: string | null
  media_path?: string | null
  media_type?: 'image' | 'video' | null
  public_alias?: string | null
  vote_score?: number
  community_comments?: { count: number }[]
}

export type CommunityComment = {
  id: string
  post_id: string
  body: string
  status: 'pending' | 'published' | 'rejected' | 'hidden'
  created_at: string
  published_at: string | null
  vote_score?: number
  public_alias?: string | null
}

export function topicLabel(topic: string) {
  return COMMUNITY_TOPICS.find(item => item.value === topic)?.label || 'Other'
}
