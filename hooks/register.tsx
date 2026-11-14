import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { phosphorAlleySvg } from './alley'
import { badlandsSvg } from './badlands'
import { blackwallSvg } from './blackwall'
import { corpoPlazaSvg } from './corpo'
import { deepNetSvg } from './deepnet'
import { makeColors } from './make-colors.js'
import { PALETTES } from './palettes'
import { ripperdocSvg } from './ripperdoc'
import { neonRooftopSvg } from './scene'

const PLUGIN = 'cyberpunk-themes'
const COMMAND = 'neon'
const STORE_KEY = 'scene'

type Look = { id: string; title: string; blurb: string; theme: ThemeSetArgs; problems: string[]; svg: () => string; alt: string }

const rooftopColors = makeColors(PALETTES.rooftop!)
const alleyColors = makeColors(PALETTES.alley!)
const netColors = makeColors(PALETTES.net!)
const clinicColors = makeColors(PALETTES.clinic!)
const badlandsColors = makeColors(PALETTES.badlands!)
const blackwallColors = makeColors(PALETTES.blackwall!)
const corpoColors = makeColors(PALETTES.corpo!)

function look(id: string, title: string, blurb: string, colors: ReturnType<typeof makeColors>, scene: string, tint: string, opacity: number, mode: 'dark' | 'light', svg: () => string, alt: string): Look {
  return {
    id,
    title,
    blurb,
    theme: { colors: colors.theme, backdrop: { scene, glass: { blur: 10, tint, opacity } }, overrideColorScheme: mode },
    problems: colors.problems,
    svg,
    alt,
  }
}

const LOOKS: readonly Look[] = [
  look('rooftop', 'Neon Rooftop', 'Purple: a pixel city in soft neon; two mascots watch the moon from a rooftop.', rooftopColors, 'neon-rooftop', '#110d24', 0.46, 'dark', neonRooftopSvg,
    'A pixel city at night: two small mascots sit on a rooftop watching a big moon'),
  look('alley', 'Phosphor Alley', 'Green: a rainy back street; the mascots share an LED umbrella on a power line.', alleyColors, 'phosphor-alley', '#08180f', 0.48, 'dark', phosphorAlleySvg,
    'A rainy green alley at night: two small mascots under an umbrella on a power line, a hologram jellyfish above'),
  look('net', 'Deep Net', 'Blue: inside cyberspace; a netrunner breaches a wall of ICE.', netColors, 'deep-net', '#08102a', 0.46, 'dark', deepNetSvg,
    'Blue cyberspace: a wireframe grid, a hexagon wall with a glowing breach, a netrunner on a floating platform'),
  look('clinic', 'Ripperdoc', 'Green: a back-alley cyberware clinic; a doc fits a chrome arm.', clinicColors, 'ripperdoc', '#081613', 0.48, 'dark', ripperdocSvg,
    'A green cyberware clinic: a heart monitor, spare chrome parts, jars of eyes, a doc working on a patient under a lamp'),
  look('badlands', 'Badlands', 'Orange: the desert at dusk; nomads by a car under a striped sun.', badlandsColors, 'badlands', '#160c07', 0.46, 'dark', badlandsSvg,
    'An orange desert at dusk: a striped sun behind mesas, a motel sign, two mascots by a nomad car'),
  look('blackwall', 'Blackwall', 'Black: the edge of the Net; red eyes in the cracks.', blackwallColors, 'blackwall', '#08080a', 0.52, 'dark', blackwallSvg,
    'A black wall of code with red cracks and eyes, a red mask, a hooded runner and a drone'),
  look('corpo', 'Corpo Plaza', 'White, for light mode: a pristine plaza under a red hologram.', corpoColors, 'corpo-plaza', '#f6f5f9', 0.6, 'light', corpoPlazaSvg,
    'A white corporate plaza: glass towers, a red hologram emblem, a cherry tree, a corpo in a suit and a security bot'),
]

/** Each scene's SVG, built the first time a window asks for it. */
const built = new Map<string, string>()

function lookOf(word: string): Look | undefined {
  return LOOKS.find(one => one.id === word || one.title.toLowerCase() === word || one.theme.backdrop?.scene === word)
}

async function apply($: EngineInterface, chosen: Look): Promise<string | undefined> {
  const unpainted = chosen.problems.find(line => line.startsWith("Desktop won't paint"))
  if (unpainted !== undefined) $.ui.toast(unpainted)
  const set = await $.theme.set(chosen.theme)
  return set.isDrawn ? undefined : set.reason
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: 'Switch the cyberpunk theme: /neon to list them, /neon <name>, /neon off' })
    const kept = await $.store.get(STORE_KEY)
    const chosen = kept === 'off' ? undefined : (lookOf(String(kept ?? '')) ?? LOOKS[0])

    if (chosen !== undefined) {
      const reason = await apply($, chosen)
      if (reason !== undefined) $.ui.status(reason)
    }

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const word = e.args.trim().toLowerCase()

    if (word === 'off') {
      await $.store.set(STORE_KEY, 'off')
      await $.theme.clear()
      return { text: "Theme off. /neon <name> turns one back on." }
    }

    const chosen = lookOf(word)

    if (chosen === undefined) {
      const list = LOOKS.map(one => `  /neon ${one.id.padEnd(9)} ${one.title}: ${one.blurb}`).join('\n')
      return { text: `${word === '' ? 'Themes:' : `No theme named "${word}". Themes:`}\n${list}\n  /neon off       back to the app's own look` }
    }

    await $.store.set(STORE_KEY, chosen.id)
    const reason = await apply($, chosen)
    return { text: reason === undefined ? `${chosen.title} on.` : `${chosen.title} saved, but this window can't show it: ${reason}` }
  }).catch(($, e, next) => (next.called ? next(e) : { text: "The theme couldn't be switched. Try /reload-plugins, then /neon again." }))

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== PLUGIN || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const chosen = typeof e.props.scene === 'string' ? lookOf(e.props.scene) : undefined

    if (chosen === undefined) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    let svg = built.get(chosen.id)

    if (svg === undefined) {
      svg = chosen.svg()
      built.set(chosen.id, svg)
    }

    return <Svg isInteractive source={svg} alt={chosen.alt} />
  })
}
