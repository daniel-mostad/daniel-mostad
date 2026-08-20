// Rotates the daily fortune: picks today's quote from quotes.json and renders
// it as assets/fortune.svg (terminal-panel style, matching the other panels),
// then refreshes the <img> alt text between the README's fortune markers.
import { readFileSync, writeFileSync } from 'node:fs'

const quotes = JSON.parse(readFileSync('quotes.json', 'utf8'))
const day = Math.floor(Date.now() / 86_400_000)
// stride by a prime so consecutive days don't walk the list in order;
// still visits every quote exactly once per quotes.length days
const q = quotes[(day * 7919) % quotes.length]

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// wrap the quote at ~76 chars for the 880px panel
const lines = []
let cur = ''
for (const w of q.text.split(' ')) {
  if ((cur + ' ' + w).trim().length > 76) {
    lines.push(cur.trim())
    cur = w
  } else cur += ' ' + w
}
if (cur.trim()) lines.push(cur.trim())

const LH = 27
const startY = 76
const authorY = startY + lines.length * LH
const H = authorY + 24

const quoteText = lines
  .map(
    (l, i) =>
      `  <g class="reveal" style="animation-delay:${(0.25 + i * 0.15).toFixed(2)}s"><text x="38" y="${startY + i * LH}" font-size="15" font-style="italic" fill="#e6edf2">${i === 0 ? '<tspan fill="#39d353">“</tspan>' : ''}${esc(l)}${i === lines.length - 1 ? '<tspan fill="#39d353">”</tspan>' : ''}</text></g>`
  )
  .join('\n')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 ${H}" width="880" height="${H}" role="img" aria-label="fortune: ${esc(q.text).replace(/"/g, '&quot;')} — ${esc(q.by)}">
  <style>
    text { font-family: ui-monospace, 'Cascadia Mono', Consolas, Menlo, monospace; }
    .reveal { opacity: 0; animation: fade .7s ease forwards; }
    @keyframes fade { to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .reveal { animation: none; opacity: 1; } }
  </style>
  <rect x="1" y="1" width="878" height="${H - 2}" rx="12" fill="#0d1117" stroke="#30363d"/>
  <text x="38" y="42" font-size="15"><tspan fill="#39d353">~/github</tspan><tspan fill="#484f58">&#160;$&#160;</tspan><tspan fill="#e6edf2">fortune</tspan></text>
${quoteText}
  <g class="reveal" style="animation-delay:${(0.25 + lines.length * 0.15).toFixed(2)}s"><text x="56" y="${authorY}" font-size="14" fill="#8b949e">— ${esc(q.by)}</text></g>
</svg>
`
writeFileSync('assets/fortune.svg', svg)

const md = readFileSync('README.md', 'utf8')
const altText = `fortune: ${q.text.replace(/"/g, "'")} — ${q.by}`
const block = `<!--fortune-->\n<img src="assets/fortune.svg" alt="${esc(altText)}" width="100%">\n<!--/fortune-->`
const next = md.replace(/<!--fortune-->[\s\S]*?<!--\/fortune-->/, block)

if (next === md) {
  console.log(`fortune svg refreshed: ${q.text} — ${q.by}`)
} else {
  writeFileSync('README.md', next)
  console.log(`fortune set: ${q.text} — ${q.by}`)
}
