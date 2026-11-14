// Blackwall: the edge of the Net, where something should not get through. A dark-window scene in black with one red.
// A vast wall of fine vertical code stands behind everything, almost black on black. Red cracks run through it, and in
// the cracks, now and then, pairs of red eyes open and look out. A shattered red mask of a rogue AI glitches at the left
// beside a warning sign. Far behind, in the haze, a huge armoured silhouette stands with a red visor slit.
// A red security scan sweeps down the screen. On the right a hooded runner with a red visor faces the wall,
// and a small drone with one red eye hovers beside them.

import { glyphSign } from './extras'
import { HEIGHT, PAIR_LEFT, PAIR_RIGHT, WIDTH, figure, grain, hash, rect, specks, svgRoot } from './kit'

const FLOOR = 780
const RED = '#ff4f6d'

/** The wall's tile: dense vertical code strokes of varied lengths, almost black. Repeated as a pattern to stay small. */
function wallTile(): string {
  let d = ''
  for (let x = 0; x < 210; x += 6) {
    let y = 0
    let k = 0
    while (y < 260) {
      const len = Math.min(260 - y, 6 + Math.floor(hash(x, k + 7) * 40))
      if (hash(x * 3, k) > 0.2) d += rect(x, y, 2, len)
      y += len + 4 + Math.floor(hash(k, x) * 10)
      k += 1
    }
  }
  return `<pattern id="code" width="210" height="260" patternUnits="userSpaceOnUse"><path d="${d}" fill="#17171b"/></pattern>`
}

/** The wall: the code tile across the whole screen above the floor, shimmering slowly. */
function wall(): string {
  return `<rect class="shimmer" width="${WIDTH}" height="${FLOOR}" fill="url(#code)"/>`
}

/** A crack: a zigzag of short segments, glowing red, with a pair of eyes that open inside it now and then. */
function crack(x: number, y: number, length: number, seed: number, eyesDelay: number): string {
  let d = `M${x} ${y}`
  let cx = x
  let cy = y
  for (let i = 0; i < length; i += 1) {
    cx += Math.round((hash(seed, i) - 0.5) * 26)
    cy += 14 + Math.round(hash(seed + 1, i) * 10)
    d += `L${cx} ${cy}`
  }
  const ey = y + Math.round((cy - y) * 0.45)
  const ex = Math.round(x + (cx - x) * 0.45)
  return `<path d="${d}" stroke="${RED}" stroke-opacity="0.12" stroke-width="10" fill="none"/><path class="crackglow" d="${d}" stroke="${RED}" stroke-width="2" fill="none"/>` +
    `<g class="eyes" style="animation-delay:-${eyesDelay}s"><path d="${rect(ex - 14, ey, 9, 4)}${rect(ex + 5, ey, 9, 4)}" fill="${RED}"/><circle cx="${ex}" cy="${ey + 2}" r="26" fill="url(#redglow)"/></g>`
}

/** The rogue AI's mask: a shattered geometric face in red outline, glitching in horizontal slices. */
function mask(cx: number, cy: number): string {
  const map = `
....RRRRRRRR....
..RR........RR..
.R............R.
R..RRR....RRR..R
R..R.R....R.R..R
R..RRR....RRR..R
R......RR......R
R.....R..R.....R
.R....RRRR....R.
..R..........R..
...RR..RR..RR...
.....RR..RR.....
`
  let d = ''
  map.split('\n').filter(l => l.length > 0).forEach((line, r) => {
    for (let c = 0; c < line.length; c += 1) if (line[c] === 'R') d += rect(cx - 8 * 16 / 2 + c * 8, cy - 48 + r * 8, 8 - 1, 8 - 1)
  })
  return `<circle class="glow" cx="${cx}" cy="${cy}" r="150" fill="url(#redglow)"/><g class="glitchy"><path d="${d}" fill="${RED}" fill-opacity="0.85"/></g>` +
    `<g class="slice" clip-path="url(#maskslice)"><path transform="translate(10 0)" d="${d}" fill="#ffffff" fill-opacity="0.7"/></g>`
}

/** The giant in the haze: a dark armoured silhouette, shoulders and helm, with a red visor slit that breathes. */
function giant(cx: number, base: number): string {
  const d = `M${cx - 210} ${base}L${cx - 190} ${base - 260}L${cx - 120} ${base - 320}L${cx - 60} ${base - 330}L${cx - 50} ${base - 430}L${cx - 30} ${base - 470}L${cx + 30} ${base - 470}L${cx + 50} ${base - 430}L${cx + 60} ${base - 330}L${cx + 120} ${base - 320}L${cx + 190} ${base - 260}L${cx + 210} ${base}Z`
  return `<path d="${d}" fill="#0c0c0f"/><path d="${d}" fill="none" stroke="#202026" stroke-width="2"/>` +
    `<g class="visor"><path d="${rect(cx - 30, base - 440, 60, 6)}" fill="${RED}"/><ellipse cx="${cx}" cy="${base - 437}" rx="90" ry="26" fill="url(#redglow)"/></g>`
}

/** The red security scan: a thin bright line with a soft trail, sweeping down the whole screen. */
function scan(): string {
  return `<g class="scan"><rect y="-60" width="${WIDTH}" height="60" fill="url(#scantrail)"/><rect y="0" width="${WIDTH}" height="2" fill="${RED}" fill-opacity="0.55"/></g>`
}

/** The floor: black with a faint red reflection line and a grid that fades into the dark. */
function floor(): string {
  let d = ''
  for (let k = 1; k <= 8; k += 1) d += `M0 ${FLOOR + Math.round(Math.pow(k / 8, 2) * (HEIGHT - FLOOR + 30))}H${WIDTH}`
  for (let k = -12; k <= 12; k += 1) d += `M800 ${FLOOR}L${800 + k * 160} ${HEIGHT + 30}`
  return `<rect y="${FLOOR}" width="${WIDTH}" height="${HEIGHT - FLOOR}" fill="#060607"/><path d="${d}" stroke="#ffffff" stroke-opacity="0.04" fill="none"/>` +
    `<rect y="${FLOOR - 1}" width="${WIDTH}" height="2" fill="${RED}" fill-opacity="0.3"/>`
}

const RUNNER = `
...HHHHHH...
..HHHHHHHH..
.HHBBBBBBHH.
.HHvvvvvvHH.
.HHBBBBBBHH.
.HHBBBBBBHH.
HHHHBBBBHHHH
.HHHHHHHHHH.
.HHHHHHHHHH.
`
const RUNNER_LEGS = [
  `
...kk..kk...
...kk..kk...
...kk..kk...
`,
  `
...kk..kk...
...kk...kk..
...kk...kk..
`,
]
const RUNNER_PAINT = { H: '#34343e', B: '#d97757', v: RED, k: '#24242b' }

const DRONE = `
r........r
rr......rr
.kkkkkkkk.
kkkkEEkkkk
.kkkkkkkk.
...k..k...
`
const DRONE_PAINT = { r: '#55555f', k: '#3a3a44', E: RED }

export function blackwallSvg(): string {
  const style = `
.shimmer{animation:shimmer 9s ease-in-out infinite}
.crackglow{animation:crack 5s ease-in-out infinite}
.eyes{opacity:0;animation:eyes 17s steps(1) infinite}
.glitchy{animation:glitchy 7s steps(1) infinite}
.slice{opacity:0;animation:slice 7s steps(1) infinite}
.visor{animation:visor 6s ease-in-out infinite}
.scan{animation:scan 14s linear infinite}
.hover{animation:hover 5s ease-in-out infinite}
@keyframes shimmer{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes crack{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes eyes{0%{opacity:0}70%{opacity:1}74%{opacity:0}75%{opacity:1}82%,100%{opacity:0}}
@keyframes glitchy{0%{transform:translateX(0)}88%{transform:translateX(0)}89%{transform:translateX(-6px)}90%{transform:translateX(4px)}91%,100%{transform:translateX(0)}}
@keyframes slice{0%{opacity:0}88%{opacity:.9}91%,100%{opacity:0}}
@keyframes visor{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes scan{from{transform:translateY(-80px)}to{transform:translateY(${HEIGHT + 80}px)}}
@keyframes hover{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`

  const defs = `
<radialGradient id="vignette" gradientUnits="userSpaceOnUse" cx="800" cy="420" r="1000"><stop offset="0" stop-color="#0d0d10"/><stop offset="0.6" stop-color="#070708"/><stop offset="1" stop-color="#020203"/></radialGradient>
<radialGradient id="redglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${RED}" stop-opacity="0.22"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient>
<linearGradient id="scantrail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RED}" stop-opacity="0"/><stop offset="1" stop-color="${RED}" stop-opacity="0.08"/></linearGradient>
<radialGradient id="haze" cx="0.5" cy="0.6" r="0.6"><stop offset="0" stop-color="#2a2a33" stop-opacity="0.35"/><stop offset="1" stop-color="#2a2a33" stop-opacity="0"/></radialGradient>
<clipPath id="maskslice"><rect x="0" y="236" width="${WIDTH}" height="14"/><rect x="0" y="268" width="${WIDTH}" height="8"/></clipPath>
${wallTile()}
${grain('#ffffff', 0.02, 0.12)}`

  const body = `
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>
${wall()}
<ellipse cx="760" cy="520" rx="520" ry="380" fill="url(#haze)"/>
${giant(760, FLOOR)}
${crack(1180, 120, 14, 5, 3)}${crack(560, 60, 10, 9, 9)}${crack(1420, 300, 12, 13, 14)}${crack(300, 520, 8, 17, 6)}
${mask(180, 250)}
${glyphSign(40, 420, 9, RED, 61)}${glyphSign(300, 420, 6, '#e6e6ea', 77)}
${specks(800, 400, 760, 380, 60, 21, '#d0d0d6')}
${floor()}
${figure(RUNNER, RUNNER_LEGS, PAIR_LEFT + 10, FLOOR - 27, RUNNER_PAINT, { glow: 'v' })}
<g class="hover">${figure(DRONE, [], PAIR_RIGHT + 50, FLOOR - 130, DRONE_PAINT, { cell: 8, delay: 1.5, skin: 'k' })}</g>
${scan()}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>`

  return svgRoot(style, defs, body)
}
