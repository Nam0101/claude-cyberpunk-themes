# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-14

### Added

- Seven themes, each an animated pixel scene plus a matching app palette:
  Neon Rooftop (purple), Phosphor Alley (green), Deep Net (blue), Ripperdoc (green), Badlands (orange),
  Blackwall (black, dark mode) and Corpo Plaza (white, light mode).
- `/neon` command to list themes, switch between them, or turn the theme off. The choice is remembered across sessions.
- Characters placed in the space between the conversation and an open side panel.
- `scripts/audit.mjs`: contrast, reduced-motion, flash-rate, SVG-safety and code-capability checks, run in CI.
- `scripts/build-assets.mjs`: renders the README's launch film and theme previews from the plugin's own scenes.
- A landing page on GitHub Pages (`docs/`): a live theme picker, the gallery, install steps and an FAQ, with search and social metadata.

[1.0.0]: https://github.com/nocashflow/claude-cyberpunk-themes/releases/tag/v1.0.0
