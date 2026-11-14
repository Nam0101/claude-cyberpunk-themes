// Deep Net: inside cyberspace. A dark-window scene in blues.
// A wireframe grid floor runs to the horizon and keeps flowing toward you; wireframe data towers stand along it.
// At the left a wall of defensive ICE, a lattice of hexagons, has a breach in it that pulses; a stream of packets runs
// from the breach across the void to the right, where a netrunner sits cross-legged on a floating hex platform,
// face circuits glowing, a cable rising from the headset into the sky. A small daemon program hovers beside them.
// A wireframe cube and an octahedron turn slowly overhead.

import { HEIGHT, PAIR_LEFT, PAIR_RIGHT, WIDTH, figure, grain, hash, rect, specks, square, svgRoot } from './kit'

const HORIZON = 640
const CYAN = '#5cc8ff'
const ICE = '#ff5c8a'
const PALE = '#cfe8ff'
const VIOLET = '#9d8cff'

/** The grid floor: lines fanning from a vanishing point, and cross lines that flow toward the viewer. */
function gridFloor(): string {
  const vx = 800
  let fan = ''
  for (let k = -16; k <= 16; k += 1) fan += `M${vx} ${HORIZON}L${vx + k * 130} ${HEIGHT + 20}`
  let cross = ''
  for (let k = 0; k <= 14; k += 1) {
    const y = Math.round(HORIZON + Math.pow(k / 14, 2.2) * (HEIGHT - HORIZON + 60))
    cross += `M0 ${y}H${WIDTH}`
  }
  return `<rect y="${HORIZON}" width="${WIDTH}" height="${HEIGHT - HORIZON}" fill="url(#floor)"/>` +
    `<path d="${fan}" stroke="${CYAN}" stroke-opacity="0.18" fill="none"/>` +
    `<g class="flow"><path d="${cross}" stroke="${CYAN}" stroke-opacity="0.16" fill="none"/></g>` +
    `<rect y="${HORIZON - 1}" width="${WIDTH}" height="2" fill="${CYAN}" fill-opacity="0.45"/>`
}

/** Wireframe data towers on the horizon: outlines with floor lines, a few edges lit by a scan that climbs them. */
function towers(): string {
  let outline = ''
  let floors = ''
  const list: Array<[number, number, number]> = [[60, 70, 260], [150, 50, 170], [420, 60, 200], [520, 40, 120], [640, 80, 300], [760, 50, 160], [900, 70, 230], [1010, 40, 140], [1380, 70, 280], [1470, 50, 190]]
  for (const [x, w, h] of list) {
    outline += `M${x} ${HORIZON}V${HORIZON - h}h${w}V${HORIZON}`
    for (let y = HORIZON - h + 16; y < HORIZON; y += 16) floors += `M${x} ${y}h${w}`
  }
  return `<path d="${outline}" stroke="${CYAN}" stroke-opacity="0.35" fill="#071533" fill-opacity="0.6"/><path d="${floors}" stroke="${CYAN}" stroke-opacity="0.09" fill="none"/>` +
    `<g class="scan"><rect x="0" y="${HORIZON - 4}" width="${WIDTH}" height="3" fill="${PALE}" fill-opacity="0.35"/></g>`
}

/** The ICE wall: a lattice of hexagons with a breach in it. The breach's rim pulses; the wall itself hums. */
function iceWall(): { svg: string; breachX: number; breachY: number } {
  const left = 30
  const top = 250
  const cols = 12
  const rows = 17
  const size = 13
  const breachX = left + 150
  const breachY = top + 190
  let wall = ''
  let rim = ''
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cx = left + c * size * 1.75 + (r % 2) * size * 0.875
      const cy = top + r * size * 1.5
      const d = Math.hypot(cx - breachX, cy - breachY) + hash(c, r) * 18
      if (d < 46) continue
      let hex = ''
      for (let k = 0; k < 6; k += 1) {
        const a = (Math.PI / 3) * k + Math.PI / 6
        hex += `${k === 0 ? 'M' : 'L'}${Math.round(cx + Math.cos(a) * size)} ${Math.round(cy + Math.sin(a) * size)}`
      }
      hex += 'Z'
      if (d < 72) rim += hex
      else wall += hex
    }
  }
  const svg = `<g class="hum"><path d="${wall}" stroke="${ICE}" stroke-opacity="0.38" fill="${ICE}" fill-opacity="0.04"/></g>` +
    `<g class="breach"><path d="${rim}" stroke="${PALE}" stroke-opacity="0.9" fill="${ICE}" fill-opacity="0.18"/></g>` +
    `<circle class="glow" cx="${breachX}" cy="${breachY}" r="90" fill="url(#breachglow)"/>`
  return { svg, breachX, breachY }
}

/** Packets running along a path: a dashed stroke whose offset slides, so bright beads travel it. */
function packetStream(d: string, colour: string, seconds: number, delay: number, width: number): string {
  return `<path d="${d}" stroke="${colour}" stroke-opacity="0.18" stroke-width="${width}" fill="none"/>` +
    `<path class="packet" style="animation-duration:${seconds}s;animation-delay:-${delay}s" d="${d}" pathLength="100" stroke="${colour}" stroke-width="${width + 2}" stroke-dasharray="1.2 7" stroke-linecap="square" fill="none"/>`
}

/** A wireframe cube turning in place: two squares and four struts, rotated as one. */
function cube(cx: number, cy: number, s: number): string {
  const o = s * 0.45
  const d = rect(cx - s / 2, cy - s / 2, s, s) + rect(cx - s / 2 + o, cy - s / 2 - o, s, s) +
    `M${cx - s / 2} ${cy - s / 2}l${o} -${o}M${cx + s / 2} ${cy - s / 2}l${o} -${o}M${cx - s / 2} ${cy + s / 2}l${o} -${o}M${cx + s / 2} ${cy + s / 2}l${o} -${o}`
  return `<g class="spin" style="transform-origin:${cx + o / 2}px ${cy - o / 2}px"><path d="${d}" stroke="${CYAN}" stroke-opacity="0.6" fill="none" stroke-width="1.5"/></g>`
}

function octahedron(cx: number, cy: number, s: number): string {
  const d = `M${cx} ${cy - s}L${cx + s * 0.7} ${cy}L${cx} ${cy + s}L${cx - s * 0.7} ${cy}ZM${cx} ${cy - s}L${cx + s * 0.2} ${cy + s * 0.1}L${cx} ${cy + s}M${cx - s * 0.7} ${cy}L${cx + s * 0.2} ${cy + s * 0.1}L${cx + s * 0.7} ${cy}`
  return `<g class="spin2" style="transform-origin:${cx}px ${cy}px"><path d="${d}" stroke="${VIOLET}" stroke-opacity="0.7" fill="${VIOLET}" fill-opacity="0.06" stroke-width="1.5"/></g>`
}

/** Faint columns of binary ticks far behind everything, drifting down. */
function binaryColumns(): string {
  let d = ''
  for (let c = 0; c < 26; c += 1) {
    const x = Math.round(hash(c, 400) * WIDTH)
    for (let k = 0; k < 18; k += 1) {
      if (hash(c, k) < 0.5) continue
      const y = k * 34 - 600 + Math.round(hash(k, c) * 10)
      d += hash(c * 3, k) < 0.5 ? rect(x, y, 2, 10) : rect(x - 3, y + 2, 8, 6)
    }
  }
  return `<g class="drip"><path d="${d}" fill="${CYAN}" fill-opacity="0.07"/><path transform="translate(0 612)" d="${d}" fill="${CYAN}" fill-opacity="0.07"/></g>`
}

/** The floating hex platform the pair sits on, with a soft glow cone under it. */
function platform(left: number, right: number, y: number): string {
  const w = right - left
  let top = ''
  let rimCells = ''
  for (let x = left; x < right; x += 8) {
    const t = (x - left) / w
    const half = Math.round(Math.sqrt(1 - Math.pow(t * 2 - 1, 2)) * 22)
    top += rect(x, y - half, 7, half * 2)
    rimCells += square(x, y + half - 2, 7) + square(x, y - half, 7)
  }
  return `<ellipse class="glow" cx="${left + w / 2}" cy="${y + 60}" rx="${w * 0.6}" ry="110" fill="url(#cone)"/>` +
    `<path d="${top}" fill="#0b1c44"/><g class="tip"><path d="${rimCells}" fill="${CYAN}" fill-opacity="0.75"/></g>`
}

const RUNNER = `
.kHHHHHHHHk.
.HHHHHHHHHH.
.HBBBBBBBBH.
.HBEBBBBEBH.
.HBEcBBcEBH.
.HBBBBBBBBH.
SSSBBBBBBSSS
.HSSBBBBSSH.
.HSSSSSSSSH.
`
const RUNNER_LEGS = [
  `
.SSSSSSSSSS.
..SS....SS..
`,
  `
.SSSSSSSSSS.
...SS..SS...
`,
]
const RUNNER_PAINT = { H: '#1a1f3a', B: '#d97757', E: '#0b0a16', c: CYAN, k: CYAN, S: '#22305e' }

const DAEMON = `
....d....
...ddd...
..dd.dd..
.dd.e.dd.
..dd.dd..
...ddd...
....d....
`
const DAEMON_PAINT = { d: '#5cc8ff', e: '#ffffff' }

export function deepNetSvg(): string {
  const ground = 560
  const ice = iceWall()
  const runnerTop = ground - 9 * 9
  const headX = PAIR_LEFT + 54
  const stream = `M${ice.breachX + 60} ${ice.breachY}C520 ${ice.breachY + 40} 760 470 ${PAIR_LEFT - 10} ${ground - 30}`
  const cable = `M${headX} ${runnerTop}C${headX - 30} ${runnerTop - 120} ${headX + 40} ${runnerTop - 260} ${headX + 10} -20`

  const style = `
.flow{animation:flow 3s linear infinite}
.scan{animation:scan 9s ease-in-out infinite}
.breach{animation:breach 3.6s ease-in-out infinite}
.packet{animation:packet 6s linear infinite}
.spin{animation:spin 26s linear infinite}.spin2{animation:spin 34s linear infinite reverse}
.drip{animation:drip 40s linear infinite}
.hover{animation:hover 5s ease-in-out infinite}
@keyframes flow{from{transform:translateY(0)}to{transform:translateY(14px)}}
@keyframes scan{0%{transform:translateY(0);opacity:0}10%{opacity:1}80%{opacity:.6}100%{transform:translateY(-300px);opacity:0}}
@keyframes breach{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes packet{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes drip{from{transform:translateY(0)}to{transform:translateY(612px)}}
@keyframes hover{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`

  const defs = `
<radialGradient id="void" gradientUnits="userSpaceOnUse" cx="800" cy="640" r="1000"><stop offset="0" stop-color="#10255a"/><stop offset="0.35" stop-color="#0a1840"/><stop offset="0.7" stop-color="#050d26"/><stop offset="1" stop-color="#020617"/></radialGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1a44"/><stop offset="1" stop-color="#020617"/></linearGradient>
<radialGradient id="breachglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${PALE}" stop-opacity="0.35"/><stop offset="0.4" stop-color="${ICE}" stop-opacity="0.12"/><stop offset="1" stop-color="${ICE}" stop-opacity="0"/></radialGradient>
<radialGradient id="cone" cx="0.5" cy="0.2" r="0.6"><stop offset="0" stop-color="${CYAN}" stop-opacity="0.22"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>
${grain('#9db4ff')}`

  const body = `
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#void)"/>
${binaryColumns()}
${specks(800, 200, 760, 180, 60, 5, PALE)}
${towers()}
${gridFloor()}
${cube(240, 140, 46)}
${octahedron(1300, 170, 34)}
${ice.svg}
${packetStream(stream, CYAN, 7, 0, 2)}
${packetStream(cable, VIOLET, 5, 2, 1.5)}
${platform(PAIR_LEFT - 30, PAIR_RIGHT + 140, ground + 14)}
${figure(RUNNER, RUNNER_LEGS, PAIR_LEFT, ground, RUNNER_PAINT, { glow: 'ck' })}
<g class="hover">${figure(DAEMON, [], PAIR_RIGHT + 20, ground - 40, DAEMON_PAINT, { cell: 8, delay: 1.7, glow: 'e', skin: 'd' })}</g>
${specks(PAIR_LEFT + 100, ground - 120, 160, 80, 20, 9, CYAN)}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>`

  return svgRoot(style, defs, body)
}
