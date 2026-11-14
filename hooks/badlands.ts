// Badlands: the desert outside the city at dusk. A dark-window scene in burnt oranges.
// A huge striped sun sinks behind layered mesas; the city is a faint skyline on the far left horizon.
// An abandoned motel sign leans at the left, its arrow half lit. Wind turbines turn on the ridges, a dust devil
// wanders across the flats, and an elevated highway carries passing tail-lights.
// On the right a nomad car is parked on the hardpan: a tiny twin-tailed gunner sits on its roof, a big bruiser with
// a chrome jaw and arm leans in front of it.

import { glyphSign } from './extras'
import { HEIGHT, PAIR_LEFT, PAIR_RIGHT, WIDTH, figure, grain, hash, rect, specks, sprite, square, svgRoot } from './kit'

const HORIZON = 640
const SUN = '#ffb35c'
const EMBER = '#ff7a3d'
const DUST = '#e9b48a'
const NEON = '#ff5fa2'
const TEAL = '#5fe0d0'

/** The sun: a disc cut by widening scanline gaps toward its foot, with a broad glow. */
function sun(cx: number, cy: number, r: number): string {
  let d = ''
  for (let y = -r; y < 0; y += 6) {
    const depth = (y + r) / r
    const gap = depth > 0.45 ? Math.round((depth - 0.45) * 12) : 0
    const half = Math.round(Math.sqrt(r * r - y * y))
    d += rect(cx - half, cy + y, half * 2, 6 - Math.min(gap, 5))
  }
  return `<circle class="glow" cx="${cx}" cy="${cy}" r="${r * 2.4}" fill="url(#sunglow)"/><path d="${d}" fill="url(#sunfill)"/>`
}

/** Layered mesas: flat-topped buttes stepping down, three depths, each darker and nearer. */
function mesas(): string {
  const layer = (seed: number, base: number, tallest: number, colour: string, step: number) => {
    let d = `M0 ${HORIZON}`
    let x = 0
    let i = 0
    while (x < WIDTH) {
      const w = 60 + Math.floor(hash(seed, i) * 160)
      const hasMesa = hash(seed + 1, i) < 0.55
      const h = hasMesa ? Math.round((20 + hash(seed + 2, i) * tallest) / step) * step : Math.round(hash(seed + 3, i) * 14)
      d += `L${x} ${base - h}L${x + 10} ${base - h - step}L${x + w - 10} ${base - h - step}L${x + w} ${base - h}`
      x += w
      i += 1
    }
    d += `L${WIDTH} ${HORIZON}L${WIDTH} ${HEIGHT}L0 ${HEIGHT}Z`
    return `<path d="${d}" fill="${colour}"/>`
  }
  return layer(10, HORIZON, 130, '#4a2016', 6) + layer(20, HORIZON + 18, 90, '#331510', 6) + layer(30, HORIZON + 40, 50, '#220e0b', 4)
}

/** The city, far away on the left horizon: a thin skyline with pin lights. */
function farCity(): string {
  let d = ''
  let lights = ''
  for (let i = 0; i < 18; i += 1) {
    const x = 20 + i * 18
    const h = 20 + Math.round(hash(i, 51) * 70)
    d += rect(x, HORIZON - h, 14, h)
    if (hash(i, 52) < 0.5) lights += square(x + 5, HORIZON - h + 6, 2)
  }
  return `<path d="${d}" fill="#2a1424" fill-opacity="0.85"/><path class="beacon" d="${lights}" fill="${NEON}"/>`
}

/** A wind turbine: tower, nacelle, three blades turning about the hub. */
function turbine(x: number, base: number, h: number, seconds: number): string {
  const hub = base - h
  const blade = `M${x} ${hub}l-3 -${h * 0.5}l6 0z`
  return `<path d="M${x - 3} ${base}L${x - 1} ${hub}L${x + 1} ${hub}L${x + 3} ${base}Z" fill="#2a120d"/>` +
    `<g class="rotor" style="transform-origin:${x}px ${hub}px;animation-duration:${seconds}s"><path d="${blade}" fill="#3a1a12"/><path d="${blade}" fill="#3a1a12" transform="rotate(120 ${x} ${hub})"/><path d="${blade}" fill="#3a1a12" transform="rotate(240 ${x} ${hub})"/></g>` +
    `<path class="beacon" d="${square(x - 2, hub - 2, 4)}" fill="${EMBER}"/>`
}

/** The elevated highway: a deck on pillars, lane dashes, and tail-lights streaming along it. */
function highway(y: number): string {
  let pillars = ''
  for (let x = 30; x < WIDTH; x += 170) pillars += rect(x, y + 10, 12, HORIZON + 40 - y)
  let dashes = ''
  for (let x = 0; x < WIDTH + 80; x += 40) dashes += rect(x, y + 4, 18, 2)
  let lights = ''
  for (let i = 0; i < 14; i += 1) lights += rect(Math.round(hash(i, 61) * WIDTH), y + 1, 6, 3)
  return `<path d="${pillars}" fill="#1c0b08"/><path d="${rect(0, y, WIDTH, 10)}" fill="#2a120d"/><path d="${dashes}" fill="${DUST}" fill-opacity="0.25"/>` +
    `<g class="lanes"><path d="${lights}" fill="${NEON}" fill-opacity="0.85"/><path transform="translate(${WIDTH} 0)" d="${lights}" fill="${NEON}" fill-opacity="0.85"/></g>`
}

/** The abandoned motel sign: a frame on a pole, script lettering, an arrow whose bulbs chase, half of them dead. */
function motelSign(x: number, y: number): string {
  let bulbs = ''
  let dead = ''
  const arrow = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [5, -1], [4, -2], [5, 1], [4, 2]]
  arrow.forEach(([c, r], i) => {
    const s = square(x + 30 + (c ?? 0) * 14, y + 170 + (r ?? 0) * 14, 8)
    if (i % 4 === 3) dead += s
    else bulbs += s
  })
  return `<path d="${rect(x + 100, y + 200, 10, HORIZON + 20 - y - 200)}" fill="#1c0b08"/><path d="${rect(x, y, 200, 150)}" fill="#1a0c0a" stroke="${EMBER}" stroke-opacity="0.5"/>` +
    glyphSign(x + 20, y + 12, 7, NEON, 31) + glyphSign(x + 50, y + 12, 7, SUN, 47) +
    `<path d="${rect(x + 84, y + 20, 100, 6)}${rect(x + 84, y + 40, 70, 6)}${rect(x + 84, y + 60, 90, 6)}" fill="${DUST}" fill-opacity="0.25"/>` +
    `<g class="chase"><path d="${bulbs}" fill="${SUN}"/></g><path d="${dead}" fill="#3a1a12"/>` +
    `<circle class="glow" cx="${x + 100}" cy="${y + 90}" r="140" fill="url(#neonglow)"/>`
}

/** A dust devil: a funnel of specks that leans and wanders slowly across the flats. */
function dustDevil(): string {
  let d = ''
  for (let i = 0; i < 70; i += 1) {
    const t = hash(i, 91)
    const y = 720 - t * 120
    const spread = 6 + t * 30
    d += square(Math.round(560 + (hash(i, 92) - 0.5) * spread * 2 + t * 18), Math.round(y), hash(i, 93) < 0.3 ? 3 : 2)
  }
  return `<g class="devil"><g class="twist"><path d="${d}" fill="${DUST}" fill-opacity="0.45"/></g></g>`
}

/** The nomad car: a low long body, a roof, a stripe, wheels, and headlights that pool on the ground. */
function car(x: number, ground: number): string {
  const paint = { k: '#3a2018', K: '#5a2e20', s: EMBER, w: '#120a08', h: '#ffe6b0', g: '#7a6a80', r: '#ff4d4d' }
  const map = `
......KKKKKKKKKKKKK..........
.....KggggggKggggggK.........
....KggggggKKggggggKK........
KKKKKKKKKKKKKKKKKKKKKKKKKKKKK
hKKKKKKKKKKKKKKKKKKKKKKKKKKKr
ssssssssssssssssssssssssssss.
kKKKKKKKKKKKKKKKKKKKKKKKKKKKk
kk.www.kkkkkkkkkkkkkk.www.kkk
...www................www....
`
  const cell = 8
  const top = ground - 9 * cell
  return `<ellipse cx="${x - 40}" cy="${ground + 6}" rx="120" ry="16" fill="url(#headlight)"/>` + sprite(map, x, top, cell, paint)
}

const GUNNER = `
gg.HHHHHH.gg
ggHHHHHHHHgg
g.BBBBBBBB.g
g.BEBBBBEB.g
..BEBBBBEB..
..BBBBBBBB..
pppBBBBBBppp
..pppppppp..
GGGGGGGGGGGa
..pppppppp..
`
const GUNNER_LEGS = [
  `
...kk..kk...
...kk..kk...
`,
  `
...kk..kk...
..kk....kk..
`,
]
const GUNNER_PAINT = { g: TEAL, H: TEAL, B: '#d97757', E: '#0b0a16', p: NEON, G: '#2b2b33', a: TEAL, k: '#1a0e1a' }

const BRUISER = `
...hhhhhhhh...
..BBBBBBBBBB..
..BBEBBBBEBB..
..BBEBBBBEBB..
..BBBBBBBBBB..
..BjjjjjjjjB..
JJJJJBBBBJJJCC
JJ.JJJJJJJJ.CC
...JJJJJJJJ.cC
...JJJJJJJJ.CC
`
const BRUISER_LEGS = [
  `
...kk....kk...
...kk....kk...
..kkk....kkk..
`,
  `
...kk....kk...
...kk....kk...
..kkk...kkk...
`,
]
const BRUISER_PAINT = { h: '#2a1a14', B: '#d97757', E: '#0b0a16', j: '#c9d3dc', J: '#5a4a2a', C: '#c9d3dc', c: '#ffffff', k: '#1c120c' }

export function badlandsSvg(): string {
  const ground = 760
  const carX = PAIR_LEFT - 6
  const roof = ground - 9 * 8
  const style = `
.rotor{animation:rotor 9s linear infinite}
.lanes{animation:lanes 14s linear infinite}
.chase{animation:chase 1.6s steps(2) infinite}
.devil{animation:devil 60s ease-in-out infinite alternate}
.twist{transform-box:fill-box;transform-origin:50% 100%;animation:twist 2.4s ease-in-out infinite alternate}
.haze{animation:haze 7s ease-in-out infinite alternate}
@keyframes rotor{to{transform:rotate(360deg)}}
@keyframes lanes{from{transform:translateX(0)}to{transform:translateX(-${WIDTH}px)}}
@keyframes chase{0%{opacity:1}50%{opacity:.35}}
@keyframes devil{from{transform:translateX(0)}to{transform:translateX(320px)}}
@keyframes twist{from{transform:skewX(-6deg)}to{transform:skewX(6deg)}}
@keyframes haze{from{opacity:.5}to{opacity:1}}`

  const defs = `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120810"/><stop offset="0.4" stop-color="#2a1218"/><stop offset="0.62" stop-color="#5a2418"/><stop offset="0.66" stop-color="#7a3420"/><stop offset="1" stop-color="#7a3420"/></linearGradient>
<linearGradient id="sunfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SUN}"/><stop offset="1" stop-color="${EMBER}"/></linearGradient>
<radialGradient id="sunglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${SUN}" stop-opacity="0.3"/><stop offset="0.5" stop-color="${EMBER}" stop-opacity="0.08"/><stop offset="1" stop-color="${EMBER}" stop-opacity="0"/></radialGradient>
<radialGradient id="neonglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${NEON}" stop-opacity="0.2"/><stop offset="1" stop-color="${NEON}" stop-opacity="0"/></radialGradient>
<radialGradient id="headlight" cx="0.3" cy="0.5" r="0.7"><stop offset="0" stop-color="#ffe6b0" stop-opacity="0.35"/><stop offset="1" stop-color="#ffe6b0" stop-opacity="0"/></radialGradient>
<linearGradient id="heat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${EMBER}" stop-opacity="0"/><stop offset="1" stop-color="${EMBER}" stop-opacity="0.12"/></linearGradient>
${grain('#ffd0a0')}`

  const body = `
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
${specks(800, 160, 760, 140, 40, 3, '#ffd9b8')}
${sun(760, HORIZON - 10, 210)}
<rect class="haze" y="${HORIZON - 140}" width="${WIDTH}" height="140" fill="url(#heat)"/>
${farCity()}
${turbine(470, HORIZON - 40, 150, 11)}${turbine(560, HORIZON - 30, 120, 8)}${turbine(1450, HORIZON - 50, 170, 13)}
${mesas()}
${highway(HORIZON + 10)}
${motelSign(60, 300)}
${dustDevil()}
${specks(900, 760, 700, 120, 40, 17, DUST)}
${car(carX, ground)}
${figure(GUNNER, GUNNER_LEGS, carX + 54, roof, GUNNER_PAINT, { cell: 8, glow: 'ga' })}
${figure(BRUISER, BRUISER_LEGS, PAIR_RIGHT - 6, ground + 24 - 27, BRUISER_PAINT, { delay: 2.4, glow: 'c' })}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>`

  return svgRoot(style, defs, body)
}
