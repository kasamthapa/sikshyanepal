# Cognitive UX Standard

## Purpose

SikshyaNepal helps students make high-stakes education decisions. Every interface change must reduce uncertainty, make the next useful action obvious, and preserve trust. This standard applies to public pages, account features, student planning, institution tools, admin screens, loading states, and future experiments.

## Evidence and interpretation

| Principle | Evidence | SikshyaNepal rule |
| --- | --- | --- |
| First impression | A five-second test measures a viewer’s first, instinctive interpretation of a design; it is a diagnostic method, not a universal “five-second rule.” [NN/g](https://www.nngroup.com/articles/testing-visual-design/?lm=accuracy-vs-insights-quantitative-ux&pt=article) | A first-time visitor should identify the product, the current task, and one primary action before scrolling. |
| Choice load | More visible choices make decision-making harder when people lack a clear preference. | Use five or fewer primary navigation categories. Group secondary destinations under meaningful headings; do not delete useful routes merely to make a menu look short. |
| Scanning | Eye-tracking research found that web readers often begin at the top, scan across, then scan down the left edge. This is a pattern, not a rigid template. [NN/g](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/) | Put the answer, eligibility, cost, deadline, source, or action at the start of a page and section. Begin headings and links with information-carrying words. |
| Cognitive fluency | Web readers usually scan rather than read linearly; clear headings and meaningful chunks help them choose what deserves attention. [NN/g](https://www.nngroup.com/articles/website-reading/) | Use plain language, one idea per block, readable measures, and deliberate white space. Do not use vague promotional labels or decorative information cards. |
| Familiarity | Familiar navigation and standard controls reduce the need to learn a new interaction model. | Use links for navigation, buttons for actions, visible labels, predictable search, browser back support, and ordinary form behavior. |
| Performance and stability | Google defines good Core Web Vitals as LCP within 2.5 seconds, INP below 200 ms, and CLS below 0.1. [Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals) | Do not add heavy client-side UI, unnecessary animation, or images without dimensions. Reserve space for asynchronous content. |

The review by Flavián, Gurrea, and Orús identifies simplicity, user control, accurate and timely content, search, download speed, and privacy as core elements of website success. Its evidence is drawn from e-commerce research published in 2008, before today’s mobile-first patterns; use its durable usability principles, not its old visual examples, alongside current accessibility and performance standards. [Source PDF](/Users/mac/Downloads/WebDesign-AKeyFactorfortheWebsiteSuccess_FlavianGurreaOrus.pdf)

## Required interface decisions

### Navigation

- Use no more than five primary desktop navigation categories.
- Group secondary routes by student intent, not by internal team ownership.
- Keep every current public route reachable from navigation, search, contextual links, or the footer.
- A menu button must announce whether it is expanded. A menu must close on Escape, outside click, and navigation.
- Mobile navigation must have a labelled, keyboard-safe drawer and a maximum of five bottom-level destinations.

### Page opening

- The first screen must answer: **What is this page? Is it relevant to me? What can I do now?**
- Use one primary CTA in a major section. Secondary actions must be visually quieter.
- Lead with a real changing fact when one exists: deadline, cost range, eligibility, source, or last-checked date.
- Do not use unsupported claims, fake activity, countdown pressure, testimonial placeholders, or invented scarcity.

### Content and decisions

- Compare choices using the same fields in the same order.
- For a college card, show decision evidence in this order: identity, location and affiliation, programme/level, comparable published fee, verification freshness, then review evidence. This gives students an immediate relevance check before social proof.
- Put eligibility, published fees, deadlines, programme information, source, and verification date before long descriptions on education profiles.
- Empty states must say whether information is absent, not yet verified, or temporarily unavailable—and link to a useful next action.
- Never treat a featured placement or paid institution content as independent editorial verification.

### Images, video, and interactive content

- Use real campus imagery only when it is accurate and has useful alt text. A missing image is better than an invented campus visual.
- Reserve image space and supply responsive `sizes` or dimensions to prevent layout shift. [web.dev](https://web.dev/learn/html/images)
- Video, polling, quizzes, and other interaction must help a student make a decision or learn a skill. They must not delay the primary task or autoplay unexpectedly.
- Every informative media item needs a text equivalent or clear nearby explanation.

### Information scent and feedback

- Name links for the destination and outcome—such as “View result,” “Compare colleges,” or “Check entrance requirements”—rather than generic labels such as “Click here” or “Learn more.” Users choose links using the cues in their labels and context. [NN/g](https://www.nngroup.com/articles/information-scent/?lm=cancel-vs-close&pt=article)
- When a student changes filters, searches, saves an institution, or updates a plan, confirm what changed in plain language without taking focus away.
- Treat a college directory as a decision list, not a promotional gallery. Summary attributes must let a student reject or investigate a listing without guessing.

### Forms and accounts

- Keep labels visible, use normal field order, support password managers and paste, and show recovery-oriented errors next to the affected field.
- Ask for an account only when a student is saving, posting, planning privately, or changing identity-linked data. Public research remains open.
- Do not make a student choose data they do not need yet. Reveal fields progressively.
- High-stakes flows such as an admission enquiry must state the next 2-4 steps, distinguish an enquiry from an official application, and keep official-source confirmation visible. Privacy and consent must appear before the person submits personal data.

### Mobile, accessibility, and motion

- Design from 375px upward. Interactive controls should be at least 44px tall with adequate separation.
- Maintain visible focus, semantic headings, accessible names for icon controls, and text contrast of at least 4.5:1 for normal text.
- Use motion only to explain a state change. Keep it under 300ms, interruptible, and disabled under `prefers-reduced-motion`.
- Never use colour as the only state indicator.

## Applied shared-system change

The header now has five primary categories: **Colleges, Programs, Admissions, Schools, and More**. The former Resources and Tools areas are retained in **More**, grouped into Updates, Plan your next step, Support & opportunities, and Language. This reduces initial choice load while preserving every destination.

## Release checklist

- [ ] A five-second glance identifies page purpose and primary action.
- [ ] One primary action is visually dominant; no competing primary buttons.
- [ ] Content begins with the answer or decision factor, not marketing filler.
- [ ] Desktop, 375px mobile, landscape phone, tablet, and keyboard navigation are checked.
- [ ] Loading, empty, error, and success states have clear next actions.
- [ ] There is no horizontal overflow, layout jump, unlabeled icon control, or hover-only functionality.
- [ ] No new dependency, animation, image, or data request is added without a clear student benefit.

## Measurement after launch

- Five-second comprehension test: task, primary action, and trust signal understood.
- Search-to-result and filter-to-profile completion.
- College comparison and admission-planner completion, not raw page-view duration.
- Mobile Core Web Vitals by template in Search Console.
- Form errors, empty-state exits, and dead-link reports.

Success is a faster, more confident decision—not maximized time on site.
