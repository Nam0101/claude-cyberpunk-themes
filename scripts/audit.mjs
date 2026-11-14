// Audits every theme for accessibility and safety. Exits non-zero on any failure.
//   node --import ./scripts/ts-ext.mjs scripts/audit.mjs
//
// Accessibility
//   - Colour contrast (WCAG 2.2): text-primary at 7:1 or better on every surface (AAA), text-secondary and text-muted
//     at 4.5:1 or better on the page and panels (AA). The design system's own checks must not refuse the palette.
//   - Reduced motion: every scene must stop all animation under prefers-reduced-motion.
//   - Flashing (WCAG 2.3.1): no animation may cycle faster than three times a second.
// Safety
//   - Scenes are pure SVG: no script, no event handler, no link, no external or embedded resource, no entity.
//   - Each scene is deterministic and under the 131,072 character limit Claude Code sets.
//   - The plugin's code never reaches the network, files, processes, models or tools, and never evaluates code.

import { readFileSync, readdirSync } from 'node:fs'
import { makeColors } from '../hooks/make-colors.js'
import { PALETTES } from '../hooks/palettes.ts'
import { SCENES } from './scenes.mjs'

let failures = 0
const fail = message => {
  failures += 1
  console.log(`  FAIL ${message}`)
}
const pass = message => console.log(`  ok   ${message}`)

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

console.log('Colour contrast')
for (const [id, palette] of Object.entries(PALETTES)) {
  const anchors = palette[palette.only].gray.anchors
  const surfaces = ['surface-0', 'surface-1', 'surface-2', 'surface-3'].filter(k => anchors[k] !== undefined)
  const worst = (tone, on) => Math.min(...on.map(s => ratio(anchors[tone], anchors[s])))
  const primary = worst('text-primary', surfaces)
  const secondary = worst('text-secondary', ['surface-0', 'surface-2'])
  const muted = worst('text-muted', ['surface-0', 'surface-2'])
  const { problems } = makeColors(palette)
  const refused = problems.filter(p => p.startsWith("Desktop won't paint")).length
  const line = `${id.padEnd(10)} primary ${primary.toFixed(1)}:1  secondary ${secondary.toFixed(1)}:1  muted ${muted.toFixed(1)}:1  refused ${refused}`
  if (primary < 7 || secondary < 4.5 || muted < 4.5 || refused > 0) fail(line)
  else pass(line)
}

console.log('Scenes')
const unsafe = /<script|javascript:|href\s*=|xlink:|<image|<foreignObject|<iframe|<object|<embed|<use[\s>]|<a[\s>]|@import|url\(\s*[^#\s)]|data:|\son[a-z]+\s*=|<!ENTITY|<!DOCTYPE/gi
for (const scene of SCENES) {
  const svg = scene.build()
  const found = svg.match(unsafe)
  const durations = [...svg.matchAll(/animation(?:-duration)?:\s*(?:[a-z0-9-]+\s+)?([0-9.]+)s/g)].map(m => Number(m[1]))
  const fastest = Math.min(...durations)
  const problems = []
  if (found) problems.push(`unsafe ${[...new Set(found)].join(', ')}`)
  if (svg.length >= 131072) problems.push(`too large (${svg.length})`)
  if (svg !== scene.build()) problems.push('not deterministic')
  if (!svg.includes('@media (prefers-reduced-motion: reduce){*{animation:none!important}}')) problems.push('no reduced-motion rule')
  if (fastest < 1 / 3) problems.push(`animates faster than 3 per second (${fastest}s)`)
  const line = `${scene.id.padEnd(10)} ${String(svg.length).padStart(6)} chars  fastest cycle ${fastest}s  reduced motion, safe, deterministic`
  if (problems.length > 0) fail(`${scene.id}: ${problems.join('; ')}`)
  else pass(line)
}

console.log('Plugin code')
const risky = /fetch\(|XMLHttpRequest|WebSocket|EventSource|\$\.(fs|process|model|agent|tool|clock)\b|\beval\(|new Function|\bimport\(|\brequire\(|https?:\/\/(?!www\.w3\.org\/2000\/svg)|postMessage|setTimeout|setInterval|globalThis/
for (const file of readdirSync(new URL('../hooks/', import.meta.url))) {
  if (!/\.(ts|tsx|js)$/.test(file) || file.endsWith('.d.ts')) continue
  const source = readFileSync(new URL(`../hooks/${file}`, import.meta.url), 'utf8')
  const hit = source.split('\n').findIndex(line => risky.test(line))
  if (hit >= 0) fail(`${file}:${hit + 1} reaches outside the plugin: ${source.split('\n')[hit].trim().slice(0, 80)}`)
  else pass(`${file}`)
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
