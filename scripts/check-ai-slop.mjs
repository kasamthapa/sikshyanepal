import fs from 'node:fs'
import path from 'node:path'

const roots = ['app/(main)', 'components']
const extensions = new Set(['.ts', '.tsx'])
const ignoredSegments = new Set(['admin'])
const copyPatterns = [
  /\bhere'?s the thing\b/i,
  /\blet me be clear\b/i,
  /\bwhat nobody tells you\b/i,
  /\bthe part everyone misses\b/i,
  /\bthe best part\b/i,
  /\bgame[ -]?changer\b/i,
  /\bseamless(?:ly)?\b/i,
  /\bunlock(?:ing)?\b/i,
  /\bempower(?:s|ed|ing)?\b/i,
  /\brevolutionary\b/i,
  /\bcutting[ -]?edge\b/i,
  /\bworld[ -]?class\b/i,
  /\bsupercharge\b/i,
  /\belevate\b/i,
]
const visualPatterns = [
  /bg-gradient(?:-to)?/,
  /from-(?:blue|purple|violet|indigo)-\d+[^\n]*to-(?:blue|purple|violet|indigo)-\d+/,
]

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return ignoredSegments.has(entry.name) ? [] : filesIn(file)
    return extensions.has(path.extname(entry.name)) ? [file] : []
  })
}

const failures = []
for (const root of roots) {
  for (const file of filesIn(root)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    lines.forEach((line, index) => {
      for (const pattern of [...copyPatterns, ...visualPatterns]) {
        if (pattern.test(line)) failures.push(`${file}:${index + 1} matches ${pattern}`)
      }
    })
  }
}

if (failures.length) {
  console.error('AI-slop guard found public UI patterns that need an editorial or visual review:')
  failures.forEach(item => console.error(`- ${item}`))
  process.exitCode = 1
} else {
  console.log('AI-slop guard passed.')
}
