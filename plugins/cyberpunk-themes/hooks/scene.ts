// Neon Rooftop. The first theme I made, and still the one I come back to.
// Two little mascots sit on a rooftop with their legs over the edge, watching a huge pixel moon.
// One has the yellow jacket and spiky hair, the other the silver bob with pink and cyan tips
// (if you've watched Edgerunners, you'll know who they're meant to be).
// The city is two skylines made of tiles. I kept the buildings low in the middle so they don't fight
// with the chat, and the windows fade in and out slowly instead of blinking at you.
// Everything here is plain string building, so the same call always gives the same picture.

const WIDTH = 1600
const HEIGHT = 1000
const HORIZON = 770

const CYAN = '#74d4e6'
const MAGENTA = '#e489cf'
const AMBER = '#f0bd72'
const MOON = '#ece6ff'

type Cell = { x: number; y: number; kind: string }
type Building = { x: number; w: number; h: number }

/** A repeatable number in 0..1 from two integers. */
import { EXTRA_STYLE, blimp, flyingCar, glyphSign, holoEye, megatower } from './extras'
import { pixelFrames } from './kit'

export function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** A smooth bump: 1 at the centre, 0 at halfWidth away. */
function lobe(x: number, centre: number, halfWidth: number): number {
  const d = Math.abs(x - centre) / halfWidth
  if (d >= 1) return 0
  const inner = 1 - d * d
  return inner * inner
}

export function square(x: number, y: number, size: number): string {
  return `M${x} ${y}h${size}v${size}h-${size}z`
}

/** A row of buildings: tall towards the edges, low in the middle so the chat area stays calm. */
function skyline(seed: number, cell: number, tallest: number, floor: number): Building[] {
  const out: Building[] = []
  let x = -cell * 2
  let i = 0
  while (x < WIDTH + cell) {
    const cols = 4 + Math.floor(hash(seed, i) * 6)
    const w = cols * cell
    const mid = x + w / 2
    const envelope = Math.max(lobe(mid, 230, 480), lobe(mid, 1360, 520))
    const rough = 0.55 + 0.45 * hash(seed + 3, i)
    const h = Math.max(floor, Math.round((floor + envelope * tallest * rough) / cell) * cell)
    out.push({ x, w, h })
    x += w + (hash(seed + 9, i) < 0.25 ? cell : 0)
    i += 1
  }
  return out
}

/** Buildings as one path of plain rectangles. */
function bodies(list: Building[]): string {
  return list.map(b => `M${b.x} ${HORIZON - b.h}h${b.w}v${b.h}h-${b.w}z`).join('')
}

/** The thin moonlit rim along each roof. */
function rims(list: Building[]): string {
  return list.map(b => `M${b.x} ${HORIZON - b.h}h${b.w}v2h-${b.w}z`).join('')
}

/** A sparse ASCII texture over the facades: one text element, a glyph one shade off the wall. */
function texture(list: Building[], cell: number, seed: number, colour: string, size: number): string {
  const xs: number[] = []
  const ys: number[] = []
  let text = ''
  const glyphs = ':.|=:.'
  list.forEach((b, n) => {
    const cols = b.w / cell
    const rows = b.h / cell
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (hash(seed + n * 31 + c, r * 7 + 1) > 0.16) continue
        xs.push(b.x + c * cell + cell / 2)
        ys.push(HORIZON - b.h + r * cell + Math.round(cell * 0.8))
        text += glyphs[(c * 3 + r * 5 + n) % glyphs.length]
      }
    }
  })
  if (text === '') return ''
  return `<text x="${xs.join(' ')}" y="${ys.join(' ')}" fill="${colour}" style="font-size:${size}px">${text}</text>`
}

/** Lit windows: every other cell, a few of them on, split over four slow clocks per colour so the city breathes and never blinks. */
function windows(list: Building[], cell: number, seed: number, chance: number, palette: string[], strength: number): string {
  const groups = new Map<string, string>()
  list.forEach((b, n) => {
    const cols = b.w / cell
    const rows = b.h / cell
    for (let r = 2; r < rows - 1; r += 2) {
      for (let c = 1; c < cols - 1; c += 2) {
        if (hash(seed + n * 13 + c, r * 17) > chance) continue
        const colour = palette[Math.floor(hash(seed + 5 + c, n * 7 + r) * palette.length)] ?? CYAN
        const clock = Math.floor(hash(seed + 11 + n, c * 3 + r) * 4)
        const key = `${colour}|${clock}`
        groups.set(key, (groups.get(key) ?? '') + square(b.x + c * cell + 2, HORIZON - b.h + r * cell + 2, cell - 4))
      }
    }
  })
  let out = ''
  for (const [key, d] of groups) {
    const [colour, clock] = key.split('|')
    const delay = Number(clock) * 4.5
    out += `<path class="win" style="animation-delay:-${delay}s" d="${d}" fill="${colour}" fill-opacity="${strength}"/>`
  }
  return out
}

/** The big pixel moon: a disc of 8 px cells, dithered at the rim, with a few soft craters. */
function moon(cx: number, cy: number, radius: number): string {
  const cell = 8
  let face = ''
  let crater = ''
  let rim = ''
  for (let y = -radius; y <= radius; y += cell) {
    for (let x = -radius; x <= radius; x += cell) {
      const d = Math.hypot(x + cell / 2, y + cell / 2)
      if (d > radius) continue
      const px = cx + x
      const py = cy + y
      const s = square(px, py, cell - 1)
      if (d > radius - cell * 1.2) {
        if (hash(x + 500, y + 500) < 0.7) rim += s
      } else if (hash(Math.floor((x + 400) / 16), Math.floor((y + 400) / 16)) < 0.22) crater += s
      else face += s
    }
  }
  return `<circle class="glow" cx="${cx}" cy="${cy}" r="${radius * 4}" fill="url(#moonglow)"/>` +
    `<path d="${face}" fill="${MOON}" fill-opacity="0.9"/><path d="${crater}" fill="#d3caf4" fill-opacity="0.85"/><path d="${rim}" fill="#c9bfef" fill-opacity="0.6"/>`
}

/** A few stars in the upper sky, away from the moon, twinkling on three clocks. */
function stars(): string {
  const parts = ['', '', '']
  for (let i = 0; i < 54; i += 1) {
    const x = Math.round(hash(71, i) * WIDTH)
    const y = Math.round(Math.pow(hash(72, i), 1.4) * 470)
    if (Math.hypot(x - 1197, y - 250) < 150) continue
    const size = hash(73, i) < 0.2 ? 3 : 2
    parts[i % 3] = (parts[i % 3] ?? '') + square(x, y, size)
  }
  return parts.map((d, i) => `<path class="star" style="animation-duration:${7 + i * 3}s;animation-delay:-${i * 2}s" d="${d}" fill="#d9d4ff"/>`).join('')
}

/** Drizzle: short slanted strokes in a 1000 px tall band drawn twice, so sliding it down one band loops without a seam. */
function rain(seed: number, count: number, length: number, opacity: number, seconds: number): string {
  let d = ''
  for (let copy = 0; copy < 2; copy += 1) {
    for (let i = 0; i < count; i += 1) {
      const x = Math.round(hash(seed, i) * (WIDTH + 200))
      const y = Math.round(hash(seed + 1, i) * HEIGHT) - copy * HEIGHT
      d += `M${x} ${y}l-${Math.round(length / 5)} ${length}`
    }
  }
  return `<path class="rain" style="animation-duration:${seconds}s" d="${d}" stroke="#9fd8ff" stroke-opacity="${opacity}" stroke-width="1.2" fill="none"/>`
}

/** A faint perspective grid on the ground, fading toward the prompt box in the middle. */
function ground(): string {
  const vx = 800
  let d = ''
  for (let k = 1; k <= 9; k += 1) {
    const y = Math.round(HORIZON + Math.pow(k / 9, 2.1) * (HEIGHT - HORIZON + 40))
    d += `M0 ${y}H${WIDTH}`
  }
  for (let k = -14; k <= 14; k += 1) {
    d += `M${vx} ${HORIZON}L${vx + k * 150} ${HEIGHT + 40}`
  }
  return `<rect y="${HORIZON}" width="${WIDTH}" height="${HEIGHT - HORIZON}" fill="url(#ground)"/>` +
    `<path d="${d}" stroke="#b47ad8" stroke-opacity="0.16" stroke-width="1" fill="none" mask="url(#sides)"/>` +
    `<rect y="${HORIZON - 1}" width="${WIDTH}" height="2" fill="${MAGENTA}" fill-opacity="0.22" mask="url(#sides)"/>`
}

/** An elevated line between the two skylines and a short train that slides along it now and then. */
function train(): string {
  const y = 700
  let pillars = ''
  for (let x = 40; x < WIDTH; x += 160) pillars += `M${x} ${y + 6}h4v${HORIZON - y - 6}h-4z`
  const cars = [0, 1, 2]
    .map(n => {
      const x = n * 78
      let lights = ''
      for (let k = 0; k < 6; k += 1) lights += square(x + 7 + k * 11, y - 13, 6)
      return `<path d="M${x} ${y - 18}h72v16h-72z" fill="#2b2452"/><path d="${lights}" fill="${CYAN}" fill-opacity="0.75"/>`
    })
    .join('')
  return `<path d="${pillars}" fill="#171230"/><path d="M0 ${y}h${WIDTH}v6h-${WIDTH}z" fill="#211a40"/>` +
    `<g class="train"><path d="M-6 ${y - 4}h244v2h-244z" fill="${CYAN}" fill-opacity="0.35"/>${cars}</g>`
}

/** A vertical neon sign: lettered tiles that hum, with a soft halo behind them. */
function sign(x: number, y: number, word: string, colour: string, flicker: string): string {
  const cell = 18
  let tiles = ''
  for (let i = 0; i < word.length; i += 1) tiles += square(x, y + i * cell, cell - 2)
  const xs = Array.from(word, () => x + (cell - 2) / 2).join(' ')
  const ys = Array.from(word, (_, i) => y + i * cell + 13).join(' ')
  const h = word.length * cell
  return `<ellipse class="glow" cx="${x + 8}" cy="${y + h / 2}" rx="70" ry="${h}" fill="url(#signglow-${flicker})"/>` +
    `<g class="${flicker}"><path d="${tiles}" fill="${colour}" fill-opacity="0.82"/>` +
    `<text x="${xs}" y="${ys}" fill="#1a1230" style="font-size:12px">${word}</text></g>`
}

// The mascots. Each map letter is a tile; '.' is empty. Drawn upright, 12 cells wide, 9 rows of body and 2 of legs.
const CELL = 9

const TILE: Record<string, string> = {
  B: '#d97757', // body: the warm terracotta of the mascot
  E: '#1a1426', // eyes
  D: '#24343a', // spiky dark hair
  Y: '#efc94c', // yellow jacket
  c: '#5fd3e6', // jacket trim
  L: '#55488a', // legs
  W: '#ece8f6', // silver hair
  w: '#c9c3e0', // hair shade
  P: '#ef8fd0', // pink tip
  C: '#7fdcef', // cyan tip
  K: '#4b3f7e', // dark violet suit
  k: '#6a5aa8', // suit highlight
}

export const JACKET = `
..D.DD.D.D..
..DDDDDDDD..
..BBBBBBBB..
..BEBBBBEB..
..BEBBBBEB..
YYYBBBBBBYYY
..YYBBBBYY..
..YcBBBBcY..
..YYYYYYYY..
`

export const BOB = `
..WWWWWWWW..
.WWWWWWWWWW.
.wWWBBBBWWw.
.WBEBBBBEBW.
.wBEBBBBEBw.
.PBBBBBBBBC.
KKkBBBBBBkKK
..KkBBBBkK..
..KKKCPKKK..
`

const LEGS = [
  `
...L.LL.L...
...L.LL.L...
`,
  `
...L.LL.L...
..L..LL..L..
`,
]

export function cellsOf(map: string): Cell[] {
  const cells: Cell[] = []
  map.split('\n').filter(line => line.length > 0).forEach((line, y) => {
    for (let x = 0; x < line.length; x += 1) {
      const kind = line[x] ?? '.'
      if (kind !== '.') cells.push({ x, y, kind })
    }
  })
  return cells
}

/** Tiles of each kind in one path each, a hair of gap between tiles so the mosaic reads. */
function mosaic(cells: Cell[], left: number, top: number): string {
  const byKind = new Map<string, string>()
  for (const c of cells) byKind.set(c.kind, (byKind.get(c.kind) ?? '') + square(left + c.x * CELL, top + c.y * CELL, CELL - 1))
  let out = ''
  for (const [kind, d] of byKind) out += `<path d="${d}" fill="${TILE[kind] ?? '#888'}"/>`
  return out
}

/** One mascot on the roof edge: body that breathes, eyes that blink, legs that swing; its glowing bits on their own clock. */
export function mascot(map: string, left: number, roof: number, delay: number, glowKinds: string): string {
  const top = roof - 9 * CELL
  const cells = cellsOf(map)
  const base = cells.map(c => (c.kind === 'E' ? { ...c, kind: 'B' } : c)).filter(c => !glowKinds.includes(c.kind))
  const eyes = cells.filter(c => c.kind === 'E')
  const lit = cells.filter(c => glowKinds.includes(c.kind))
  const legs = LEGS.map((legMap, i) => `<g class="leg${i}" style="animation-delay:-${delay}s">${mosaic(cellsOf(legMap), left, roof)}</g>`).join('')
  const halo = lit.length === 0 ? '' : `<g class="tip" style="animation-delay:-${delay}s">${mosaic(lit, left, top)}</g>`
  return `${legs}<g class="breathe" style="animation-delay:-${delay}s">${mosaic(base, left, top)}${halo}<g class="blink" style="animation-delay:-${delay * 3}s">${mosaic(eyes, left, top)}</g></g>`
}

/** Every so often a tiny pixel heart floats up between them. My favourite detail. */
function heart(x: number, y: number): string {
  const map = `
.PP.PP.
PPPPPPP
PPPPPPP
.PPPPP.
..PPP..
...P...
`
  let d = ''
  for (const c of cellsOf(map)) d += square(x + c.x * 4, y + c.y * 4, 4)
  return `<path class="heart" d="${d}" fill="${MAGENTA}"/>`
}

/** Grain: barely visible light and dark pixels, so the dark gradient cannot band. */
export function grain(): string {
  let light = ''
  let dark = ''
  for (let i = 0; i < 150; i += 1) {
    const s = square(Math.floor(hash(11, i) * 48) * 2, Math.floor(hash(12, i) * 48) * 2, 2)
    if (i % 2 === 0) light += s
    else dark += s
  }
  return `<pattern id="grain" width="96" height="96" patternUnits="userSpaceOnUse"><path d="${light}" fill="#c8b4ff" fill-opacity="0.025"/><path d="${dark}" fill="#000" fill-opacity="0.1"/></pattern>`
}

export function neonRooftopSvg(): string {
  const ROOF = 610
  const ROOST: Building = { x: 1050, w: 300, h: HORIZON - ROOF }
  const far = skyline(40, 8, 420, 40)
  // The near row leaves room for the roost, and its neighbours stay a little lower than the roof so the moon is in plain view.
  const near = skyline(10, 12, 300, 24)
    .filter(b => b.x + b.w <= ROOST.x - 12 || b.x >= ROOST.x + ROOST.w + 12)
    .map(b => (b.x > 860 && b.x < ROOST.x ? { ...b, h: Math.min(b.h, 120) } : b))
    .concat([ROOST])
  const tallLeft = near.filter(b => b.x > 60 && b.x < 400).sort((a, b) => b.h - a.h)[0] ?? { x: 200, w: 60, h: 300 }
  const rightOfRoost = near.filter(b => b.x >= ROOST.x + ROOST.w).sort((a, b) => a.x - b.x)[0] ?? { x: 1450, w: 60, h: 200 }

  const style = `
text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:700;text-anchor:middle}
.win{opacity:.75;animation:win 18s ease-in-out infinite}
.star{opacity:.6;animation:star 9s ease-in-out infinite}
.glow{animation:glow 11s ease-in-out infinite}
.rain{animation:rain 9s linear infinite}
.train{transform:translateX(-400px);animation:train 64s linear infinite;animation-delay:-20s}
.hum{animation:hum 13s steps(1) infinite}.hum2{animation:hum 17s steps(1) infinite;animation-delay:-6s}
.breathe{animation:breathe 6s ease-in-out infinite}
.blink{animation:blink 7s steps(1) infinite}
.tip{animation:tip 5s ease-in-out infinite}
.leg0{animation:leg0 4s steps(1) infinite}.leg1{opacity:0;animation:leg1 4s steps(1) infinite}
.heart{opacity:0;animation:heart 30s ease-out infinite;animation-delay:-12s}
.beacon{animation:beacon 3.2s ease-in-out infinite}
@keyframes win{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes star{0%,100%{opacity:.25}50%{opacity:.85}}
@keyframes glow{0%,100%{opacity:.75}50%{opacity:1}}
@keyframes rain{from{transform:translateY(0)}to{transform:translateY(${HEIGHT}px)}}
@keyframes train{0%{transform:translateX(-400px)}45%,100%{transform:translateX(${WIDTH + 200}px)}}
@keyframes hum{0%{opacity:1}91%{opacity:.35}92%{opacity:1}94%{opacity:.5}95%,100%{opacity:1}}
@keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes blink{0%,93%{opacity:1}94%,96%{opacity:0}97%,100%{opacity:1}}
@keyframes tip{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes leg0{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes leg1{0%,49%{opacity:0}50%,100%{opacity:1}}
@keyframes heart{0%{opacity:0;transform:translateY(8px)}3%{opacity:.9}12%{opacity:0;transform:translateY(-40px)}100%{opacity:0;transform:translateY(-40px)}}
@keyframes beacon{0%,100%{opacity:.25}50%{opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  const defs = `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08071a"/><stop offset="0.45" stop-color="#110d29"/><stop offset="0.72" stop-color="#1d1338"/><stop offset="0.77" stop-color="#2a1640"/><stop offset="1" stop-color="#2a1640"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120c24"/><stop offset="1" stop-color="#06050e"/></linearGradient>
<radialGradient id="moonglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#b8a8ff" stop-opacity="0.22"/><stop offset="0.3" stop-color="#b8a8ff" stop-opacity="0.09"/><stop offset="0.6" stop-color="#b8a8ff" stop-opacity="0.03"/><stop offset="1" stop-color="#b8a8ff" stop-opacity="0"/></radialGradient>
<radialGradient id="haze" cx="0.5" cy="1" r="0.7"><stop offset="0" stop-color="#e489cf" stop-opacity="0.13"/><stop offset="0.5" stop-color="#7a5bd6" stop-opacity="0.05"/><stop offset="1" stop-color="#7a5bd6" stop-opacity="0"/></radialGradient>
<radialGradient id="signglow-hum" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${MAGENTA}" stop-opacity="0.3"/><stop offset="1" stop-color="${MAGENTA}" stop-opacity="0"/></radialGradient>
<radialGradient id="signglow-hum2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${CYAN}" stop-opacity="0.28"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>
<linearGradient id="sideward" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.15"/><stop offset="0.7" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="sides" maskUnits="userSpaceOnUse" x="0" y="0" width="${WIDTH}" height="${HEIGHT}"><rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sideward)"/></mask>
${grain()}`

  return pixelFrames(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}${EXTRA_STYLE}</style><defs>${defs}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
<ellipse cx="800" cy="${HORIZON}" rx="1100" ry="420" fill="url(#haze)"/>
${stars()}
${megatower(640, HORIZON, 150, '#140f2a', MAGENTA, '#c48cff', 'searchR')}
${moon(1197, 250, 72)}
${blimp(150, '#1c1736', CYAN, 'blimpclip')}
<g opacity="0.9"><path d="${bodies(far)}" fill="#1b1535"/><path d="${rims(far)}" fill="#2c2452"/>${texture(far, 8, 40, '#251e46', 7)}${windows(far, 8, 40, 0.1, ['#8d7fd0', '#6fa9c8'], 0.45)}</g>
${rain(201, 60, 10, 0.1, 13)}
${flyingCar(455, true, 30, 4, CYAN, MAGENTA)}
${flyingCar(405, false, 38, 15, AMBER, MAGENTA)}
${train()}
<path d="${bodies(near)}" fill="#0f0c20"/><path d="${rims(near)}" fill="#3a2f66" fill-opacity="0.8"/>${texture(near, 12, 10, '#1a1533', 10)}${windows(near, 12, 10, 0.2, [CYAN, MAGENTA, AMBER, CYAN], 0.6)}
${sign(tallLeft.x + 14, HORIZON - tallLeft.h + 36, 'NEON', MAGENTA, 'hum')}
${sign(rightOfRoost.x + 14, HORIZON - rightOfRoost.h + 30, '24H', CYAN, 'hum2')}
${glyphSign(318, 600, 6, AMBER, 3)}
${holoEye(70, 250, CYAN, MAGENTA)}
<path d="M${ROOST.x + 8} ${ROOF - 64}h2v64h-2z" fill="#3a2f66"/><path class="beacon" d="${square(ROOST.x + 6, ROOF - 70, 6)}" fill="#ff7a9a"/>
${mascot(JACKET, 1084, ROOF, 0, 'c')}
${mascot(BOB, 1202, ROOF, 2.3, 'PC')}
${heart(1183, ROOF - 9 * CELL - 36)}
${ground()}
${rain(301, 70, 16, 0.16, 8)}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>
</svg>`)
}
