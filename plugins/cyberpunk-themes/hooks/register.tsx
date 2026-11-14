// The actual plugin. It does three things:
//   1. when a session starts, applies whichever theme you picked last (Neon Rooftop if you never picked one),
//   2. handles the /neon command for listing and switching themes,
//   3. draws the chosen theme's scene behind the chat.
// That's all it does: it never reads your work, never touches the network, and only remembers the theme name.

import type { Register, ThemeSetArgs } from 'claude-code'

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

function look(id: string, title: string, blurb: string, colors: ReturnType<typeof makeColors>, scene: string, tint: string, opacity: number, svg: () => string, alt: string): Look {
  return {
    id,
    title,
    blurb,
    // No overrideColorScheme: each palette gives one mode only, so the app already draws it as light or dark.
    theme: { colors: colors.theme, backdrop: { scene, glass: { blur: 10, tint, opacity } } },
    problems: colors.problems,
    svg,
    alt,
  }
}

const LOOKS: readonly Look[] = [
  look('rooftop', 'Neon Rooftop', 'Purple: a pixel city in soft neon; two mascots watch the moon from a rooftop.', rooftopColors, 'neon-rooftop', '#110d24', 0.46, neonRooftopSvg,
    'A pixel city at night: two small mascots sit on a rooftop watching a big moon'),
  look('alley', 'Phosphor Alley', 'Green: a rainy back street; the mascots share an LED umbrella on a power line.', alleyColors, 'phosphor-alley', '#08180f', 0.48, phosphorAlleySvg,
    'A rainy green alley at night: two small mascots under an umbrella on a power line, a hologram jellyfish above'),
  look('net', 'Deep Net', 'Blue: inside cyberspace; a netrunner breaches a wall of ICE.', netColors, 'deep-net', '#08102a', 0.46, deepNetSvg,
    'Blue cyberspace: a wireframe grid, a hexagon wall with a glowing breach, a netrunner on a floating platform'),
  look('clinic', 'Ripperdoc', 'Green: a back-alley cyberware clinic; a doc fits a chrome arm.', clinicColors, 'ripperdoc', '#081613', 0.48, ripperdocSvg,
    'A green cyberware clinic: a heart monitor, spare chrome parts, jars of eyes, a doc working on a patient under a lamp'),
  look('badlands', 'Badlands', 'Orange: the desert at dusk; nomads by a car under a striped sun.', badlandsColors, 'badlands', '#160c07', 0.46, badlandsSvg,
    'An orange desert at dusk: a striped sun behind mesas, a motel sign, two mascots by a nomad car'),
  look('blackwall', 'Blackwall', 'Black: the edge of the Net; red eyes in the cracks.', blackwallColors, 'blackwall', '#08080a', 0.52, blackwallSvg,
    'A black wall of code with red cracks and eyes, a red mask, a hooded runner and a drone'),
  look('corpo', 'Corpo Plaza', 'White, for light mode: a pristine plaza under a red hologram.', corpoColors, 'corpo-plaza', '#f6f5f9', 0.6, corpoPlazaSvg,
    'A white corporate plaza: glass towers, a red hologram emblem, a cherry tree, a corpo in a suit and a security bot'),
]

/** Scenes get built once, the first time a window needs them, and reused after that. */
const built = new Map<string, string>()

function lookOf(word: string): Look | undefined {
  return LOOKS.find(one => one.id === word || one.title.toLowerCase() === word || one.theme.backdrop?.scene === word)
}

/** A palette line the desktop app can't paint, if there is one, to show as a notice. */
function unpaintedOf(chosen: Look): string | undefined {
  return chosen.problems.find(line => line.startsWith("Desktop won't paint"))
}

/** What /neon says when this window, or this Claude Code build, won't take a theme at all (the terminal, for one). */
const NO_THEMES_HERE = "This window can't show themes, but your pick is saved for the desktop app's Code tab."

// The theme gets set right inside each hook, on the hook's own `$`, rather than in a shared helper.
// That way the plugin directory's checker can see exactly what's being called.
// Some places refuse a theme outright instead of answering isDrawn: false (the terminal does, for one).
// So each call is wrapped: a window that can't draw the theme just carries on without it.

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: 'Switch the cyberpunk theme: /neon to list them, /neon <name>, /neon off' })
    const kept = await $.store.get(STORE_KEY)
    const chosen = kept === 'off' ? undefined : (lookOf(String(kept ?? '')) ?? LOOKS[0])

    if (chosen !== undefined) {
      const unpainted = unpaintedOf(chosen)
      if (unpainted !== undefined) $.ui.toast(unpainted)
      try {
        const set = await $.theme.set(chosen.theme)
        if (!set.isDrawn) $.ui.status(set.reason)
      } catch {
        // Nothing to draw in this window. The session carries on as normal, and /neon still works.
      }
    }

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const word = (e.args ?? '').trim().toLowerCase()

    if (word === 'off') {
      await $.store.set(STORE_KEY, 'off')
      try {
        await $.theme.clear()
      } catch {
        // A window that never drew the theme has nothing to clear.
      }
      return { text: "Theme off. /neon <name> turns one back on." }
    }

    const chosen = lookOf(word)

    if (chosen === undefined) {
      const list = LOOKS.map(one => `  /neon ${one.id.padEnd(9)} ${one.title}: ${one.blurb}`).join('\n')
      return { text: `${word === '' ? 'Themes:' : `No theme named "${word}". Themes:`}\n${list}\n  /neon off       back to the app's own look` }
    }

    await $.store.set(STORE_KEY, chosen.id)
    const unpainted = unpaintedOf(chosen)
    if (unpainted !== undefined) $.ui.toast(unpainted)
    try {
      const set = await $.theme.set(chosen.theme)
      return { text: set.isDrawn ? `${chosen.title} on.` : `${chosen.title} saved, but this window can't show it: ${set.reason}` }
    } catch {
      return { text: `${chosen.title} picked. ${NO_THEMES_HERE}` }
    }
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
