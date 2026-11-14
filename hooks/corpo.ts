// Corpo Plaza. The only light-mode theme, for the people who code in daylight.
// A spotless corporate plaza: pale glass towers, a giant red hologram logo slowly turning, a stock ticker,
// a cherry tree on the left with petals drifting across everything, and a security drone scanning the floor.
// On the right, a corpo in a black suit and sunglasses with a briefcase, and their very white security bot.
// Everything is a little too clean, which is kind of the point.

import { glyphSign } from './extras'
import { HEIGHT, PAIR_LEFT, PAIR_RIGHT, WIDTH, figure, grain, hash, rect, sprite, svgRoot } from './kit'

const FLOOR = 770
const RED = '#d4213d'
const INK = '#2a2833'
const PETAL = '#f2a2bd'

/** Glass towers: pale slabs with a faint window grid, a lit edge and a darker shaded side. */
function towers(): string {
  const list: Array<[number, number, number, string]> = [
    [30, 120, 520, '#e4e3ea'], [170, 90, 380, '#dcdbe3'], [420, 110, 600, '#e1e0e7'], [560, 150, 820, '#d9d8e1'],
    [740, 100, 460, '#e3e2e9'], [870, 130, 640, '#dddce4'], [1030, 90, 340, '#e5e4eb'], [1360, 140, 700, '#dbdae2'], [1500, 100, 420, '#e2e1e8'],
  ]
  let out = ''
  for (const [x, w, h, fill] of list) {
    let grid = ''
    for (let y = FLOOR - h + 14; y < FLOOR; y += 14) grid += `M${x + 6} ${y}h${w - 12}`
    for (let gx = x + 18; gx < x + w - 6; gx += 18) grid += `M${gx} ${FLOOR - h + 8}V${FLOOR}`
    out += `<path d="${rect(x, FLOOR - h, w, h)}" fill="${fill}"/><path d="${rect(x + w - 16, FLOOR - h, 16, h)}" fill="#cfcdd8" fill-opacity="0.6"/>` +
      `<path d="${grid}" stroke="#ffffff" stroke-opacity="0.55" fill="none"/><path d="${rect(x, FLOOR - h, 3, h)}" fill="#ffffff" fill-opacity="0.8"/>`
  }
  return out
}

/** The hologram emblem: a red ring with a turning inner mark, scanlined, floating above the tallest tower. */
function emblem(cx: number, cy: number): string {
  let scan = ''
  for (let y = cy - 90; y < cy + 90; y += 5) scan += `M${cx - 95} ${y}h190`
  return `<circle class="glow" cx="${cx}" cy="${cy}" r="170" fill="url(#hologlow)"/>` +
    `<g class="holoflick"><circle cx="${cx}" cy="${cy}" r="72" fill="none" stroke="${RED}" stroke-width="12" stroke-opacity="0.75"/>` +
    `<g class="turn" style="transform-origin:${cx}px ${cy}px"><path d="M${cx} ${cy - 52}L${cx + 45} ${cy + 26}L${cx - 45} ${cy + 26}Z" fill="none" stroke="${RED}" stroke-width="9" stroke-opacity="0.75"/><circle cx="${cx}" cy="${cy}" r="10" fill="${RED}" fill-opacity="0.8"/></g>` +
    `<path d="${scan}" stroke="#ffffff" stroke-opacity="0.45" fill="none"/></g>` +
    `<path d="M${cx - 8} ${cy + 96}L${cx - 50} ${cy + 150}h100L${cx + 8} ${cy + 96}Z" fill="${RED}" fill-opacity="0.06"/>`
}

/** A stock ticker band across a tower: a dark strip with red and green bars scrolling past. */
function ticker(x: number, y: number, w: number): string {
  let bars = ''
  let ups = ''
  for (let i = 0; i < 30; i += 1) {
    const bx = x + i * 16
    const h = 3 + Math.round(hash(i, 21) * 8)
    const s = rect(bx, y + 14 - h, 10, h)
    if (hash(i, 22) < 0.55) ups += s
    else bars += s
  }
  return `<path d="${rect(x, y, w, 18)}" fill="${INK}"/><clipPath id="tick"><rect x="${x}" y="${y}" width="${w}" height="18"/></clipPath>` +
    `<g clip-path="url(#tick)"><g class="tickrun"><path d="${ups}" fill="#3fbf7f"/><path d="${bars}" fill="${RED}"/><path transform="translate(480 0)" d="${ups}" fill="#3fbf7f"/><path transform="translate(480 0)" d="${bars}" fill="${RED}"/></g></g>`
}

/** The cherry tree in its planter: a trunk, branching limbs and a canopy of pink tiles. */
function cherryTree(x: number, base: number): string {
  const map = `
......pppp.ppp.......
...ppPpppppPpppp.....
..pPpppppPpppppPppp..
.pppppPppppppppppPpp.
pppPpppppbpppPpppppp.
.pppppbbppppbbppPppp.
..pPpppbbbbbbpppppp..
....pp...bb...ppp....
.........bb..........
.........bb..........
.........bb..........
........bbbb.........
`
  const paint = { p: '#f5b8cc', P: '#ea8fae', b: '#6b5a52' }
  const top = base - 12 * 10 - 30
  return sprite(map, x, top, 10, paint) + `<path d="${rect(x + 50, base - 30, 110, 30)}" fill="#c9c7d1"/><path d="${rect(x + 50, base - 30, 110, 4)}" fill="#ffffff"/>`
}

/** Petals drifting across the plaza on the wind, in three layers. */
function petals(): string {
  const layers = ['', '', '']
  for (let i = 0; i < 54; i += 1) {
    const x = Math.round(hash(i, 31) * (WIDTH + 400)) - 400
    const y = Math.round(hash(i, 32) * HEIGHT)
    layers[i % 3] = (layers[i % 3] ?? '') + `M${x} ${y}h4v3h-4zM${x + 2} ${y - 2}h3v2h-3z`
  }
  return layers.map((d, i) => `<g class="petals" style="animation-duration:${26 + i * 9}s;animation-delay:-${i * 7}s"><path d="${d}" fill="${PETAL}" fill-opacity="${0.75 - i * 0.15}"/></g>`).join('')
}

/** The marble plaza: pale slabs, soft veins and the towers reflected faintly. */
function plaza(): string {
  let seams = ''
  for (let k = 1; k <= 7; k += 1) seams += `M0 ${FLOOR + Math.round(Math.pow(k / 7, 1.8) * (HEIGHT - FLOOR + 20))}H${WIDTH}`
  for (let k = -10; k <= 10; k += 1) seams += `M800 ${FLOOR}L${800 + k * 190} ${HEIGHT + 20}`
  let veins = ''
  for (let i = 0; i < 14; i += 1) {
    const x = Math.round(hash(i, 41) * WIDTH)
    const y = FLOOR + 20 + Math.round(hash(i, 42) * 200)
    veins += `M${x} ${y}l${30 + Math.round(hash(i, 43) * 60)} ${Math.round((hash(i, 44) - 0.5) * 20)}`
  }
  return `<rect y="${FLOOR}" width="${WIDTH}" height="${HEIGHT - FLOOR}" fill="url(#marble)"/><path d="${seams}" stroke="#bdbbc7" stroke-opacity="0.5" fill="none"/>` +
    `<path d="${veins}" stroke="#a9a7b5" stroke-opacity="0.35" fill="none"/><rect y="${FLOOR}" width="${WIDTH}" height="2" fill="#ffffff"/>`
}

/** The security drone: a small white craft with a red eye, sweeping a translucent scan cone over the plaza. */
function drone(cx: number, cy: number): string {
  const map = `
kk..........kk
.kkkkkkkkkkkk.
..wwwwwwwwww..
.wwwwwrrwwwww.
..wwwwwwwwww..
`
  const paint = { k: '#9a98a6', w: '#f7f7fa', r: RED }
  return `<g class="sweep" style="transform-origin:${cx}px ${cy + 20}px"><path d="M${cx} ${cy + 20}L${cx - 70} ${FLOOR}L${cx + 70} ${FLOOR}Z" fill="${RED}" fill-opacity="0.07"/></g>` +
    `<g class="hover">${sprite(map, cx - 28, cy, 4, paint)}</g>`
}

const CORPO = `
..hhhhhhhh..
.hhhhhhhhhh.
..BBBBBBBB..
..GGGGGGGG..
..BGgBBGgB..
..BBBBBBBB..
KKKwwrrwwKKK
..KKwrrwKK..
..KKKrrKKK..
..KKKKKKKK..
`
const CORPO_LEGS = [
  `
...KK..KK...
...KK..KK...
...kk..kk...
`,
  `
...KK..KK...
...KK..KK...
..kk...kk...
`,
]
const CORPO_PAINT = { h: '#2b2a32', B: '#d97757', G: '#141319', g: '#ffffff', K: '#1d1c24', w: '#ffffff', r: RED, k: '#0e0d12' }

const BOT = `
..oooooo..
.owwwwwwo.
.owvvvvwo.
.owwwwwwo.
oowwwwwwoo
.owggggwo.
.owwwwwwo.
..oooooo..
`
const BOT_LEGS = [
  `
..oo..oo..
.oooooooo.
`,
  `
..oo..oo..
.oooooooo.
`,
]
const BOT_PAINT = { o: '#a9a7b5', w: '#fbfbfd', v: RED, g: '#cfcdd8' }

export function corpoPlazaSvg(): string {
  const style = `
.turn{animation:turn 18s linear infinite}
.holoflick{animation:holoflick 9s steps(1) infinite}
.tickrun{animation:tickrun 12s linear infinite}
.petals{animation:petals 30s linear infinite}
.sweep{animation:sweep 8s ease-in-out infinite alternate}
.hover{animation:hover 5s ease-in-out infinite}
@keyframes turn{to{transform:rotate(360deg)}}
@keyframes holoflick{0%{opacity:.9}92%{opacity:.9}93%{opacity:.5}94%{opacity:.9}100%{opacity:.9}}
@keyframes tickrun{from{transform:translateX(0)}to{transform:translateX(-480px)}}
@keyframes petals{from{transform:translate(0,0)}to{transform:translate(420px,260px)}}
@keyframes sweep{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
@keyframes hover{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`

  const defs = `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f5f9"/><stop offset="0.7" stop-color="#ebe9f0"/><stop offset="1" stop-color="#e3e1e9"/></linearGradient>
<linearGradient id="marble" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eeedf2"/><stop offset="1" stop-color="#dedce5"/></linearGradient>
<radialGradient id="hologlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${RED}" stop-opacity="0.12"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient>
<radialGradient id="sunhaze" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
${grain('#ffffff', 0.05, 0.035)}`

  const body = `
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
<ellipse cx="1000" cy="120" rx="700" ry="260" fill="url(#sunhaze)"/>
${towers()}
${emblem(635, 220)}
${ticker(870, 300, 130)}
${glyphSign(1395, 120, 10, RED, 101).replace('#0d0a1c', '#f7f6fa')}
${plaza()}
${cherryTree(40, FLOOR)}
${drone(760, 420)}
${sprite(`
.cc.
cccc
cccc
`, PAIR_LEFT + 104, FLOOR - 40, 8, { c: '#5a3a2a' })}
${figure(CORPO, CORPO_LEGS, PAIR_LEFT, FLOOR - 27, CORPO_PAINT)}
${figure(BOT, BOT_LEGS, PAIR_RIGHT + 30, FLOOR - 18, BOT_PAINT, { delay: 1.9, glow: 'v', skin: 'w' })}
${petals()}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>`

  return svgRoot(style, defs, body)
}
