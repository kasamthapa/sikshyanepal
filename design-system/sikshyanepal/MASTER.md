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
- Heading: Noto Serif with a restrained editorial voice. Body/UI: DM Sans. Data labels: DM Mono. Nepali: Noto Sans Devanagari.
- Page titles use a fluid 34–54px scale, compact line height and a 22-character measure. Body copy stays near 68 characters per line.
- Use the existing 4/8px spacing rhythm, 12–16px card radii and restrained shadow scale.

## Icons and visual assets

- **Lucide is the public-interface icon system.** Use its outline icons at a consistent stroke weight; do not mix in Material, Heroicons, emoji, or hand-drawn symbols on the same surface.
- Use an icon only when it improves scanning or makes a familiar action easier to recognise. Text labels remain required for primary navigation and important actions.
- Icon-only controls need an accessible name, a visible focus ring and a minimum 44px hit area. Decorative icons beside equivalent text use `aria-hidden="true"`.
- Use official, unmodified SVG artwork only for external brands and services (for example Google sign-in). Never invent a college logo, campus photograph, seal or accreditation mark.
- Add a new icon collection only when Lucide lacks a necessary, recurring concept. Keep it isolated to that product area and document why; a larger icon library is not a reason to mix visual languages.

## Component decisions

- **Status badges:** use them only for a simple student-facing state. Public institution profiles show `Verified` or `Unverified`; evidence confidence, stale-source warnings, extraction quality, moderation queues and completeness scores are admin-only.
- **Cards:** make a card a compact decision unit, not a decorative container. It needs a clear title, one task-relevant summary, and at most one visually dominant action. Prefer separators and spacing over coloured card backgrounds.
- **Modals and sheets:** use them for a focused action, never primary navigation. Provide an explicit close control, Escape/outside-click behaviour where safe, focus management and an obvious recovery path after errors.
- **Forms:** keep labels visible, errors adjacent to their field, and submission feedback specific. Avoid placeholder-only labels, decorative required fields or a disabled-looking action with no explanation.
- **Empty states:** explain the useful next step in student language. Never expose internal ingestion, source-review, confidence or moderation terminology on public pages.
- **Data tables and filters:** prioritise the student’s decision fields (location, level, programme, fee, deadline and verified state). Preserve filter state in the URL and avoid controls that require hover or exact pointer placement.

## Writing discipline

- Write as a careful Nepal education editor: name the thing, state the fact, then give the student the next action. Prefer `See the official notice` to vague labels such as `Learn more`.
- Remove stock AI phrasing: “here’s the thing,” “what nobody tells you,” “the best part,” “game-changing,” “seamless,” “unlock,” “empower,” “revolutionary,” “cutting-edge,” “comprehensive” and unsupported superlatives.
- Avoid false drama, binary contrast constructions, rhetorical questions and long scene-setting intros. A short, specific sentence is better than a polished-sounding one.
- Do not turn incomplete data into a public status dashboard. Show available facts, a `Verified` or `Unverified` signal, the original source when available, and a useful action.
- Before a public UI change ships, run `npm run check:slop`. The guard catches banned stock phrases and decorative public gradients; its failure is a review prompt, not permission to replace specific language with another generic phrase.

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
