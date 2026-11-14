// The list of themes the scripts loop over. If you add a theme, add it here too.
import { neonRooftopSvg } from '../hooks/scene.ts'
import { phosphorAlleySvg } from '../hooks/alley.ts'
import { deepNetSvg } from '../hooks/deepnet.ts'
import { ripperdocSvg } from '../hooks/ripperdoc.ts'
import { badlandsSvg } from '../hooks/badlands.ts'
import { blackwallSvg } from '../hooks/blackwall.ts'
import { corpoPlazaSvg } from '../hooks/corpo.ts'

export const SCENES = [
  { id: 'rooftop', title: 'Neon Rooftop', colour: 'Purple', mode: 'dark', build: neonRooftopSvg },
  { id: 'alley', title: 'Phosphor Alley', colour: 'Green', mode: 'dark', build: phosphorAlleySvg },
  { id: 'net', title: 'Deep Net', colour: 'Blue', mode: 'dark', build: deepNetSvg },
  { id: 'clinic', title: 'Ripperdoc', colour: 'Green', mode: 'dark', build: ripperdocSvg },
  { id: 'badlands', title: 'Badlands', colour: 'Orange', mode: 'dark', build: badlandsSvg },
  { id: 'blackwall', title: 'Blackwall', colour: 'Black', mode: 'dark', build: blackwallSvg },
  { id: 'corpo', title: 'Corpo Plaza', colour: 'White', mode: 'light', build: corpoPlazaSvg },
]
