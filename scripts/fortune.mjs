// Rotates the README's fortune block: picks today's quote from quotes.json
// by UTC day number, so every day of the year lands on a curated line.
import { readFileSync, writeFileSync } from 'node:fs'

const quotes = JSON.parse(readFileSync('quotes.json', 'utf8'))
const day = Math.floor(Date.now() / 86_400_000)
const q = quotes[day % quotes.length]

const md = readFileSync('README.md', 'utf8')
const block = `<!--fortune-->\n> “${q.text}”\n> <sub>— ${q.by}</sub>\n<!--/fortune-->`
const next = md.replace(/<!--fortune-->[\s\S]*?<!--\/fortune-->/, block)

if (next === md) {
  console.log('fortune unchanged')
} else {
  writeFileSync('README.md', next)
  console.log(`fortune set: ${q.text} — ${q.by}`)
}
