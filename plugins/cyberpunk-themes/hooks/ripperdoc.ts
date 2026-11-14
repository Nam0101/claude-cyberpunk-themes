// Ripperdoc. Every cyberpunk story needs a sketchy clinic, so here's mine.
// Tiled walls under harsh green light. On the left: a heart monitor, a pegboard of spare chrome parts,
// and a shelf of jars with eyeballs floating in them (gross, I know, but it felt right).
// On the right the doc, in a cap, mask and loupe, is fitting a new chrome arm onto a very calm patient,
// and you get little sparks every few seconds.
// The IV drip and the leaky pipes are just there to make the room feel lived in.

import { HEIGHT, PAIR_LEFT, PAIR_RIGHT, WIDTH, figure, grain, hash, rect, specks, sprite, square, svgRoot } from './kit'

const FLOOR = 780
const MINT = '#4fe0b5'
const PALE = '#c8fbe9'
const AMBER = '#f2b84b'
const CHROME = '#c9d3dc'

/** Wall tiles: a grid of grout lines, a few stained tiles, a dado line. */
function wall(): string {
  let grout = ''
  for (let x = 0; x <= WIDTH; x += 44) grout += `M${x} 0V${FLOOR}`
  for (let y = 0; y <= FLOOR; y += 44) grout += `M0 ${y}H${WIDTH}`
  let stains = ''
  for (let i = 0; i < 40; i += 1) {
    const x = Math.floor(hash(i, 701) * 36) * 44
    const y = Math.floor(hash(i, 702) * 17) * 44
    stains += rect(x + 1, y + 1, 43, 43)
  }
  return `<rect width="${WIDTH}" height="${FLOOR}" fill="url(#wall)"/><path d="${stains}" fill="#000" fill-opacity="0.12"/>` +
    `<path d="${grout}" stroke="#0a1a16" stroke-width="2" fill="none"/>` +
    `<rect y="${FLOOR - 160}" width="${WIDTH}" height="6" fill="#123029"/>`
}

/** The floor: dark checker tiles fading into shadow. */
function floor(): string {
  let a = ''
  for (let r = 0; r < 6; r += 1) {
    for (let c = 0; c < 40; c += 1) {
      if ((r + c) % 2 === 0) a += rect(c * 44 - (r % 2) * 22, FLOOR + r * 40, 44, 40)
    }
  }
  return `<rect y="${FLOOR}" width="${WIDTH}" height="${HEIGHT - FLOOR}" fill="#06100d"/><path d="${a}" fill="#0c1d18"/>` +
    `<rect y="${FLOOR}" width="${WIDTH}" height="${HEIGHT - FLOOR}" fill="url(#floorfade)"/>`
}

/** Ceiling pipes along the top, with a drip that falls from a joint now and then. */
function pipes(): string {
  return `<path d="${rect(0, 36, WIDTH, 14)}${rect(0, 60, WIDTH, 8)}" fill="#0e2621"/><path d="${rect(0, 36, WIDTH, 3)}" fill="#2a5a4e"/>` +
    [240, 610, 980, 1450].map((x, i) => `<path d="${rect(x, 32, 14, 22)}" fill="#163a32"/><path class="drop" style="animation-delay:-${i * 1.4}s" d="${square(x + 5, 54, 3)}" fill="${MINT}" fill-opacity="0.8"/>`).join('')
}

/** A CRT heart monitor: a bezel, a screen, a pulse line that draws itself across and a blinking rate. */
function monitor(x: number, y: number): string {
  const w = 230
  const h = 120
  let beat = `M${x + 14} ${y + 70}`
  for (let k = 0; k < 4; k += 1) {
    const bx = x + 14 + k * 52
    beat += `L${bx + 18} ${y + 70}L${bx + 24} ${y + 58}L${bx + 30} ${y + 92}L${bx + 36} ${y + 36}L${bx + 42} ${y + 70}L${bx + 52} ${y + 70}`
  }
  let bpm = ''
  const digits = ['111.001.010.010.010', '111.001.111.100.111']
  digits.forEach((pattern, n) => {
    pattern.split('.').forEach((row, r) => {
      for (let c = 0; c < 3; c += 1) if (row[c] === '1') bpm += square(x + w - 60 + n * 16 + c * 4, y + 14 + r * 4, 4)
    })
  })
  return `<path d="${rect(x - 10, y - 10, w + 20, h + 20)}" fill="#122b25"/><path d="${rect(x, y, w, h)}" fill="#03110d"/>` +
    `<path d="${beat}" stroke="${MINT}" stroke-opacity="0.18" stroke-width="2" fill="none"/>` +
    `<path class="trace" d="${beat}" pathLength="100" stroke="${PALE}" stroke-width="2.5" stroke-dasharray="18 100" fill="none"/>` +
    `<path class="beacon" d="${bpm}" fill="${MINT}"/><path d="${rect(x + w + 16, y + 30, 30, 70)}" fill="#0f241f"/>` +
    `<path d="${square(x + w + 24, y + 40, 6)}${square(x + w + 24, y + 56, 6)}" fill="${AMBER}" fill-opacity="0.7"/>`
}

/** A pegboard of spare cyberware: holes, hooks and four chrome parts hanging on them. */
function pegboard(x: number, y: number): string {
  const w = 260
  const h = 210
  let holes = ''
  for (let r = 0; r < 10; r += 1) for (let c = 0; c < 13; c += 1) holes += square(x + 10 + c * 19, y + 10 + r * 20, 3)
  const paint = { C: CHROME, c: '#eef3f6', d: '#6b7a85', r: '#ff6b6b', g: MINT }
  const arm = `
..cC..
.CCCC.
.CdCC.
.CCCC.
..CC..
..Cd..
..CC..
.CCCC.
CC.CCC
C..C.C
`
  const eye = `
.CCCC.
CdggdC
CgccgC
CdggdC
.CCCC.
`
  const spine = `
.C.
CcC
.d.
CCC
.d.
CcC
.d.
CCC
.d.
CcC
`
  const hand = `
C.C.C
C.C.C
CCCCC
CCdCC
.CCC.
`
  return `<path d="${rect(x, y, w, h)}" fill="#13241f"/><path d="${holes}" fill="#07120f"/>` +
    sprite(arm, x + 22, y + 26, 8, paint) + sprite(eye, x + 104, y + 36, 7, paint) + sprite(spine, x + 172, y + 20, 7, paint) + sprite(hand, x + 98, y + 120, 8, paint) +
    `<path class="beacon" d="${square(x + 125, y + 50, 6)}" fill="#ff6b6b"/>`
}

/** A shelf of jars with cyber-eyes floating in green fluid, bubbles rising through each. */
function jars(x: number, y: number): string {
  let out = `<path d="${rect(x - 10, y + 92, 280, 10)}" fill="#1b3a33"/>`
  for (let i = 0; i < 4; i += 1) {
    const jx = x + i * 66
    let bubbles = ''
    for (let b = 0; b < 4; b += 1) bubbles += square(jx + 10 + Math.round(hash(i, b) * 26), y + 80 - b * 18, 3)
    out += `<path d="${rect(jx, y + 4, 50, 88)}" fill="${MINT}" fill-opacity="0.16"/><path d="${rect(jx, y + 4, 50, 88)}" fill="none" stroke="${PALE}" stroke-opacity="0.35"/>` +
      `<path d="${rect(jx + 6, y - 6, 38, 10)}" fill="#2a4a42"/>` +
      `<g class="bob" style="animation-delay:-${i * 1.3}s"><circle cx="${jx + 25}" cy="${y + 46}" r="11" fill="#eaf5f1"/><circle cx="${jx + 25 + (i % 2 ? 3 : -3)}" cy="${y + 46}" r="5" fill="${i === 2 ? AMBER : MINT}"/><circle cx="${jx + 25 + (i % 2 ? 3 : -3)}" cy="${y + 46}" r="2" fill="#03110d"/></g>` +
      `<g class="bubble" style="animation-delay:-${i * 0.9}s"><path d="${bubbles}" fill="${PALE}" fill-opacity="0.6"/></g>`
  }
  return out
}

/** The green cross on the back wall, humming, with a halo. */
function cross(cx: number, cy: number): string {
  const s = 26
  return `<circle class="glow" cx="${cx}" cy="${cy}" r="160" fill="url(#crossglow)"/>` +
    `<g class="hum"><path d="${rect(cx - s / 2, cy - s * 1.5, s, s * 3)}${rect(cx - s * 1.5, cy - s / 2, s * 3, s)}" fill="${MINT}" fill-opacity="0.85"/></g>`
}

/** The surgical lamp: a ring of bulbs on an arm from the ceiling, and its light cone. */
function lamp(cx: number, y: number): string {
  let bulbs = ''
  for (let k = 0; k < 7; k += 1) bulbs += square(cx - 52 + k * 15, y + 10, 8)
  return `<path d="M${cx - 70} ${y + 20}L${cx - 260} ${FLOOR}L${cx + 260} ${FLOOR}L${cx + 70} ${y + 20}Z" fill="url(#cone)"/>` +
    `<path d="${rect(cx - 3, 68, 6, y - 68)}" fill="#163a32"/><path d="${rect(cx - 66, y - 6, 132, 18)}" fill="#1f4a40"/><path d="${bulbs}" fill="${PALE}"/>`
}

/** An IV stand with a bag that drips into its line. */
function iv(x: number): string {
  return `<path d="${rect(x, 420, 4, FLOOR - 420)}${rect(x - 20, FLOOR - 4, 44, 4)}${rect(x - 18, 420, 40, 3)}" fill="#2a4a42"/>` +
    `<path d="${rect(x - 18, 426, 26, 40)}" fill="${MINT}" fill-opacity="0.35" stroke="${PALE}" stroke-opacity="0.4"/>` +
    `<path class="ivdrip" d="${square(x - 6, 470, 3)}" fill="${PALE}"/><path d="M${x - 5} 470C${x - 5} 520 ${x - 40} 540 ${x - 60} 600" stroke="${PALE}" stroke-opacity="0.35" fill="none"/>`
}

/** The chair: a padded seat and back on a pedestal. */
function chair(x: number, seat: number): string {
  return `<path d="${rect(x - 6, seat, 152, 20)}${rect(x + 112, seat - 100, 30, 110)}${rect(x + 56, seat + 20, 18, FLOOR - seat - 20)}${rect(x + 30, FLOOR - 10, 70, 10)}" fill="#0f2c26"/>` +
    `<path d="${rect(x - 6, seat, 152, 4)}${rect(x + 112, seat - 100, 4, 110)}" fill="#2a5a4e"/>`
}

const DOC = `
..mmmmmmmm...
.mmmmmmmmmm..
..BBBBBBBB...
.LLBBBBBEB...
.LLBBBBBEB...
..MMMMMMMM...
sssMMMMMMssst
..ssssssss...
..ssssssss...
..ssssssss...
`
const DOC_LEGS = [
  `
...ss..ss....
...ss..ss....
...KK..KK....
`,
  `
...ss..ss....
...ss...ss...
...KK...KK...
`,
]
const DOC_PAINT = { m: '#8ff0cf', B: '#d97757', E: '#0b0a16', L: AMBER, M: '#dff7ee', s: '#2f8f78', t: AMBER, K: '#0c1f1a' }

const PATIENT = `
...hhhhhhhh...
..BBBBBBBBBB..
..BBEBBBBEBB..
..BBEBBBBEBB..
..BBBBBBBBBB..
..BBBjjjjBBB..
BBBBBBBBBBBBcC
BB.BBBBBBBB.CC
...KKKKKKKK.Cc
...KKKKKKKK.CC
`
const PATIENT_LEGS = [
  `
...KK....KK...
...KK....KK...
`,
  `
...KK....KK...
..KK.....KK...
`,
]
const PATIENT_PAINT = { h: '#1b2a26', B: '#d97757', E: '#0b0a16', j: CHROME, c: '#ffffff', C: CHROME, K: '#1f3a33' }

/** Sparks where the doc's tool meets the chrome arm. */
function sparks(x: number, y: number): string {
  let d = ''
  for (let i = 0; i < 9; i += 1) d += square(x + Math.round((hash(i, 81) - 0.3) * 30), y + Math.round((hash(i, 82) - 0.6) * 26), hash(i, 83) < 0.3 ? 3 : 2)
  return `<g class="spark"><path d="${d}" fill="${AMBER}"/><circle cx="${x}" cy="${y}" r="16" fill="url(#sparkglow)"/></g>`
}

export function ripperdocSvg(): string {
  const docGround = FLOOR - 24
  const seat = 640
  const style = `
.trace{animation:trace 2.6s linear infinite}
.drop{opacity:0;animation:drop 5s ease-in infinite}
.bob{animation:bob 6s ease-in-out infinite}
.bubble{animation:bubble 3.4s linear infinite}
.ivdrip{opacity:0;animation:ivdrip 2.2s ease-in infinite}
.spark{opacity:0;animation:spark 4s steps(1) infinite}
@keyframes trace{from{stroke-dashoffset:18}to{stroke-dashoffset:-100}}
@keyframes drop{0%{opacity:0;transform:translateY(0)}8%{opacity:.9}60%{opacity:.9;transform:translateY(700px)}62%,100%{opacity:0;transform:translateY(720px)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes bubble{0%{transform:translateY(0);opacity:0}20%{opacity:.8}100%{transform:translateY(-40px);opacity:0}}
@keyframes ivdrip{0%{opacity:0;transform:translateY(0)}20%{opacity:1}80%{opacity:1;transform:translateY(18px)}100%{opacity:0;transform:translateY(22px)}}
@keyframes spark{0%{opacity:0}62%{opacity:1}64%{opacity:.3}66%{opacity:1}70%{opacity:.6}72%,100%{opacity:0}}`

  const defs = `
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1915"/><stop offset="0.6" stop-color="#0f241f"/><stop offset="1" stop-color="#0b1c18"/></linearGradient>
<linearGradient id="floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03110d" stop-opacity="0"/><stop offset="1" stop-color="#03110d" stop-opacity="0.85"/></linearGradient>
<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PALE}" stop-opacity="0.2"/><stop offset="1" stop-color="${PALE}" stop-opacity="0.02"/></linearGradient>
<radialGradient id="crossglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${MINT}" stop-opacity="0.28"/><stop offset="1" stop-color="${MINT}" stop-opacity="0"/></radialGradient>
<radialGradient id="sparkglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${AMBER}" stop-opacity="0.6"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></radialGradient>
${grain('#c8fbe9')}`

  const body = `
${wall()}
${pipes()}
${cross(720, 300)}
${monitor(50, 110)}
${pegboard(40, 300)}
${jars(46, 560)}
${floor()}
${lamp(PAIR_LEFT + 120, 150)}
${iv(PAIR_RIGHT + 170)}
${chair(PAIR_RIGHT - 6, seat)}
${figure(PATIENT, PATIENT_LEGS, PAIR_RIGHT - 4, seat, PATIENT_PAINT, { delay: 2.1, glow: 'c' })}
${figure(DOC, DOC_LEGS, PAIR_LEFT - 30, docGround - 27, DOC_PAINT, { glow: 'Lt' })}
${sparks(PAIR_RIGHT + 116, seat - 22)}
${specks(800, 420, 700, 300, 30, 13, PALE)}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>`

  return svgRoot(style, defs, body)
}
