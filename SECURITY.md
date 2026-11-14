# Security policy

## What this plugin can do

It only changes how the Claude Code desktop app looks. Claude Code's validator (`claude plugin validate .`) lists every capability the hooks module uses:

| Capability | Why |
| --- | --- |
| `$.command.register` | Adds the `/neon` command. |
| `$.store.get` / `$.store.set` | Remembers the name of the theme you picked. |
| `$.theme.set` / `$.theme.clear` | Applies the palette and scene, or removes them. |
| `$.ui.status` / `$.ui.toast` | Says when a window can't show the theme. |
| `$.ui.resolve` | Draws the backdrop. |

It has no network, file, process, model or tool access. It doesn't hook tool calls, prompts or permissions, and it has no dependencies or install scripts. Scenes are plain SVG with CSS animation, and `scripts/audit.mjs` fails CI if a script, link, external resource or event handler ever appears in one.

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |

## Reporting a vulnerability

Please don't open a public issue for a security problem. Use GitHub's private vulnerability reporting: the **Security** tab of this repository, then **Report a vulnerability**.

You can expect a first reply within a week. Fixed issues are credited in the changelog unless you'd rather stay anonymous.
