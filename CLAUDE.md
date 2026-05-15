# SikshyaNepal — Claude Code Context

## Project
Nepal's complete education platform for post-SEE students.
Live at: sikshyanepal.vercel.app
Repo: kasamthapa/sikshyanepal

## Stack
- Next.js 14 App Router + TypeScript
- Supabase (PostgreSQL) — pobwvtynnqgkbazunzib.supabase.co
- Tailwind CSS
- Deployed on Vercel
- Python scrapers on GitHub Actions

## Principles
- Write clean, readable, maintainable code
- Mobile-first always
- Ask before making major architectural decisions
- If two ways exist, explain tradeoff and recommend one
- After every task tell me: what was built, what to test, next step
- Never delete existing working code without warning
- Keep SEO in mind for every page

## What's Built
- 13 pages live and working
- 12 Supabase tables with RLS
- Admin panel with full CRUD
- Scrapers running every 6 hours
- College filters, comparison, reviews, search
- Push notifications and email subscriptions

## Key Differentiator — Inline Content Viewing
SikshyaNepal shows results, notices, and news DIRECTLY on platform.
CollegesNepal only links away; we embed everything inline.

### content_type column (results, notices, news tables)
Values: 'pdf' | 'image' | 'link'
- 'pdf'   → embedded via PdfViewer iframe (Google Docs Viewer fallback)
- 'image' → rendered as <img> with download/full-size buttons
- 'link'  → external link with "visit official site" message

### Storage columns
- results.result_pdf_url  — PDF or image URL (use content_type to decide renderer)
- notices.notice_pdf_url  — same pattern
- news.news_pdf_url       — same pattern

### Scraper pipeline
base_scraper.extract_content(item_url) → {"url", "type"}
1. Fast path: item_url itself ends in .pdf → type='pdf', no HTTP
2. Fetch linked page (10 s timeout) → find_pdf_links() → type='pdf'
3. Fetch linked page → find_image_links() → type='image'
4. Fallback → type='link', url=None
Called only for NEW records (check_exists first) to avoid re-fetching.
All 7 scrapers call extract_content() in process_items().

### Frontend components
- components/results/PdfViewer.tsx — client, iframe + Google Docs fallback
- ResultCard / NoticeCard badges: green PDF, blue Image, emerald New
- results/[slug]/page.tsx, notices/[slug]/page.tsx, news/[slug]/page.tsx
  all handle pdf/image/link rendering with appropriate CTAs
