#!/usr/bin/env node
/**
 * tyrell-components CLI.
 *
 *   npx tyrell-components agents          write or refresh the Tyrell rules block
 *   npx tyrell-components agents --check  exit 1 when the block is missing or stale (CI)
 *
 * The block goes into the project's AGENTS.md, which Codex, Cursor, Copilot and
 * most other agents read; CLAUDE.md gets `@AGENTS.md` so Claude Code reads it
 * too. It holds the rules card of the installed version between markers, so a
 * re-run after an upgrade replaces only that block.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [cmd, ...flags] = process.argv.slice(2)
if (cmd !== 'agents') {
  console.log('Usage: npx tyrell-components agents [--check]')
  process.exit(cmd && cmd !== '--help' ? 1 : 0)
}
const check = flags.includes('--check')

const read = (url) => { try { return readFileSync(url, 'utf8') } catch { return null } }
const { version } = JSON.parse(read(new URL('../package.json', import.meta.url)))
// The published package ships AGENTS.md; in Tyrell's own repo, use the source card.
const card = read(new URL('../AGENTS.md', import.meta.url)) ??
  read(new URL('../../../guides/AGENT_INSTRUCTIONS.md', import.meta.url))
    ?.replace(/<!--(?!\/?tyrell-version)[\s\S]*?-->\n*/g, '')
    .replace(/<!--tyrell-version-->[\s\S]*?<!--\/tyrell-version-->/, version)
if (!card) {
  console.error('tyrell-components: rules card not found in this package')
  process.exit(1)
}

const BEGIN = '<!-- BEGIN:tyrell-agent-rules -->'
const END = '<!-- END:tyrell-agent-rules -->'
const block = [
  BEGIN,
  `<!-- Managed by \`npx tyrell-components agents\` (tyrell-components ${version}). Re-run it after upgrading Tyrell; edits inside this block are overwritten. -->`,
  '',
  card.trim(),
  END,
].join('\n')

const upsert = (text) => {
  const i = text.indexOf(BEGIN)
  const j = text.indexOf(END)
  if (i >= 0 && j > i) return text.slice(0, i) + block + text.slice(j + END.length)
  return (text.trimEnd() ? `${text.trimEnd()}\n\n` : '') + `${block}\n`
}

const root = process.cwd()
const agentsPath = join(root, 'AGENTS.md')
const claudePath = join(root, 'CLAUDE.md')
const agentsBefore = read(agentsPath) ?? ''
const agentsAfter = upsert(agentsBefore)
const claudeBefore = read(claudePath)
// Claude Code skips AGENTS.md once a CLAUDE.md exists, unless CLAUDE.md imports it.
const claudeAfter = claudeBefore === null ? '@AGENTS.md\n'
  : /^@AGENTS\.md\s*$/m.test(claudeBefore) ? claudeBefore
  : `@AGENTS.md\n\n${claudeBefore}`

if (check) {
  const stale = [agentsBefore !== agentsAfter && 'AGENTS.md', claudeBefore !== claudeAfter && 'CLAUDE.md'].filter(Boolean)
  if (stale.length) {
    console.error(`Tyrell rules block missing or not for ${version} in ${stale.join(', ')}: run npx tyrell-components agents`)
    process.exit(1)
  }
  console.log(`Tyrell rules block is current (${version})`)
  process.exit(0)
}

writeFileSync(agentsPath, agentsAfter)
if (claudeAfter !== claudeBefore) writeFileSync(claudePath, claudeAfter)
console.log(`AGENTS.md: Tyrell ${version} rules ${agentsBefore.includes(BEGIN) ? 'refreshed' : 'added'}`)
if (claudeAfter !== claudeBefore) console.log(`CLAUDE.md: ${claudeBefore === null ? 'created' : 'now imports'} @AGENTS.md`)
console.log('Re-run after upgrading Tyrell (or add `npx tyrell-components agents --check` to CI).')
