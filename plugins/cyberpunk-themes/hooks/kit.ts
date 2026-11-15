// My little pixel toolkit. Every scene after the first two is built with this.
// The main idea: characters and objects are drawn as text maps, where each letter is one coloured square.
// figure() takes a map like that and turns it into a character that breathes, blinks and swings its legs.
// There's also rain, twinkling specks, film grain and the SVG wrapper every scene shares.
// It's all just string building, nothing here touches anything outside the plugin.

export const WIDTH = 1600
export const HEIGHT = 1000

/** Where the characters stand. I always have the side panel open, so they live in the gap between the chat and the panel. */
export const PAIR_LEFT = 1084
export const PAIR_RIGHT = 1202

export type Cell = { x: number; y: number; kind: string }
export type Paint = Record<string, string>

/** A repeatable number in 0..1 from two integers. */
export function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export function square(x: number, y: number, size: number): string {
  return `M${x} ${y}h${size}v${size}h-${size}z`
}

export function rect(x: number, y: number, w: number, h: number): string {
  return `M${x} ${y}h${w}v${h}h-${w}z`
}

/** Cells from a text map: one letter a tile, '.' empty, a lone ',' an empty row. */
export function cellsOf(map: string): Cell[] {
  const cells: Cell[] = []
  map.split('\n').filter(line => line.length > 0).forEach((line, y) => {
    if (line === ',') return
    for (let x = 0; x < line.length; x += 1) {
      const kind = line[x] ?? '.'
      if (kind !== '.') cells.push({ x, y, kind })
    }
  })
  return cells
}

export function rowsOf(map: string): number {
  return map.split('\n').filter(line => line.length > 0).length
}

/** Tiles of a map, one path per letter. `gap` leaves a hairline between tiles so a mosaic reads as tiles. */
export function sprite(map: string, left: number, top: number, cell: number, paint: Paint, gap = 0, only?: (kind: string) => boolean): string {
  const byKind = new Map<string, string>()
  for (const c of cellsOf(map)) {
    if (only !== undefined && !only(c.kind)) continue
    byKind.set(c.kind, (byKind.get(c.kind) ?? '') + square(left + c.x * cell, top + c.y * cell, cell - gap))
  }
  let out = ''
  for (const [kind, d] of byKind) {
    const colour = paint[kind]
    if (colour !== undefined) out += `<path d="${d}" fill="${colour}"/>`
  }
  return out
}

/**
 * A character standing or sitting with its body's foot on `ground`: legs in two poses that swap, a body that breathes,
 * eyes (kind 'E') that blink back to `skin`, and kinds in `glow` that pulse on their own clock.
 */
export function figure(body: string, legs: readonly string[], left: number, ground: number, paint: Paint, options: { cell?: number; delay?: number; glow?: string; skin?: string } = {}): string {
  const cell = options.cell ?? 9
  const delay = options.delay ?? 0
  const glow = options.glow ?? ''
  const skin = options.skin ?? 'B'
  const top = ground - rowsOf(body) * cell
  const withoutEyes = body.replace(/E/g, skin)
  const base = sprite(withoutEyes, left, top, cell, paint, 1, kind => !glow.includes(kind))
  const lit = glow === '' ? '' : `<g class="tip" style="animation-delay:-${delay}s">${sprite(body, left, top, cell, paint, 1, kind => glow.includes(kind))}</g>`
  const eyes = `<g class="blink" style="animation-delay:-${(delay * 3).toFixed(1)}s">${sprite(body, left, top, cell, paint, 1, kind => kind === 'E')}</g>`
  const legGroups = legs.map((map, i) => `<g class="leg${i}" style="animation-delay:-${delay}s">${sprite(map, left, ground, cell, paint, 1)}</g>`).join('')
  return `${legGroups}<g class="breathe" style="animation-delay:-${delay}s">${base}${lit}${eyes}</g>`
}

/** Slanted rain in a band drawn twice, so sliding it one height loops without a seam. */
export function rain(seed: number, count: number, length: number, colour: string, opacity: number, seconds: number, slant = 4): string {
  let d = ''
  for (let copy = 0; copy < 2; copy += 1) {
    for (let i = 0; i < count; i += 1) {
      d += `M${Math.round(hash(seed, i) * (WIDTH + 200))} ${Math.round(hash(seed + 1, i) * HEIGHT) - copy * HEIGHT}l-${Math.round(length / slant)} ${length}`
    }
  }
  return `<path class="rain" style="animation-duration:${seconds}s" d="${d}" stroke="${colour}" stroke-opacity="${opacity}" stroke-width="1.1" fill="none"/>`
}

/** Specks scattered in an ellipse, twinkling on three clocks. */
export function specks(cx: number, cy: number, rx: number, ry: number, count: number, seed: number, colour: string): string {
  const parts = ['', '', '']
  for (let i = 0; i < count; i += 1) {
    const a = hash(seed, i) * Math.PI * 2
    const reach = Math.sqrt(hash(seed + 1, i))
    const x = Math.round(cx + Math.cos(a) * rx * reach)
    const y = Math.round(cy + Math.sin(a) * ry * reach)
    parts[i % 3] = (parts[i % 3] ?? '') + square(x, y, hash(seed + 2, i) < 0.25 ? 3 : 2)
  }
  return parts.map((d, i) => `<path class="star" style="animation-duration:${6 + i * 2.5}s;animation-delay:-${i * 2}s" d="${d}" fill="${colour}"/>`).join('')
}

/** A tiny bit of noise on top, so the dark gradients don't show ugly bands. */
export function grain(light: string, lightOpacity = 0.025, darkOpacity = 0.1): string {
  let a = ''
  let b = ''
  for (let i = 0; i < 150; i += 1) {
    const s = square(Math.floor(hash(11, i) * 48) * 2, Math.floor(hash(12, i) * 48) * 2, 2)
    if (i % 2 === 0) a += s
    else b += s
  }
  return `<pattern id="grain" width="96" height="96" patternUnits="userSpaceOnUse"><path d="${a}" fill="${light}" fill-opacity="${lightOpacity}"/><path d="${b}" fill="#000" fill-opacity="${darkOpacity}"/></pattern>`
}

/** Shared animation classes (breathing, blinking, rain and so on). Each scene adds its own on top of these. */
export const KIT_STYLE = `
text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:700}
.breathe{animation:breathe 6s ease-in-out infinite}
.blink{animation:blink 7s steps(1) infinite}
.tip{animation:tip 5s ease-in-out infinite}
.leg0{animation:leg0 4s steps(1) infinite}.leg1{opacity:0;animation:leg1 4s steps(1) infinite}
.rain{animation:rain 9s linear infinite}
.star{opacity:.6;animation:star 8s ease-in-out infinite}
.glow{animation:glow 10s ease-in-out infinite}
.beacon{animation:beacon 3.4s ease-in-out infinite}
.hum{animation:hum 13s steps(1) infinite}
@keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes blink{0%,93%{opacity:1}94%,96%{opacity:0}97%,100%{opacity:1}}
@keyframes tip{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes leg0{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes leg1{0%,49%{opacity:0}50%,100%{opacity:1}}
@keyframes rain{from{transform:translateY(0)}to{transform:translateY(${HEIGHT}px)}}
@keyframes star{0%,100%{opacity:.2}50%{opacity:.9}}
@keyframes glow{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes beacon{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes hum{0%{opacity:1}90%{opacity:.45}91%{opacity:1}93%{opacity:.6}94%,100%{opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

/** The SVG root every scene shares. */
export function svgRoot(style: string, defs: string, body: string): string {
  return pixelFrames(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${KIT_STYLE}${style}</style><defs>${defs}</defs>${body}</svg>`)
}

/** Frames per second for things that move, and for things that only fade. */
const MOVE_FPS = 8
const FADE_FPS = 4

/**
 * Turns every smooth animation into pixel-art frames, like an old game: things move 8 times a second and fade 4 times
 * a second, instead of up to 60. A scene behind your chat repaints far less often, so it costs a lot less CPU and
 * battery (my tests: about half to a fifth). It does this by swapping each easing for steps() and snapping start
 * offsets to the same 1/8 s grid, so the scene's elements change together instead of one after another.
 * Animations that already use steps() are left as they are.
 */
export function pixelFrames(svg: string): string {
  const keyframes = new Map<string, { segments: number; moves: boolean }>()
  for (const [, name, body] of svg.matchAll(/@keyframes ([\w-]+)\{((?:[^{}]*\{[^{}]*\})*)\}/g)) {
    const stops = new Set<number>([0, 100])
    for (const [, selectors] of body!.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
      for (const s of selectors!.split(',')) stops.add(s.trim() === 'from' ? 0 : s.trim() === 'to' ? 100 : parseFloat(s))
    }
    keyframes.set(name!, { segments: Math.max(1, stops.size - 1), moves: /transform/.test(body!) })
  }
  const snap = (seconds: number) => Math.round(seconds * MOVE_FPS) / MOVE_FPS
  return svg
    .replace(/animation:([\w-]+) ([\d.]+)s( -?[\d.]+s)? (linear|ease|ease-in|ease-out|ease-in-out)(?=[ ;}"])/g, (_, name: string, duration: string, delay: string | undefined, _easing: string) => {
      const frames = keyframes.get(name)
      const fps = frames?.moves ? MOVE_FPS : FADE_FPS
      const steps = Math.max(1, Math.round((Number(duration) / (frames?.segments ?? 1)) * fps))
      const start = delay === undefined ? '' : ` ${snap(parseFloat(delay))}s`
      return `animation:${name} ${duration}s${start} steps(${steps})`
    })
    .replace(/animation-delay:(-?[\d.]+)s/g, (_, seconds: string) => `animation-delay:${snap(Number(seconds))}s`)
}
