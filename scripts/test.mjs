// Runs tests/*.test.tsx against the plugin with `claude plugin test`, which needs the Claude Code CLI.
// The tests live outside plugins/cyberpunk-themes so they're never installed with it, so this copies the plugin
// and the tests into a temporary folder, runs them there, and cleans up.
import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url)
const work = mkdtempSync(join(tmpdir(), 'cyberpunk-themes-test-'))
const plugin = join(work, 'cyberpunk-themes')

try {
  cpSync(new URL('plugins/cyberpunk-themes', root), plugin, {
    recursive: true,
    filter: source => !source.includes(join('.claude-plugin', 'types')),
  })
  for (const file of readdirSync(new URL('tests', root)).filter(name => /\.test\.tsx?$/.test(name))) {
    cpSync(new URL(`tests/${file}`, root), join(plugin, file))
  }
  const run = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'claude', 'plugin', 'test', plugin], { stdio: 'inherit' })
    : spawnSync('claude', ['plugin', 'test', plugin], { stdio: 'inherit' })
  process.exitCode = run.status ?? 1
} finally {
  rmSync(work, { recursive: true, force: true })
}
