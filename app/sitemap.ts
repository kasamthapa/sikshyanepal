import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { careers } from '@/lib/careers'
import { COLLEGE_NEWS_TOPICS } from '@/lib/college-news'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sikshyanepal.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()

  const [admissions, schoolCount, colleges, results, notices, news, programs] = await Promise.all([
    supabase
      .from('admissions')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false }),
    supabase
      .from('schools')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .neq('verification_status', 'unverified'),
    supabase
      .from('colleges')
      .select('slug, created_at, updated_at, district, province')
      .or('status.eq.active,status.is.null')
      .order('created_at', { ascending: false }),
    supabase
      .from('results')
      .select('slug, published_date')
      .order('published_date', { ascending: false })
      .limit(500),
    supabase
      .from('notices')
      .select('slug, published_date')
      .order('published_date', { ascending: false })
      .limit(500),
    supabase
      .from('news')
      .select('slug, published_date')
      .eq('status', 'published')
      .order('published_date', { ascending: false })
      .limit(200),
    supabase
      .from('programs')
      .select('slug, created_at, updated_at'),
  ])

  // Supabase projects commonly cap one REST response at 1,000 rows. Fetch every
  // school page so the CEHRD directory is not silently reduced to its first 1,000 URLs.
  const schoolPageSize = 1000
  const schoolPages = await Promise.all(Array.from({ length: Math.ceil((schoolCount.count || 0) / schoolPageSize) }, (_, page) =>
    supabase
      .from('schools')
      .select('slug, updated_at, district, local_level, province')
      .eq('status', 'active')
      .neq('verification_status', 'unverified')
      .order('name')
      .range(page * schoolPageSize, (page + 1) * schoolPageSize - 1)
  ))
  const schools = { data: schoolPages.flatMap(page => page.data || []) }

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:             BASE_URL,
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${BASE_URL}/admissions`,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/schools/compare`,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${BASE_URL}/submit-school`,
      changeFrequency: 'monthly',
      priority:        0.6,
    },
    {
      url:             `${BASE_URL}/schools`,
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/colleges`,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/results`,
      changeFrequency: 'hourly',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/notices`,
      changeFrequency: 'hourly',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/news`,
      changeFrequency: 'daily',
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/news/feed.xml`,
      changeFrequency: 'hourly',
      priority:        0.5,
    },
    {
      url:             `${BASE_URL}/programs`,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/careers`,
      changeFrequency: 'monthly',
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/compare`,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${BASE_URL}/scholarships`,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${BASE_URL}/entrance-exams`,
      changeFrequency: 'daily',
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/study-resources`,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/deadlines`,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/about/editorial-policy`,
      lastModified:    new Date('2026-09-08'),
      changeFrequency: 'monthly',
      priority:        0.5,
    },
  ]

  // ── Dynamic routes ─────────────────────────────────────────────────────────
  const admissionRoutes: MetadataRoute.Sitemap = (admissions.data ?? []).map((a) => ({
    url:             `${BASE_URL}/admissions/${a.slug}`,
    lastModified:    new Date(a.updated_at),
    changeFrequency: 'daily' as const,
    priority:        0.8,
  }))

  const schoolRoutes: MetadataRoute.Sitemap = (schools.data ?? []).map((s) => ({
    url:             `${BASE_URL}/schools/${s.slug}`,
    lastModified:    new Date(s.updated_at),
    changeFrequency: 'monthly' as const,
    priority:        0.8,
  }))

  const collegeRoutes: MetadataRoute.Sitemap = (colleges.data ?? []).map((c) => ({
    url:             `${BASE_URL}/colleges/${c.slug}`,
    lastModified:    new Date(c.updated_at || c.created_at),
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }))

  const resultRoutes: MetadataRoute.Sitemap = (results.data ?? []).map((r) => ({
    url:             `${BASE_URL}/results/${r.slug}`,
    lastModified:    new Date(r.published_date),
    changeFrequency: 'never' as const,
    priority:        0.7,
  }))

  const noticeRoutes: MetadataRoute.Sitemap = (notices.data ?? []).map((n) => ({
    url:             `${BASE_URL}/notices/${n.slug}`,
    lastModified:    new Date(n.published_date),
    changeFrequency: 'never' as const,
    priority:        0.7,
  }))

  const newsRoutes: MetadataRoute.Sitemap = (news.data ?? []).map((n) => ({
    url:             `${BASE_URL}/news/${n.slug}`,
    lastModified:    new Date(n.published_date),
    changeFrequency: 'never' as const,
    priority:        0.7,
  }))

  const programRoutes: MetadataRoute.Sitemap = (programs.data ?? []).map((p) => ({
    url:             `${BASE_URL}/programs/${p.slug}`,
    lastModified:    new Date(p.updated_at || p.created_at),
    changeFrequency: 'monthly' as const,
    priority:        0.6,
  }))

  const careerRoutes: MetadataRoute.Sitemap = careers.map((career) => ({
    url: `${BASE_URL}/careers/${career.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  const programCollegeRoutes: MetadataRoute.Sitemap = (programs.data ?? []).map((p) => ({ url: `${BASE_URL}/colleges/program/${p.slug}`, lastModified: new Date(p.updated_at || p.created_at), changeFrequency: 'weekly' as const, priority: 0.75 }))
  const locationRoutes: MetadataRoute.Sitemap = Array.from(new Set((colleges.data ?? []).map(c => c.district).filter(Boolean))).map(district => ({ url: `${BASE_URL}/colleges/in/${String(district).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, changeFrequency: 'weekly' as const, priority: 0.7 }))
  const schoolDistrictRoutes: MetadataRoute.Sitemap = Array.from(new Set((schools.data ?? []).map(s => s.district).filter(Boolean))).map(district => ({ url: `${BASE_URL}/schools/in/${String(district).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, changeFrequency: 'weekly' as const, priority: 0.7 }))
  const municipalityRoutes: MetadataRoute.Sitemap = Array.from(new Set((schools.data ?? []).map(s => s.local_level).filter(Boolean))).map(municipality => ({ url: `${BASE_URL}/schools/municipality/${String(municipality).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, changeFrequency: 'weekly' as const, priority: 0.65 }))
  const schoolProvinceRoutes: MetadataRoute.Sitemap = Array.from(new Set((schools.data ?? []).map(s => s.province).filter(Boolean))).map(province => ({ url: `${BASE_URL}/schools/province/${String(province).toLowerCase()}`, changeFrequency: 'weekly' as const, priority: 0.7 }))
  const collegeProvinceRoutes: MetadataRoute.Sitemap = Array.from(new Set((colleges.data ?? []).map(c => c.province).filter(Boolean))).map(province => ({ url: `${BASE_URL}/colleges/province/${String(province).toLowerCase()}`, changeFrequency: 'weekly' as const, priority: 0.7 }))
  const collegeNewsTopicRoutes: MetadataRoute.Sitemap = Object.keys(COLLEGE_NEWS_TOPICS).map(topic => ({ url: `${BASE_URL}/news/topic/${topic}`, changeFrequency: 'daily' as const, priority: 0.8 }))

  return [
    ...staticRoutes,
    ...admissionRoutes,
    ...schoolRoutes,
    ...collegeRoutes,
    ...resultRoutes,
    ...noticeRoutes,
    ...newsRoutes,
    ...programRoutes,
    ...careerRoutes,
    ...programCollegeRoutes,
    ...locationRoutes,
    ...schoolDistrictRoutes,
    ...municipalityRoutes,
    ...schoolProvinceRoutes,
    ...collegeProvinceRoutes,
    ...collegeNewsTopicRoutes,
  ]
}
