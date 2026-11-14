# Contributing

Thanks for wanting to help. Bug reports, theme ideas and pull requests are all welcome.

## Ground rules

- **Original art only.** Draw in the spirit of the genre, never a copy: no artwork, logos, fonts, names or recognisable characters from games, shows or companies.
- **Looks only.** The plugin changes how Claude Code looks and nothing else. Pull requests that add network, file, process, model or tool access won't be merged.
- **Pure SVG scenes.** No scripts, links, external resources or embedded images. Everything animates with CSS inside the scene's own `<style>`.
- **Accessible by default.** Keep the contrast targets below, stop all motion under `prefers-reduced-motion`, and never flash faster than three times a second.

## Adding a theme

1. **Write the scene.** Add `hooks/<name>.ts` exporting a function that returns the SVG string. Build it with the helpers in `hooks/kit.ts` (`figure`, `sprite`, `rain`, `specks`, `grain`, `svgRoot`) and the set pieces in `hooks/extras.ts`.
   - Keep the subject out of the middle, where the conversation sits.
   - Put the characters at `PAIR_LEFT` and `PAIR_RIGHT`, so they stay visible beside an open side panel.
   - Keep the scene under 131,072 characters.
2. **Add the palette** to `hooks/palettes.ts`:
   - four surfaces, three text tones and five roles;
   - `danger` stays a red, `success` a green and `warning` an amber.
3. **Register the look** in `hooks/register.tsx` and add it to `scripts/scenes.mjs`.
4. **Check it:**

   ```bash
   npm run audit
   ```

   ```bash
   npm run build:assets
   ```

   ```bash
   claude plugin validate .
   ```

5. **Try it live** in the desktop app in both a short and a long conversation, with a long code block, at a larger text size, and with the side panel open and closed.

Contrast targets, checked by the audit:

| Text | On | Minimum |
| --- | --- | --- |
| Primary | every surface | 7:1 |
| Secondary, muted | page and panels | 4.5:1 |

## Pull requests

- Keep each pull request to one change, and say what you checked.
- Commit the regenerated `assets/` with any change to a scene, since CI checks they're up to date.
- Add a line to `CHANGELOG.md` under an *Unreleased* heading.
