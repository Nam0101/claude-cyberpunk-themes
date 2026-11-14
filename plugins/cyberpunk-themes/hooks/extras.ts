// The cyberpunk bits I wanted in more than one scene: a megacorp tower with searchlights, flying cars with
// light trails, an ad blimp, vertical signs in a made-up pixel script, a hologram eye billboard and a
// netrunner's code screen. Each function returns a chunk of SVG, and the animations live in EXTRA_STYLE below.

// Its own copies of the two tiny helpers, so the scenes can import this file without an import cycle.
function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function square(x: number, y: number, size: number): string {
  return `M${x} ${y}h${size}v${size}h-${size}z`
}

export const EXTRA_STYLE = `
.sweepA{animation:sweep 16s ease-in-out infinite alternate}.sweepB{animation:sweep 21s ease-in-out infinite alternate-reverse}
.carR{transform:translateX(-300px);animation:carR 30s linear infinite}.carL{transform:translateX(1900px);animation:carL 38s linear infinite}
.blimp{transform:translateX(1800px);animation:blimp 150s linear infinite;animation-delay:-60s}
.marquee{animation:marquee 9s linear infinite}
.glyphs{animation:glyphs 11s steps(1) infinite}
.iris{animation:iris 12s ease-in-out infinite}
.lid{transform-box:fill-box;transform-origin:50% 50%;animation:lid 9s steps(1) infinite}
.holoflick{animation:holoflick 8s steps(1) infinite}
.code{animation:code 7s linear infinite}
.ring2{animation:ring2 6s ease-in-out infinite}
@keyframes sweep{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}
@keyframes carR{0%{transform:translateX(-300px)}45%,100%{transform:translateX(1900px)}}
@keyframes carL{0%{transform:translateX(1900px)}40%,100%{transform:translateX(-300px)}}
@keyframes blimp{from{transform:translateX(1800px)}to{transform:translateX(-400px)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-120px)}}
@keyframes glyphs{0%{opacity:1}70%{opacity:.4}71%{opacity:1}73%{opacity:.6}74%,100%{opacity:1}}
@keyframes iris{0%,18%{transform:translateX(0)}24%,42%{transform:translateX(-14px)}48%,66%{transform:translateX(12px)}72%,100%{transform:translateX(0)}}
@keyframes lid{0%,95%{transform:scaleY(0)}96%,98%{transform:scaleY(1)}99%,100%{transform:scaleY(0)}}
@keyframes holoflick{0%{opacity:.85;transform:translateX(0)}90%{opacity:.85;transform:translateX(0)}91%{opacity:.45;transform:translateX(5px)}92%{opacity:.85;transform:translateX(-3px)}93%,100%{opacity:.85;transform:translateX(0)}}
@keyframes code{from{transform:translateY(0)}to{transform:translateY(-60px)}}
@keyframes ring2{0%,100%{opacity:.35}50%{opacity:.8}}`

/** A glyph of the invented script: a 5 by 5 pixel pattern, mirrored so it reads like a character, from a seed. */
function glyph(x: number, y: number, px: number, seed: number): string {
  let d = ''
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (hash(seed * 7 + r, c * 13 + 3) < 0.45 || (r === 0 && c === 1)) {
        d += square(x + c * px, y + r * px, px)
        if (c < 2) d += square(x + (4 - c) * px, y + r * px, px)
      }
    }
  }
  return d
}

/** A vertical sign in the invented script: dark tiles framed in neon, one glyph each, humming. */
export function glyphSign(x: number, y: number, count: number, colour: string, seed: number): string {
  let tiles = ''
  let marks = ''
  for (let i = 0; i < count; i += 1) {
    tiles += `M${x} ${y + i * 18}h16v16h-16z`
    marks += glyph(x + 3, y + i * 18 + 3, 2, seed + i)
  }
  return `<g class="glyphs"><path d="${tiles}" fill="#0d0a1c" stroke="${colour}" stroke-opacity="0.7" stroke-width="1"/><path d="${marks}" fill="${colour}" fill-opacity="0.9"/></g>`
}

/** The megacorp tower: a stepped silhouette, ring lights up its body, a blinking crown and two searchlights sweeping the sky. */
export function megatower(cx: number, base: number, top: number, body: string, ring: string, beam: string, id: string): string {
  const w = 96
  const shoulder = top + 150
  const neck = top + 60
  const d = `M${cx - w / 2} ${base}V${shoulder}h12V${neck + 40}h16V${neck}h40v${40}h16V${shoulder}h12V${base}Z` + `M${cx - 4} ${neck}V${top}h8V${neck}Z`
  let rings = ''
  for (let y = shoulder + 20; y < base - 10; y += 26) rings += `M${cx - w / 2 + 6} ${y}h${w - 12}v2h-${w - 12}z`
  const beamPath = `M${cx} ${top + 4}L${cx - 40} -600L${cx + 40} -600Z`
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="-200"><stop offset="0" stop-color="${beam}" stop-opacity="0.22"/><stop offset="1" stop-color="${beam}" stop-opacity="0"/></linearGradient></defs>` +
    `<g style="transform-origin:${cx}px ${top + 4}px" class="sweepA"><path d="${beamPath}" fill="url(#${id})"/></g>` +
    `<g style="transform-origin:${cx}px ${top + 4}px" class="sweepB"><path d="${beamPath}" fill="url(#${id})"/></g>` +
    `<path d="${d}" fill="${body}"/><path class="ring2" d="${rings}" fill="${ring}" fill-opacity="0.5"/>` +
    `<path class="beacon" d="${square(cx - 3, top - 6, 6)}" fill="#ff6f91"/>`
}

/** A flying car crossing at height y with a light trail: rightward cars wear headlights on the right, leftward on the left. */
export function flyingCar(y: number, rightward: boolean, seconds: number, delay: number, head: string, tail: string): string {
  const s = 4
  const body = `M0 ${y}h${7 * s}v${s}h-${7 * s}zM${s} ${y - s}h${4 * s}v${s}h-${4 * s}z`
  const front = rightward ? 7 * s : -s
  const back = rightward ? -s : 7 * s
  const trail = rightward ? `M${back - 140} ${y + 1}h140v2h-140z` : `M${back + s} ${y + 1}h140v2h-140z`
  const id = `trail${Math.round(y)}`
  const grad = rightward
    ? `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${tail}" stop-opacity="0"/><stop offset="1" stop-color="${tail}" stop-opacity="0.7"/></linearGradient>`
    : `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${tail}" stop-opacity="0.7"/><stop offset="1" stop-color="${tail}" stop-opacity="0"/></linearGradient>`
  return `<defs>${grad}</defs><g class="${rightward ? 'carR' : 'carL'}" style="animation-duration:${seconds}s;animation-delay:-${delay}s">` +
    `<path d="${trail}" fill="url(#${id})"/><path d="${body}" fill="#221d3c"/><path d="${square(s * 2, y - s + 1, s)}" fill="${head}" fill-opacity="0.5"/>` +
    `<path d="${square(front, y, s)}" fill="${head}"/><path d="${square(back, y, s)}" fill="${tail}"/></g>`
}

/** An ad blimp drifting across the top of the sky: dark hull, fins, an LED band with the script scrolling along it. */
export function blimp(y: number, hull: string, led: string, id: string): string {
  let strip = ''
  for (let i = 0; i < 16; i += 1) strip += glyph(-50 + i * 15, y - 5, 2, 90 + (i % 8))
  return `<defs><clipPath id="${id}"><rect x="-55" y="${y - 8}" width="110" height="16"/></clipPath></defs>` +
    `<g class="blimp"><ellipse cx="0" cy="${y}" rx="95" ry="28" fill="${hull}"/><path d="M80 ${y - 4}l30 -20v48l-30 -20z" fill="${hull}"/><path d="M-30 ${y + 26}h60v8h-60z" fill="${hull}"/>` +
    `<path d="M-55 ${y - 8}h110v16h-110z" fill="#06050e"/><g clip-path="url(#${id})"><g class="marquee"><path d="${strip}" fill="${led}" fill-opacity="0.9"/></g></g>` +
    `<path class="beacon" d="${square(-92, y - 2, 4)}" fill="#ff6f91"/><path d="M-20 ${y + 34}L-60 ${y + 220}L60 ${y + 220}L20 ${y + 34}Z" fill="${led}" fill-opacity="0.04"/></g>`
}

/** A hologram billboard of a watching eye: a bracketed scanline frame, a pixel eye whose iris looks around and blinks, glitching now and then. */
export function holoEye(x: number, y: number, ink: string, iris: string): string {
  const w = 170
  const h = 104
  let scan = ''
  for (let k = 0; k < h; k += 4) scan += `M${x} ${y + k}h${w}v1h-${w}z`
  const corner = (cx: number, cy: number, dx: number, dy: number) => `M${cx} ${cy}h${dx * 16}v2h-${dx * 16}zM${cx} ${cy}v${dy * 16}h2v-${dy * 16}z`
  const brackets = corner(x, y, 1, 1) + corner(x + w - 2, y, -1, 1) + corner(x, y + h - 2, 1, -1) + corner(x + w - 2, y + h - 2, -1, -1)
  // The eye: an almond of cells around the centre.
  const cx = x + w / 2
  const cy = y + h / 2
  let lidCells = ''
  for (let c = -9; c <= 9; c += 1) {
    const half = Math.round(4 * Math.cos((c / 10) * (Math.PI / 2)))
    lidCells += square(cx + c * 6 - 3, cy - half * 6 - 3, 5) + square(cx + c * 6 - 3, cy + half * 6 - 3, 5)
  }
  return `<g class="holoflick"><path d="M${x} ${y}h${w}v${h}h-${w}z" fill="${ink}" fill-opacity="0.07"/><path d="${scan}" fill="${ink}" fill-opacity="0.12"/><path d="${brackets}" fill="${ink}" fill-opacity="0.8"/>` +
    `<path d="${lidCells}" fill="${ink}" fill-opacity="0.75"/>` +
    `<g class="iris"><circle cx="${cx}" cy="${cy}" r="17" fill="none" stroke="${iris}" stroke-width="5" stroke-opacity="0.85" stroke-dasharray="3 2"/><path d="${square(cx - 6, cy - 6, 12)}" fill="#0b0818"/><path d="${square(cx + 1, cy - 5, 4)}" fill="#ffffff" fill-opacity="0.8"/></g>` +
    `<g class="lid"><path d="M${cx - 60} ${cy - 28}h120v56h-120z" fill="#120d26"/><path d="M${cx - 58} ${cy - 1}h116v3h-116z" fill="${ink}" fill-opacity="0.75"/></g>` +
    `<path d="M${x + 8} ${y + h - 12}h50v3h-50zM${x + w - 60} ${y + 8}h50v3h-50z" fill="${iris}" fill-opacity="0.7"/></g>`
}

/** A netrunner's screen in a dark window: lines of code scrolling up, a cursor block. */
export function codeScreen(x: number, y: number, w: number, h: number, ink: string, id: string): string {
  let lines = ''
  for (let k = 0; k < 16; k += 1) {
    const indent = Math.floor(hash(k, 61) * 3) * 4
    const len = 8 + Math.floor(hash(k, 62) * (w - 16 - indent))
    lines += `M${x + 3 + indent} ${y + 4 + k * 5}h${len}v2h-${len}z`
  }
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>` +
    `<path d="M${x - 2} ${y - 2}h${w + 4}v${h + 4}h-${w + 4}z" fill="#0b1f1a"/><path d="M${x} ${y}h${w}v${h}h-${w}z" fill="#041410"/>` +
    `<g clip-path="url(#${id})"><g class="code"><path d="${lines}" fill="${ink}" fill-opacity="0.8"/></g></g>` +
    `<path class="beacon" d="${square(x + w - 7, y + h - 6, 4)}" fill="${ink}"/>`
}
