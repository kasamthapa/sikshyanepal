# SikshyaNepal interface system

This is the source of truth for public student-facing UI. The automated catalog did not return a suitable higher-education directory match, so this system retains SikshyaNepal's established identity and applies the skill's verified accessibility, responsive-layout, navigation, and interaction defaults.

## Product character

- Trustworthy, calm, practical and distinctly editorial.
- Designed first for Nepali students on low-cost Android phones and variable mobile data.
- Information and source clarity take priority over decoration.
- Do not use childish education motifs, claymorphism, glass effects, neon gradients or decorative motion.

## Foundations

- Primary: `#1e429f`; hover/pressed: `#173782`; focus: `#f97316`.
- Accent: `#c93b37`, reserved for Nepal identity, urgent editorial cues and small highlights.
- Page: `#f8f7f3`; card: `#ffffff`; text: `#0f1629`; secondary text: `#374151`; muted text: `#667085`.
- Heading: Sora with a restrained editorial voice. Body: DM Sans. Data: DM Mono.
- Use the existing 4/8px spacing rhythm, 12–16px card radii and restrained shadow scale.

## Interaction rules

- One obvious primary action per section; subordinate supporting actions.
- Web pointer targets must meet WCAG 2.2 sizing; mobile targets should be at least 44×44 CSS px.
- Every icon-only control has an accessible name and visible focus state.
- Async actions immediately expose loading, success or recovery-oriented error feedback.
- Do not rely on hover. Preserve browser back behavior, filters and deep links.

## Responsive rules

- Verify at 375, 768, 1024 and 1440px, plus phone landscape.
- No page-level horizontal overflow. Grid and flex children containing long content require `min-w-0`.
- Bottom navigation contains no more than five labelled top-level destinations.
- Secondary destinations remain available through a reliable, labelled drawer.
- Fixed UI must respect safe-area insets and must not obscure content or keyboard focus.

## Content and trust

- Lead with the answer, deadline, cost or eligibility—not promotional prose.
- Display source and last-checked date beside changing claims.
- Never equate featured editorial placement with paid sponsorship.
- Empty states explain whether data is genuinely absent or temporarily unavailable and provide a next action.
- Nepali and English text must wrap naturally without clipping or forced truncation.

## Motion and performance

- Motion communicates state only. Prefer opacity/transform and keep the interface interruptible.
- Respect `prefers-reduced-motion` and `prefers-reduced-data`.
- Reserve image and asynchronous-content space to avoid layout shifts.
- Prefer server-rendered useful content and lightweight skeletons over blocking spinners.

## Delivery gate

- Keyboard navigation, focus order, contrast and accessible names checked.
- Mobile targets measured and horizontal overflow checked.
- Loading, empty, error and success states verified.
- 375px phone, phone landscape, tablet and desktop tested.
- No placeholder copy, unsupported trust claim, fake testimonial or ambiguous sponsorship label ships.
