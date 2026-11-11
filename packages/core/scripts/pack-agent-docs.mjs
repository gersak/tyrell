#!/usr/bin/env node
/**
 * Ships the agent docs inside a package, so every installed (or CDN-served)
 * version carries the rules and guides that match it:
 *
 *   AGENTS.md     guides/AGENT_INSTRUCTIONS.md, stamped with the package version
 *   guides/       the whole guides tree
 *   CHANGELOG.md  what changed between versions
 *
 * Runs as `prepack` in packages/core and packages/react (cwd = the package);
 * `--clean` (`postpack`) removes the copies again.
 */
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkAgentDocs } from './check-agent-docs.mjs'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const pkgDir = process.cwd()
const copies = ['AGENTS.md', 'guides', 'CHANGELOG.md'].map((f) => join(pkgDir, f))

if (process.argv.includes('--clean')) {
  for (const path of copies) rmSync(path, { recursive: true, force: true })
  process.exit(0)
}

// A card that contradicts the source must not ship.
const { errors } = checkAgentDocs()
if (errors.length) {
  console.error(`Not packing: guides/AGENT_INSTRUCTIONS.md disagrees with the source:\n  - ${errors.join('\n  - ')}`)
  process.exit(1)
}

const { version } = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
const card = readFileSync(join(repo, 'guides/AGENT_INSTRUCTIONS.md'), 'utf8')
const marker = /<!--tyrell-version-->[\s\S]*?<!--\/tyrell-version-->/
if (!marker.test(card)) {
  throw new Error('guides/AGENT_INSTRUCTIONS.md lost its <!--tyrell-version--> marker')
}

// Maintainer comments stay in the repo; the shipped card is only what agents need.
const shipped = card.replace(/<!--(?!\/?tyrell-version)[\s\S]*?-->\n*/g, '').replace(marker, version)
writeFileSync(join(pkgDir, 'AGENTS.md'), shipped)
cpSync(join(repo, 'guides'), join(pkgDir, 'guides'), { recursive: true })
cpSync(join(repo, 'CHANGELOG.md'), join(pkgDir, 'CHANGELOG.md'))
console.log(`agent docs → ${pkgDir}: AGENTS.md (${version}), guides/, CHANGELOG.md`)
