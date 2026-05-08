import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'

const BASE_URL = 'https://sikshyanepal.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()

  const [colleges, results, notices, news, programs] = await Promise.all([
    supabase.from('colleges').select('slug, created_at').order('created_at', { ascending: false }),
    supabase.from('results').select('slug, published_date').order('published_date', { ascending: false }).limit(200),
    supabase.from('notices').select('slug, published_date').order('published_date', { ascending: false }).limit(200),
    supabase.from('news').select('slug, published_date').order('published_date', { ascending: false }).limit(100),
    supabase.from('programs').select('slug, created_at'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/colleges`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/results`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/notices`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/programs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/scholarships`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const collegeRoutes: MetadataRoute.Sitemap = (colleges.data || []).map((c) => ({
    url: `${BASE_URL}/colleges/${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const resultRoutes: MetadataRoute.Sitemap = (results.data || []).map((r) => ({
    url: `${BASE_URL}/results/${r.slug}`,
    lastModified: new Date(r.published_date),
    changeFrequency: 'never',
    priority: 0.7,
  }))

  const noticeRoutes: MetadataRoute.Sitemap = (notices.data || []).map((n) => ({
    url: `${BASE_URL}/notices/${n.slug}`,
    lastModified: new Date(n.published_date),
    changeFrequency: 'never',
    priority: 0.6,
  }))

  const newsRoutes: MetadataRoute.Sitemap = (news.data || []).map((n) => ({
    url: `${BASE_URL}/news/${n.slug}`,
    lastModified: new Date(n.published_date),
    changeFrequency: 'never',
    priority: 0.6,
  }))

  const programRoutes: MetadataRoute.Sitemap = (programs.data || []).map((p) => ({
    url: `${BASE_URL}/programs/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...collegeRoutes, ...resultRoutes, ...noticeRoutes, ...newsRoutes, ...programRoutes]
}
