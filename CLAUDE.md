# SikshyaNepal — Claude Code Context

## Project
Nepal's complete education platform for post-SEE students.
Live at: sikshyanepal.vercel.app
Repo: kasamthapa/sikshyanepal

## Stack
- Next.js 14 App Router + TypeScript
- Supabase (PostgreSQL) — pobwvtynnqgkbazunzib.supabase.co
- Tailwind CSS (custom design system — primary #1847c4, accent #f97316)
- Deployed on Vercel
- Python scrapers on GitHub Actions (every 6 hours)
- Resend for transactional email
- Google AdSense for monetisation

## Design System
- Canonical standard: `design-system/sikshyanepal/MASTER.md` and `docs/cognitive-ux-standard.md`
- Fonts: Sora (display/headings), DM Sans (body), DM Mono (numbers/badges)
- Primary: #1e429f | Accent: #c93b37 | Navy: #16233f | Page bg: #f8f7f3
- Tailwind tokens: primary, accent, navy, ink, card, border
- Components: .btn-primary, .chip-active, .chip-inactive, .section-tag, .section-tag-blue

### Cognitive UX rules — non-negotiable
- Start every page with purpose, relevance and one clear primary action; lead with decisions, facts, deadlines, costs or eligibility rather than promotional copy.
- Keep five or fewer primary navigation choices. Group, do not delete, secondary routes by student intent.
- Design mobile-first: 44px+ targets, visible keyboard focus, no hover-only functions, no horizontal overflow and useful states for loading, empty, error and success.
- Preserve cognitive fluency: clear headings, predictable links/buttons, readable type, deliberate whitespace and no fabricated urgency, activity or social proof.
- Protect performance: reserve content space, use motion only for state changes, respect reduced motion/data, and do not add heavy UI without a clear student benefit.

### Cognitive UX release gate — required before every UI or flow change
1. Read `docs/cognitive-ux-standard.md` and use `docs/ux-release-review.md` for the affected page or flow.
2. Verify the first screen answers purpose, relevance, and next action; preserve clear navigation, search, back behavior, accurate content, and privacy at data-collection points.
3. Test the changed flow at 375px, keyboard-only, and reduced motion. Run `npm run lint`, `npm run build`, and `git diff --check` before committing.
4. Do not claim a principle is satisfied without checking the actual page or flow. If a check requires live data, an external account, or a real device, record it as a follow-up rather than guessing.

## Principles
- Write clean, readable, maintainable code
- Mobile-first always
- Ask before making major architectural decisions
- If two ways exist, explain tradeoff and recommend one
- After every task tell me: what was built, what to test, next step
- Never delete existing working code without warning
- Keep SEO in mind for every page
- Commit and push after every change

## What's Built — Session 6 Complete

### Core Platform
- 13+ pages live (colleges, results, notices, news, programs, compare, scholarships)
- 12 Supabase tables with RLS
- Admin panel with full CRUD + System Info dashboard
- Scrapers running every 6 hours on GitHub Actions
- College filters, comparison, reviews, search

### Notifications
- Push notifications via OneSignal (SubscribeButton component)
- Email subscriptions via EmailSubscribe component (stores to `subscribers` table)
- Email delivery via Resend — lib/email.ts → sendResultNotification()
- POST /api/notify-subscribers (secret-guarded) — called by scrapers after new results
- GET /api/unsubscribe?email=&token= — sets subscriber is_active=false
- Unsubscribe links embedded in every result alert email

### Monetisation
- Google AdSense integrated in layout.tsx (afterInteractive, env-gated)
- AdUnit component: components/ads/AdUnit.tsx (client, no layout shift, responsive)
- Ad placements: results (after item 5), notices (after item 5), colleges (after row 2),
  news (after article 3), college profile sidebar (below Quick Info)

### SEO
- Sitemap: app/sitemap.ts — all pages with correct priorities and lastModified
  Homepage 1.0, /colleges|results|notices 0.9, /news|programs 0.8,
  individual colleges 0.8, results/notices/news 0.7, programs 0.6
- Robots: app/robots.ts — blocks /admin, /api, /search; blocks AI training bots

### Performance
- loading.tsx skeletons for /colleges, /results, /notices (animate-pulse)

## Required Environment Variables

### Vercel (Next.js app)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# Authentication uses Supabase Auth and the role stored in public.profiles.
NEXT_PUBLIC_ONESIGNAL_APP_ID=
RESEND_API_KEY=                        # from resend.com
NOTIFICATION_SECRET=                   # random string, shared with scrapers
NEXT_PUBLIC_SITE_URL=https://sikshyanepal.vercel.app
NEXT_PUBLIC_ADSENSE_CLIENT_ID=         # ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_RESULTS=      # slot id for results/notices pages
NEXT_PUBLIC_ADSENSE_SLOT_COLLEGES=     # slot id for colleges page
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=      # slot id for college profile sidebar
```

### GitHub Secrets (scrapers)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VERCEL_DEPLOY_HOOK_URL=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
FB_PAGE_ID=                            # optional
FB_PAGE_ACCESS_TOKEN=                  # optional
SIKSHYANEPAL_URL=https://sikshyanepal.vercel.app
NOTIFICATION_SECRET=                   # must match Vercel NOTIFICATION_SECRET
```

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
run_all.py collects new_records from result scrapers → calls notify_subscribers()

### Frontend components
- components/results/PdfViewer.tsx — client, iframe + Google Docs fallback
- components/ads/AdUnit.tsx — Google AdSense unit, client-only, no-layout-shift
- ResultCard / NoticeCard badges: green PDF, blue Image, red New
- results/[slug]/page.tsx, notices/[slug]/page.tsx, news/[slug]/page.tsx
  all handle pdf/image/link rendering with appropriate CTAs

## College Data Strategy

Nepal university websites (TU, KU, PU, NEB) are unreliable for scraping:
- Most return HTTP 500, timeout, or serve JS-rendered pages with no static HTML
- KU affiliated-colleges page has program names (BDS, BBIS) in column 1, not college names
- NEB school lists require authenticated/search-based access
- college_scraper.py exists but should not be relied on for bulk data

**Primary college data collection strategy — in priority order:**
1. **Manual entry** via `/admin/colleges/new` (admin panel)
2. **Public submission form** at `/submit-college` (reviewed at `/admin/colleges/pending`)
3. **SQL seeds** — insert well-known colleges directly in Supabase SQL editor

college_scraper.py is kept in the codebase and runs in run_all.py for opportunistic
scraping, but do not spend engineering time improving it further until university
websites become more stable/structured.

## Sessions Log
- Session 1: Project setup, Supabase schema, basic pages
- Session 2: Scraper pipeline, content extraction, admin panel
- Session 3: College profiles, reviews, comparison, search
- Session 4: UI redesign — Modern South Asian Digital direction, Sora/DM Sans/DM Mono
- Session 5: Final UI polish — cards, hero fan stack, program icons, loading states
- Session 6: AdSense, Resend email notifications, sitemap/robots, skeletons, admin System Info
- Session 7: +2 support, college submission form, admin review queue, nav dropdown fix, college scraper (deprioritised)
- Session 8: Apply Now lead capture system (primary revenue feature)

## Lead Capture System (Revenue)

The primary monetisation mechanism: colleges pay to receive qualified student leads.

### How it works
1. Student visits college profile → clicks **"Apply Now — It's Free"** button in sidebar
2. `ApplyNowModal` captures: name, phone (required), email (optional), program, message
3. `POST /api/apply` validates, inserts to `leads` table, emails admin via Resend
4. Admin works leads at `/admin/leads` — changes status: new → contacted → enrolled | rejected

### Database
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  college_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT,
  student_phone TEXT NOT NULL,
  program_interest TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',   -- 'new' | 'contacted' | 'enrolled' | 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON leads FOR ALL USING (auth.role() = 'service_role');
```

### Key files
- `components/colleges/ApplyNowButton.tsx` — client wrapper (button + modal toggle + lead counter)
- `components/colleges/ApplyNowModal.tsx` — full modal with form, validation, success state
- `app/api/apply/route.ts` — POST: insert lead, send admin email
- `app/api/admin/leads/route.ts` — GET: list all leads (admin)
- `app/api/admin/leads/[id]/route.ts` — PATCH status / DELETE
- `app/admin/leads/page.tsx` — admin UI: cards, filters, status updates, delete

### Lead counter
`getCollege()` queries leads for the current month:
```ts
.from("leads").select("id", { count: "exact", head: true })
  .eq("college_id", college.id).gte("created_at", monthStart)
```
Shown below Apply Now button: "X students applied this month"

### Revenue model
- Phase 1 (now): Capture leads, build proof-of-concept dataset
- Phase 2: Charge colleges per qualified lead (phone-verified application)
- Phase 3: Subscription dashboard for colleges to view their own leads
