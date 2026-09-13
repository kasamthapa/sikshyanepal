type EditorialFinding = {
  pattern: string
  match: string
}

const checks: { pattern: string; expression: RegExp }[] = [
  {
    pattern: 'generic promotional wording',
    expression: /\b(?:cutting[- ]edge|game[- ]changer|paradigm shift|transformative|world[- ]class|one[- ]stop|all[- ]in[- ]one|supercharge|revolutionary)\b/i,
  },
  {
    pattern: 'importance puffery',
    expression: /\b(?:marks? a pivotal moment|stands? as a testament|plays? a vital role|solidif(?:y|ies) its position|underscores? (?:its|the) significance)\b/i,
  },
  {
    pattern: 'unnamed attribution',
    expression: /\b(?:experts agree|studies show|research shows|many (?:experts|people) (?:say|believe|argue)|widely regarded as)\b/i,
  },
  {
    pattern: 'scripted opening',
    expression: /(?:^|[.!?]\s+)(?:here(?:'|’)s the thing|let me be clear|what nobody tells you|the part everyone misses|in today(?:'|’)s world|let(?:'|’)s dive in)\b/i,
  },
  {
    pattern: 'binary contrast framing',
    expression: /\b(?:it(?:'|’)s not [^.]{1,80}[.!?]\s*it(?:'|’)s|not [^.]{1,60},\s*(?:but|it(?:'|’)s))\b/i,
  },
  {
    pattern: 'faux-insight setup',
    expression: /\b(?:what nobody tells you|the part (?:that )?everyone misses|the secret(?: is)?|the truth(?: is)?)\b/i,
  },
  {
    pattern: 'colon reveal',
    expression: /\b(?:the best part|the real lesson|the answer|the key)\s*:/i,
  },
  {
    pattern: 'dramatic fragment',
    expression: /\b(?:that(?:'|’)s it|that(?:'|’)s the whole thing|period\.)\b/i,
  },
  {
    pattern: 'fake-profound ending',
    expression: /\b(?:the future (?:isn(?:'|’)t|is not) coming|it(?:'|’)s already here|this is only the beginning)\b/i,
  },
  {
    pattern: 'fake analysis',
    expression: /,\s*(?:highlighting|underscoring|showcasing|reflecting)\b/i,
  },
]

export function findEditorialSlop(value: string): EditorialFinding[] {
  return checks.flatMap(check => {
    const match = value.match(check.expression)
    return match ? [{ pattern: check.pattern, match: match[0].trim() }] : []
  })
}

export function editorialQualityError(title: string, content: string): string | null {
  const findings = findEditorialSlop(`${title}\n${content}`)
  if (!findings.length) return null
  return `Rewrite before publishing: ${findings.map(item => `${item.pattern} ("${item.match}")`).join('; ')}. Use the source's names, dates, numbers and outcome instead.`
}
