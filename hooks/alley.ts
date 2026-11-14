// Phosphor Alley. My room has green lighting, so this is the one I actually use most.
// Street level this time: an old apartment block on the left with dripping AC units (and a cat that lives on one),
// a noodle-shop sign, and a vending machine glowing at the bottom.
// The two mascots sit on a power line sharing an LED umbrella, next to some pigeons and a pair of sneakers
// someone threw up there. A hologram jellyfish ad floats in the sky and glitches every now and then.
// Pretty much everything is green and teal, except for one warm amber from the sign and the mascots themselves.
// Plain string building again: no DOM, nothing from outside, same picture every time.

import { EXTRA_STYLE, codeScreen, flyingCar, glyphSign, megatower } from './extras'
import { BOB, JACKET, cellsOf, grain, hash, mascot, square } from './scene'

const WIDTH = 1600
const HEIGHT = 1000
const STREET = 860

const MINT = '#7ff0c4'
const PHOSPHOR = '#a6f08a'
const TEAL = '#4fd6c6'
const AMBER = '#f0a860'

type Cable = { ax: number; ay: number; bx: number; by: number; sag: number }

const LOW: Cable = { ax: 380, ay: 300, bx: 1420, by: 282, sag: 110 }
const HIGH: Cable = { ax: 380, ay: 250, bx: 1420, by: 236, sag: 200 }

function cableY(c: Cable, x: number): number {
  const t = (x - c.ax) / (c.bx - c.ax)
  return Math.round(c.ay + (c.by - c.ay) * t + c.sag * 4 * t * (1 - t))
}

function cablePath(c: Cable): string {
  // A quadratic whose control point gives the same sag at the middle as the parabola above.
  const mx = (c.ax + c.bx) / 2
  const my = (c.ay + c.by) / 2 + c.sag * 2
  return `M${c.ax} ${c.ay}Q${mx} ${my} ${c.bx} ${c.by}`
}

/** Tiles from a map at a given cell size, one path per letter. */
function sprite(map: string, left: number, top: number, cell: number, paint: Record<string, string>, gap = 0): string {
  const byKind = new Map<string, string>()
  for (const c of cellsOf(map)) byKind.set(c.kind, (byKind.get(c.kind) ?? '') + square(left + c.x * cell, top + c.y * cell, cell - gap))
  let out = ''
  for (const [kind, d] of byKind) out += `<path d="${d}" fill="${paint[kind] ?? '#888'}"/>`
  return out
}

/** The far city: low blocks in haze, each tall one with a slow green aviation light. */
function farCity(): string {
  let d = ''
  let lights = ''
  let x = 360
  let i = 0
  while (x < WIDTH) {
    const w = 40 + Math.floor(hash(301, i) * 70)
    const h = 70 + Math.floor(hash(302, i) * 200 * (x > 1100 ? 1 : 0.6))
    d += `M${x} ${STREET - h}h${w}v${h}h-${w}z`
    if (h > 150) lights += square(x + Math.round(w / 2) - 2, STREET - h - 6, 4)
    x += w + (hash(303, i) < 0.3 ? 14 : 0)
    i += 1
  }
  return `<path d="${d}" fill="#0b211c" fill-opacity="0.85"/><path class="beacon" d="${lights}" fill="${PHOSPHOR}"/>`
}

/** The apartment block at the left: a window grid, a few lit in green and one in amber, one with a plant in it. */
function block(): string {
  const right = 380
  const top = 90
  let wall = `<path d="M0 ${top}h${right}v${STREET - top}h-${right}z" fill="#0a1a16"/><path d="M0 ${top}h${right}v3h-${right}z" fill="#1f4a40"/>`
  const lit: Record<string, string> = { a: '', b: '', c: '', w: '' }
  let dark = ''
  for (let row = 0; row < 24; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const x = 22 + col * 40
      const y = top + 26 + row * 30
      if (y > STREET - 60) continue
      const roll = hash(col * 7 + 1, row * 13 + 5)
      const r = `M${x} ${y}h22v14h-22z`
      if (roll < 0.07) lit.a += r
      else if (roll < 0.12) lit.b += r
      else if (roll < 0.15) lit.c += r
      else if (roll < 0.165) lit.w += r
      else dark += r
    }
  }
  wall += `<path d="${dark}" fill="#0f241f"/>`
  wall += `<path class="win" d="${lit.a}" fill="${MINT}" fill-opacity="0.45"/>`
  wall += `<path class="win" style="animation-delay:-7s" d="${lit.b}" fill="${PHOSPHOR}" fill-opacity="0.35"/>`
  wall += `<path class="win" style="animation-delay:-3s" d="${lit.c}" fill="${TEAL}" fill-opacity="0.4"/>`
  wall += `<path d="${lit.w}" fill="${AMBER}" fill-opacity="0.55"/>`
  // A potted plant silhouetted in one lit window.
  wall += `<path d="M262 ${top + 26 + 8 * 30}h22v14h-22z" fill="${MINT}" fill-opacity="0.5"/>` +
    sprite(`
..g.g..
.ggggg.
..ggg..
..pp...
`, 266, top + 26 + 8 * 30 + 1, 3, { g: '#0d3a2c', p: '#3a2a1c' })
  // A rooftop water tank and the hologram projector.
  wall += `<path d="M40 ${top - 40}h44v40h-44zM48 ${top - 48}h28v8h-28zM44 ${top - 4}h4v4h-4zM76 ${top - 4}h4v4h-4z" fill="#0d221d"/>`
  wall += `<path d="M330 ${top - 14}h26v14h-26z" fill="#163a32"/><path class="beacon" d="${square(339, top - 20, 8)}" fill="${TEAL}"/>`
  return wall
}

/** AC units bolted to the block's edge, each with a drip that falls on its own clock; a cat sits on the top one. */
function acUnits(): string {
  let out = ''
  const ys = [420, 560, 700]
  ys.forEach((y, i) => {
    out += `<path d="M352 ${y}h56v34h-56z" fill="#173830"/><path d="M356 ${y + 6}h48v2h-48zM356 ${y + 12}h48v2h-48zM356 ${y + 18}h48v2h-48z" fill="#0d221d"/>`
    out += `<circle class="fan" style="animation-delay:-${i}s" cx="394" cy="${y + 17}" r="9" fill="none" stroke="#2c6052" stroke-width="2" stroke-dasharray="5 4"/>`
    out += `<path class="drip" style="animation-delay:-${i * 1.3}s" d="${square(372, y + 36, 3)}" fill="${MINT}" fill-opacity="0.7"/>`
  })
  // The cat: a dark silhouette with two green eyes that blink, and a tail on two poses.
  const cat = `
.k...k.
.kk.kk.
.kkkkk.
.kekek.
.kkkkk.
..kkk..
.kkkkk.
kkkkkkk
kkkkkkk
`
  const left = 362
  const top = 420 - 36
  out += sprite(cat.replace(/e/g, 'k'), left, top, 4, { k: '#06110e' })
  out += `<g class="blink" style="animation-delay:-2s">${sprite(cat.replace(/k/g, '.'), left, top, 4, { e: PHOSPHOR })}</g>`
  out += `<g class="leg0" style="animation-duration:5s">${sprite(`
k...
k...
.k..
.kk.
`, left + 26, top + 18, 4, { k: '#06110e' })}</g><g class="leg1" style="animation-duration:5s">${sprite(`
....
.k..
k...
.kk.
`, left + 26, top + 18, 4, { k: '#06110e' })}</g>`
  return out
}

/** A noodle-shop sign hanging off the block: a pixel bowl with rising steam, under a green frame that hums. */
function shopSign(): string {
  const x = 410
  const y = 300
  const bowl = `
....s.s.s....
.....s.s.....
....s.s.s....
.............
cccccccccccc.
.bbbbbbbbbb..
..bbbbbbbb...
...bbbbbb....
`
  return `<path d="M380 ${y + 8}h30v3h-30zM380 ${y + 92}h30v3h-30z" fill="#1f4a40"/>` +
    `<ellipse class="glow" cx="${x + 40}" cy="${y + 52}" rx="110" ry="90" fill="url(#signglow)"/>` +
    `<g class="hum"><path d="M${x} ${y}h84v104h-84z" fill="#0c2a22"/><path d="M${x} ${y}h84v104h-84z" fill="none" stroke="${MINT}" stroke-width="3" stroke-opacity="0.85"/>` +
    sprite(bowl.replace(/s/g, '.'), x + 14, y + 30, 5, { c: MINT, b: AMBER }) +
    `<g class="steam">${sprite(bowl.replace(/[cb]/g, '.'), x + 14, y + 30, 5, { s: '#d8fff0' })}</g>` +
    `<path d="M${x + 14} ${y + 82}h56v4h-56zM${x + 22} ${y + 90}h40v4h-40z" fill="${MINT}" fill-opacity="0.6"/></g>`
}

/** The vending machine: a mint-lit window of drink cans in rows, a pale strip on top, a glow pooled on the street. */
function vending(): string {
  const x = 420
  const y = 732
  let cans = ''
  const colours = [MINT, AMBER, TEAL, PHOSPHOR, '#e8f7ff']
  const byColour = new Map<string, string>()
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const c = colours[Math.floor(hash(col + 40, row + 9) * colours.length)] ?? MINT
      byColour.set(c, (byColour.get(c) ?? '') + `M${x + 10 + col * 13} ${y + 22 + row * 20}h7v12h-7z`)
    }
  }
  for (const [c, d] of byColour) cans += `<path d="${d}" fill="${c}" fill-opacity="0.85"/>`
  return `<ellipse cx="${x + 44}" cy="${STREET + 6}" rx="150" ry="26" fill="url(#pool)"/>` +
    `<path d="M${x} ${y}h88v128h-88z" fill="#10302a"/><g class="flick"><path d="M${x + 6} ${y + 14}h76v66h-76z" fill="#1f5c4c"/>${cans}<path d="M${x + 4} ${y + 4}h80v6h-80z" fill="${MINT}" fill-opacity="0.8"/></g>` +
    `<path d="M${x + 10} ${y + 92}h40v14h-40z" fill="#081a16"/><path d="M${x + 62} ${y + 90}h16v6h-16z" fill="${AMBER}" fill-opacity="0.6"/>`
}

/** The utility pole at the right: a crossarm, insulators, a transformer with a status light. */
function pole(): string {
  const x = 1420
  return `<path d="M${x} 210h14v${STREET - 210}h-14z" fill="#0c1f1a"/><path d="M${x - 50} 272h120v8h-120z" fill="#0f2722"/>` +
    `<path d="M${x - 46} 262h6v10h-6zM${x + 10} 262h6v10h-6zM${x + 56} 262h6v10h-6z" fill="#2c6052"/>` +
    `<path d="M${x - 26} 380h40v54h-40z" fill="#12302a"/><path class="beacon" d="${square(x - 18, 392, 4)}" fill="${PHOSPHOR}"/>` +
    `<path d="M${x + 7} 240Q${x + 60} 290 1620 300" stroke="#163a32" stroke-width="2" fill="none"/>`
}

/** Pigeons on the upper line, heads bobbing on two poses each. */
function pigeons(): string {
  const body = { g: '#2f4a44', l: '#4e7068', e: '#c9f5dc' }
  const up = `
..ll..
.leg..
.ggggg
..gggg
..g.g.
`
  const down = `
......
..ll..
.legg.
.ggggg
..g.g.
`
  return [770, 812, 866]
    .map((x, i) => {
      const top = cableY(HIGH, x + 10) - 20
      return `<g class="pose${i % 2 === 0 ? 'A' : 'B'}">${sprite(up, x, top, 4, body)}</g><g class="pose${i % 2 === 0 ? 'B' : 'A'}">${sprite(down, x, top, 4, body)}</g>`
    })
    .join('')
}

/** Someone threw their sneakers over the wire. They sway a little. */
function sneakers(): string {
  const x = 1000
  const y = cableY(HIGH, x)
  const shoe = `
.ww.
.ww.
wwww
mmmm
`
  const paint = { w: '#d8efe6', m: MINT }
  return `<g class="sway" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y}l-10 30M${x} ${y}l10 38" stroke="#5c8a7e" stroke-width="1.2" fill="none"/>` +
    `${sprite(shoe, x - 18, y + 28, 4, paint)}${sprite(shoe, x + 4, y + 36, 4, paint)}</g>`
}

/** The glowing umbrella the silver-haired one holds over both of them. */
function umbrella(cx: number, bottom: number, handleY: number): string {
  const map = `
.........cccccccc.........
.....cccccccccccccccc.....
..ccccccrccccccccrcccccc..
.cccccrcccccccccccrcccccc.
ccccrccccccccccccccccrcccc
rrrrrrrrrrrrrrrrrrrrrrrrrr
`
  const cell = 8
  const left = cx - 13 * cell
  const top = bottom - 6 * cell
  return `<ellipse class="glow" cx="${cx}" cy="${bottom}" rx="170" ry="80" fill="url(#umbrellaglow)"/>` +
    `<g class="breathe2"><path d="M${cx - 1} ${bottom}h3v${handleY - bottom}h-3z" fill="#5c8a7e"/>${sprite(map, left, top, cell, { c: '#3fbfae', r: '#a6ffe8' })}</g>`
}

/** The hologram jellyfish: a scanlined bell that pulses, five tentacles that sway, a projector beam from the roof, a glitch now and then. */
function jellyfish(cx: number, cy: number): string {
  const cell = 10
  const radius = 7
  let bright = ''
  let dim = ''
  for (let row = 0; row < radius; row += 1) {
    const half = Math.round(Math.sqrt(radius * radius - (radius - row - 0.5) ** 2))
    for (let col = -half; col < half; col += 1) {
      const r = `M${cx + col * cell} ${cy + row * cell}h${cell - 1}v${cell - 4}h-${cell - 1}z`
      if (row % 2 === 0) bright += r
      else dim += r
    }
  }
  // The bell's lower fringe.
  for (let col = -radius; col < radius; col += 2) dim += `M${cx + col * cell} ${cy + radius * cell}h${cell - 1}v4h-${cell - 1}z`
  let tentacles = ''
  for (let k = 0; k < 5; k += 1) {
    const x0 = cx - 46 + k * 23
    let d = ''
    for (let s = 0; s < 14; s += 1) {
      const wobble = Math.round(Math.sin((s + k * 2) * 0.7) * 6)
      d += square(x0 + wobble, cy + radius * cell + 8 + s * 10, s < 9 ? 4 : 3)
    }
    tentacles += `<path class="tentacle" style="animation-delay:-${k * 0.9}s" d="${d}" fill="${TEAL}" fill-opacity="${0.55 - k * 0.04}"/>`
  }
  const beam = `<path d="M343 ${90 - 20}L${cx - 70} ${cy + 40}L${cx + 70} ${cy + 40}Z" fill="url(#beam)"/>`
  const body = `<g class="pulse"><path d="${bright}" fill="${MINT}" fill-opacity="0.5"/><path d="${dim}" fill="${TEAL}" fill-opacity="0.3"/></g>${tentacles}`
  return `${beam}<g class="holo"><ellipse class="glow" cx="${cx}" cy="${cy + 60}" rx="200" ry="200" fill="url(#hologlow)"/>${body}` +
    `<g class="glitch" clip-path="url(#slice)">${body}</g></g>`
}

/** A drone that crosses high up now and then, its two lights blinking. */
function drone(): string {
  return `<g class="drone"><path d="M0 0h22v4h-22zM-6 -3h10v2h-10zM18 -3h10v2h-10z" fill="#1d4a40"/><path class="beacon" d="${square(4, 5, 3)}" fill="${PHOSPHOR}"/><path class="beacon" style="animation-delay:-1.6s" d="${square(15, 5, 3)}" fill="#ff8a8a"/></g>`
}

/** Data motes: green specks drifting where the light is, three clocks. */
function motes(cx: number, cy: number, rx: number, ry: number, count: number, seed: number): string {
  const parts = ['', '', '']
  for (let i = 0; i < count; i += 1) {
    const a = hash(seed, i) * Math.PI * 2
    const reach = Math.sqrt(hash(seed + 1, i))
    const x = Math.round(cx + Math.cos(a) * rx * reach)
    const y = Math.round(cy + Math.sin(a) * ry * reach)
    parts[i % 3] = (parts[i % 3] ?? '') + square(x, y, hash(seed + 2, i) < 0.3 ? 3 : 2)
  }
  return `<g class="drift" style="animation-delay:-${seed % 20}s">${parts.map((d, i) => `<path class="star" style="animation-duration:${6 + i * 2}s;animation-delay:-${i * 2}s" d="${d}" fill="${PHOSPHOR}"/>`).join('')}</g>`
}

/** The wet street: a kerb line, smeared reflections of the sign and the machine, and rings that open in the puddles. */
function street(): string {
  let rings = ''
  const spots = [[520, 930], [760, 905], [1090, 960], [1300, 915], [230, 950], [1450, 975]]
  spots.forEach(([x, y], i) => {
    rings += `<ellipse class="ring" style="animation-delay:-${(i * 1.7).toFixed(1)}s;transform-origin:${x}px ${y}px" cx="${x}" cy="${y}" rx="22" ry="5" fill="none" stroke="${MINT}" stroke-opacity="0.5" stroke-width="1.2"/>`
  })
  const smear = (x: number, w: number, colour: string, delay: number) => {
    let d = ''
    for (let k = 0; k < 9; k += 1) d += `M${x + Math.round((hash(x, k) - 0.5) * 10)} ${STREET + 8 + k * 14}h${w - k * 3}v6h-${w - k * 3}z`
    return `<path class="shimmer" style="animation-delay:-${delay}s" d="${d}" fill="${colour}" fill-opacity="0.16"/>`
  }
  return `<rect y="${STREET}" width="${WIDTH}" height="${HEIGHT - STREET}" fill="url(#wet)"/><path d="M0 ${STREET}h${WIDTH}v3h-${WIDTH}z" fill="#1f4a40"/>` +
    smear(424, 80, MINT, 0) + smear(416, 70, AMBER, 1.5) + smear(1414, 22, PHOSPHOR, 3) + rings
}

/** Fine rain, drawn twice over so sliding it one height loops without a seam. */
function rain(seed: number, count: number, length: number, opacity: number, seconds: number): string {
  let d = ''
  for (let copy = 0; copy < 2; copy += 1) {
    for (let i = 0; i < count; i += 1) {
      d += `M${Math.round(hash(seed, i) * (WIDTH + 200))} ${Math.round(hash(seed + 1, i) * HEIGHT) - copy * HEIGHT}l-${Math.round(length / 4)} ${length}`
    }
  }
  return `<path class="rain" style="animation-duration:${seconds}s" d="${d}" stroke="#a8f5d8" stroke-opacity="${opacity}" stroke-width="1.1" fill="none"/>`
}

export function phosphorAlleySvg(): string {
  const davidX = 1084
  const lucyX = 1202
  const davidRoof = cableY(LOW, davidX + 54)
  const lucyRoof = cableY(LOW, lucyX + 54)

  const style = `
text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.win{opacity:.8;animation:win 16s ease-in-out infinite}
.star{opacity:.6;animation:star 8s ease-in-out infinite}
.glow{animation:glow 10s ease-in-out infinite}
.beacon{animation:beacon 3.4s ease-in-out infinite}
.rain{animation:rain 8s linear infinite}
.hum{animation:hum 14s steps(1) infinite}
.flick{animation:hum 19s steps(1) infinite;animation-delay:-8s}
.steam{animation:steam 3.5s ease-in-out infinite}
.fan{transform-box:fill-box;transform-origin:center;animation:spin 2.4s linear infinite}
.drip{opacity:0;animation:drip 4.2s ease-in infinite}
.breathe{animation:breathe 6s ease-in-out infinite}.breathe2{animation:breathe 6s ease-in-out infinite;animation-delay:-2.3s}
.blink{animation:blink 7s steps(1) infinite}
.tip{animation:tip 5s ease-in-out infinite}
.leg0{animation:leg0 4s steps(1) infinite}.leg1{opacity:0;animation:leg1 4s steps(1) infinite}
.poseA{animation:leg0 2.6s steps(1) infinite}.poseB{opacity:0;animation:leg1 2.6s steps(1) infinite}
.sway{animation:sway 7s ease-in-out infinite}
.pulse{transform-box:fill-box;transform-origin:50% 0;animation:pulse 4.8s ease-in-out infinite}
.tentacle{animation:tentacle 4.8s ease-in-out infinite}
.holo{animation:float 22s ease-in-out infinite alternate}
.glitch{opacity:0;animation:glitch 9s steps(1) infinite}
.drone{transform:translate(-80px,170px);animation:drone 70s linear infinite;animation-delay:-12s}
.drift{animation:drift 40s ease-in-out infinite alternate}
.ring{opacity:0;animation:ring 3.6s ease-out infinite}
.shimmer{animation:shimmer 5s ease-in-out infinite}
@keyframes win{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes star{0%,100%{opacity:.2}50%{opacity:.9}}
@keyframes glow{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes beacon{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes rain{from{transform:translateY(0)}to{transform:translateY(${HEIGHT}px)}}
@keyframes hum{0%{opacity:1}88%{opacity:.4}89%{opacity:1}91%{opacity:.55}92%,100%{opacity:1}}
@keyframes steam{0%{opacity:.15;transform:translateY(4px)}50%{opacity:.8}100%{opacity:.1;transform:translateY(-8px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes drip{0%{opacity:0;transform:translateY(0)}10%{opacity:.9}55%{opacity:.9;transform:translateY(110px)}60%,100%{opacity:0;transform:translateY(120px)}}
@keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes blink{0%,93%{opacity:1}94%,96%{opacity:0}97%,100%{opacity:1}}
@keyframes tip{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes leg0{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes leg1{0%,49%{opacity:0}50%,100%{opacity:1}}
@keyframes sway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
@keyframes pulse{0%,100%{transform:scale(1,1)}40%{transform:scale(1.08,.86)}}
@keyframes tentacle{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
@keyframes float{from{transform:translateY(-10px)}to{transform:translateY(14px)}}
@keyframes glitch{0%{opacity:0;transform:translateX(0)}86%{opacity:.9;transform:translateX(14px)}88%{opacity:.7;transform:translateX(-9px)}90%,100%{opacity:0;transform:translateX(0)}}
@keyframes drone{0%{transform:translate(-80px,170px)}50%,100%{transform:translate(${WIDTH + 80}px,140px)}}
@keyframes drift{from{transform:translate(0,0)}to{transform:translate(18px,-22px)}}
@keyframes ring{0%{opacity:.8;transform:scale(.2)}100%{opacity:0;transform:scale(1.6)}}
@keyframes shimmer{0%,100%{opacity:.7;transform:translateX(0)}50%{opacity:1;transform:translateX(3px)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  const defs = `
<radialGradient id="sky" gradientUnits="userSpaceOnUse" cx="820" cy="380" r="1100"><stop offset="0" stop-color="#103128"/><stop offset="0.35" stop-color="#0a221c"/><stop offset="0.7" stop-color="#061612"/><stop offset="1" stop-color="#030b09"/></radialGradient>
<linearGradient id="wet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1f1a"/><stop offset="1" stop-color="#040d0b"/></linearGradient>
<radialGradient id="smog" cx="0.5" cy="1" r="0.8"><stop offset="0" stop-color="${MINT}" stop-opacity="0.1"/><stop offset="0.6" stop-color="${TEAL}" stop-opacity="0.03"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
<radialGradient id="signglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${MINT}" stop-opacity="0.26"/><stop offset="1" stop-color="${MINT}" stop-opacity="0"/></radialGradient>
<radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${MINT}" stop-opacity="0.3"/><stop offset="1" stop-color="${MINT}" stop-opacity="0"/></radialGradient>
<radialGradient id="umbrellaglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${TEAL}" stop-opacity="0.28"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
<radialGradient id="hologlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${TEAL}" stop-opacity="0.16"/><stop offset="0.5" stop-color="${TEAL}" stop-opacity="0.05"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" gradientUnits="userSpaceOnUse" x1="343" y1="70" x2="600" y2="300"><stop offset="0" stop-color="${TEAL}" stop-opacity="0.18"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0.02"/></linearGradient>
<clipPath id="slice"><rect x="0" y="300" width="${WIDTH}" height="22"/><rect x="0" y="352" width="${WIDTH}" height="10"/></clipPath>
${grain()}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}${EXTRA_STYLE}</style><defs>${defs}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
<ellipse cx="900" cy="${STREET}" rx="1000" ry="460" fill="url(#smog)"/>
${motes(800, 160, 700, 120, 40, 11)}
${farCity()}
${megatower(800, STREET, 170, '#0a1d18', MINT, MINT, 'searchA')}
${jellyfish(600, 250)}
${drone()}
${flyingCar(130, true, 28, 6, MINT, AMBER)}
${flyingCar(185, false, 36, 18, '#e8f7ff', AMBER)}
${rain(401, 55, 12, 0.1, 12)}
${block()}
${codeScreen(62, 566, 62, 34, PHOSPHOR, 'crt')}
${acUnits()}
${glyphSign(250, 150, 7, AMBER, 7)}
${shopSign()}
${pole()}
<path d="${cablePath(HIGH)}" stroke="#163a32" stroke-width="2" fill="none"/>
${pigeons()}
${sneakers()}
<path d="${cablePath(LOW)}" stroke="#1d4a40" stroke-width="2.5" fill="none"/>
${umbrella(lucyX - 5, lucyRoof - 93, lucyRoof - 26)}
${mascot(JACKET, davidX, davidRoof, 0, 'c')}
${mascot(BOB, lucyX, lucyRoof, 2.3, 'PC')}
${motes(1197, 420, 140, 100, 22, 23)}
${street()}
${vending()}
${motes(470, 800, 120, 60, 18, 37)}
${rain(501, 65, 18, 0.15, 7)}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>
</svg>`
}
