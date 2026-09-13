# Student return-visit UX: research notes

## Product question

How should SikshyaNepal help a Nepali student return to a useful task without turning education decisions into an engagement feed?

## What the evidence supports

- Students visit education sites with practical questions: compare institutions, understand a programme, find a deadline, and determine the next application step. Information must be task-led and easy to scan rather than buried in broad navigation. [NN/g: University Websites](https://www.nngroup.com/reports/university/)
- A student dashboard is useful when it gives a learner an actionable view of their progress and supports self-regulation. It should not be a dense set of unrelated metrics. [Open University research](https://oro.open.ac.uk/102277/)
- Students value control over the information in a learning dashboard; a small, editable plan is preferable to a system that assumes one route fits everyone. [ERIC dashboard study](https://eric.ed.gov/?id=EJ1154001)
- Search remains essential for people who arrive with a specific task. Direct navigation and search should complement each other. [NN/g: Global Search](https://www.nngroup.com/articles/search-and-you-may-find/)
- Nepal has broad mobile connectivity but unequal access and data costs. Primary flows should remain light, readable, and useful on a phone. [UNICEF: Right to Internet Access in Nepal](https://www.unicef.org/nepal/media/24131/file/Final)
- Nepalese young people report demand for practical skills, careers guidance, and pathways into work, alongside barriers in access and career information. [UNICEF: Learning to Earning](https://www.unicef.org/nepal/reports/learning-earning)

## Design decisions applied

1. **My Path starts with one action.** The first incomplete task is shown before the full checklist, so a returning student can continue instead of deciding among many cards.
2. **The plan stays deliberately small.** Three stage-specific actions make progress visible without implying unsupported recommendations or inventing deadlines.
3. **Progress is meaningful but not gamified.** Completion communicates practical planning progress; it has no points, streaks, or pressure prompts.
4. **Students retain control.** They can edit their stage and mark a task complete only when they decide it is complete.
5. **Authentication is server-led.** The page asks the authenticated API whether a user has a session; it does not rely on a browser-storage naming convention that can misidentify a signed-in student.

## Measures to review after launch

- My Path sign-in to first stage selection.
- First-action link click rate.
- Completion of at least one checklist item within seven days.
- Return rate after saving a college, school, admission, or scholarship.
- Errors and empty states caused by unavailable data sources.

Do not optimise these measurements for time-on-site alone. A student should be able to find an answer quickly and leave with a clearer decision.
