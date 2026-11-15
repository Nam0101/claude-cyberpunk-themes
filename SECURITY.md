# Security policy

## What this plugin can actually do

Not much, and that's on purpose. It only changes how the Claude Code desktop app looks. If you run `claude plugin validate plugins/cyberpunk-themes`, Claude Code lists every capability the plugin uses:

| Capability | Why it's there |
| --- | --- |
| `$.command.register` | Adds the `/neon` command. |
| `$.store.get` / `$.store.set` | Remembers which theme you picked, and whether motion is off. That's all it saves. |
| `$.theme.set` / `$.theme.clear` | Applies the palette and scene, or removes them. |
| `$.ui.status` / `$.ui.toast` | Lets you know if a window can't show the theme. |
| `$.ui.resolve` | Draws the background. |

It has no network, file, process, model or tool access. It doesn't hook into tool calls, prompts or permissions, and has no dependencies or install scripts.

The scenes are plain SVG with CSS animation. `scripts/audit.mjs` runs on every push, and fails if a script, link, external resource or event handler ever shows up in one.

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |

## Reporting a vulnerability

If you find something, please don't open a public issue. Report it privately instead: go to the **Security** tab of this repo and click **Report a vulnerability**.

I'll get back to you within a week. Once it's fixed, I'll credit you in the changelog (unless you'd rather stay anonymous).
