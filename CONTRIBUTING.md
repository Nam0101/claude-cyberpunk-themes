# Contributing

Hey, thanks for wanting to help out! Bug reports, theme ideas and pull requests are all welcome. Even "this colour is hard to read" is useful to me.

## A few ground rules

- **Original art only.** Draw in the spirit of the genre, but please don't copy. No artwork, logos, fonts, names or recognisable characters from games, shows or companies. Inspired by is great; traced from is not.
- **Looks only.** This plugin changes how Claude Code looks and nothing else, and I want to keep it that way. I won't merge anything that adds network, file, process, model or tool access.
- **Pure SVG scenes.** No scripts, links, external resources or embedded images. Everything animates with CSS inside the scene's own `<style>`.
- **Accessible by default.** Hit the contrast targets below, stop all motion under `prefers-reduced-motion`, and never flash faster than three times a second.

## Adding a theme

The easiest way is honestly to open the repo in Claude Code and describe the theme you want. If you'd rather do it by hand, here's the path:

1. **Write the scene.** Add `plugins/cyberpunk-themes/hooks/<name>.ts` with a function that returns the SVG string. The helpers in `plugins/cyberpunk-themes/hooks/kit.ts` (`figure`, `sprite`, `rain`, `specks`, `grain`, `svgRoot`) and the set pieces in `plugins/cyberpunk-themes/hooks/extras.ts` do most of the heavy lifting.
   - Keep the main subject away from the middle, where the chat sits.
   - Put the characters at `PAIR_LEFT` and `PAIR_RIGHT`, so they stay visible next to an open side panel.
   - Keep the scene under 131,072 characters. That's Claude Code's limit, not mine.
2. **Add the palette** to `plugins/cyberpunk-themes/hooks/palettes.ts`:
   - four surfaces, three text tones and five accents;
   - please keep `danger` a red, `success` a green and `warning` an amber, so they still mean something.
3. **Register it** in `plugins/cyberpunk-themes/hooks/register.tsx` and add it to `scripts/scenes.mjs`. If you want it on the website too, add it to `THEMES` in `docs/site.js` and to the picker and gallery in `docs/index.html`.
4. **Run the checks:**

   ```bash
   npm run audit
   ```

   ```bash
   npm run build:assets
   ```

   ```bash
   claude plugin validate plugins/cyberpunk-themes
   ```

5. **Try it for real** in the desktop app before you open a pull request. Check:
   - a short and a long conversation;
   - a long code block;
   - a bigger text size;
   - the side panel open and closed.

   Things that look fine in a preview can feel very different after an hour of actual work.

Contrast targets (the audit checks these for you):

| Text | On | Minimum |
| --- | --- | --- |
| Primary | every surface | 7:1 |
| Secondary, muted | page and panels | 4.5:1 |

## Pull requests

- One change per pull request, please. Tell me what you checked.
- If you touched a scene, commit the regenerated `assets/` and `docs/themes/` too. CI checks they're up to date.
- Add a line to `CHANGELOG.md` under an *Unreleased* heading.

Thanks again!
