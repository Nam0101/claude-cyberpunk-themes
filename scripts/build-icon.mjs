// Writes .claude-plugin/icon.png: a 512 by 512 pixel-art mascot in a visor, drawn from a 16 by 16 map.
// Pure Node (zlib for the PNG's compressed data); no image libraries.
//   node scripts/build-icon.mjs

import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const MAP = `
................
................
...hhhhhhhhhh...
..hhhhhhhhhhhh..
..BBBBBBBBBBBB..
..BBccccccccBB..
..BBcCccccCcBB..
..BBBBBBBBBBBB..
..BBBBBBBBBBBB..
YYYBBBBBBBBBBYYY
..YYBBBBBBBBYY..
..YYYYYYYYYYYY..
...LL.LL.LL.LL..
...LL.LL.LL.LL..
................
mmmmmmmmmmmmmmmm
`
const PAINT = {
  '.': [15, 12, 32], h: [36, 52, 58], B: [217, 119, 87], c: [116, 212, 230], C: [236, 248, 255],
  Y: [239, 201, 76], L: [85, 72, 138], m: [228, 137, 207],
}
const SIZE = 512
const CELL = SIZE / 16

const rows = MAP.split('\n').filter(line => line.length > 0)
const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE)
for (let y = 0; y < SIZE; y += 1) {
  raw[y * (SIZE * 4 + 1)] = 0
  for (let x = 0; x < SIZE; x += 1) {
    const kind = rows[Math.floor(y / CELL)]?.[Math.floor(x / CELL)] ?? '.'
    // A one-pixel gap around each tile, like the scenes' mosaics, except on the background.
    const edge = kind !== '.' && (x % CELL === CELL - 1 || y % CELL === CELL - 1)
    const [r, g, b] = edge ? PAINT['.'] : PAINT[kind]
    const at = y * (SIZE * 4 + 1) + 1 + x * 4
    raw[at] = r
    raw[at + 1] = g
    raw[at + 2] = b
    raw[at + 3] = 255
  }
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = buffer => {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

const header = Buffer.alloc(13)
header.writeUInt32BE(SIZE, 0)
header.writeUInt32BE(SIZE, 4)
header[8] = 8
header[9] = 6
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', header),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])
writeFileSync(new URL('../.claude-plugin/icon.png', import.meta.url), png)
console.log(`icon.png ${SIZE}x${SIZE}, ${(png.length / 1024).toFixed(1)} KB`)
