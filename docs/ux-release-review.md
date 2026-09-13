# UX Release Review

Use this checklist for every student-facing interface or flow change. It operationalises the Cognitive UX Standard and the principles adapted from Flavián, Gurrea, and Orús.

## Scope

- Changed page, component, or flow:
- Primary student task:
- Primary action:
- Device/context considered:

## Decision and trust

- [ ] The first screen states what the page is, who it is for, and what a student can do now.
- [ ] There is one visually dominant action per decision area.
- [ ] Labels describe their destination or outcome; generic labels such as “click here” and ambiguous “learn more” are avoided.
- [ ] Source, last-checked date, fee period, eligibility, deadline, and sponsorship status appear wherever they are material to a decision.
- [ ] No invented activity, fake review, fabricated deadline, unsupported claim, or misleading visual is introduced.

## Control and navigation

- [ ] Students can tell where they are and can leave, go back, search, or correct a choice without losing work.
- [ ] Navigation remains consistent; secondary destinations are grouped by student intent.
- [ ] New multi-step flows have no more than five clear steps and expose progress or next action.
- [ ] A loading, empty, error, or unavailable state explains what happened and gives a useful recovery action.

## Content, privacy, and accessibility

- [ ] Information is current, comprehensible, relevant, and grouped under descriptive headings.
- [ ] Forms request only necessary data, use visible labels, support paste/autofill, and show errors next to the relevant field.
- [ ] Consent and privacy explanation appear before personal data is submitted; official-source confirmation is retained for admissions and fees.
- [ ] Keyboard order, visible focus, screen-reader names, text contrast, and 44px mobile interaction targets are checked.
- [ ] Motion is under 300ms, explains a state change, and respects `prefers-reduced-motion`.

## Performance and validation

- [ ] Images have useful alt text and reserved dimensions; nonessential media is not above the main task.
- [ ] No horizontal overflow occurs at 375px; desktop text measures remain readable.
- [ ] Run: `npm run lint`, `npm run build`, and `git diff --check`.
- [ ] Record anything not verifiable locally (real-device behavior, live data, external sign-in, or field Web Vitals).

## Review result

- Outcome: pass / follow-up required
- Follow-up owner and reason:
