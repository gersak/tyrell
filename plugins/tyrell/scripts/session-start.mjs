#!/usr/bin/env node
/**
 * SessionStart (also after /clear and compaction): when the project uses
 * Tyrell, put the rules card for its version into context, and say when a
 * newer release exists. Never blocks a session.
 */
import { join } from 'node:path'
import { detect, distTags, getCard, newerTags, pruneSessions, readInput, readText, saveSession } from './common.mjs'

const LIMIT = 9800 // additionalContext is capped at 10,000 characters

try {
  const input = await readInput()
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
  const found = detect(root)
  if (found) {
    saveSession(input.session_id, { root, version: found.version, lastCheck: Date.now() })
    pruneSessions()

    // A project that already imports the card into CLAUDE.md doesn't need a second copy.
    const imported = ['CLAUDE.md', '.claude/CLAUDE.md', 'CLAUDE.local.md']
      .some((f) => /tyrell-(components|react)\/AGENTS\.md/.test(readText(join(root, f)) || ''))
    const tags = await distTags()
    const card = imported ? null : await getCard(found, tags)

    const newer = found.version === 'latest' ? null : newerTags(found.version, tags)
    const lines = [`This project uses Tyrell ${found.version} (${found.via}).` +
      (newer ? ` Newer releases are out (${newer}): if a component this version lacks would fit, tell the user instead of hand-rolling it, and don't upgrade without asking.` : '')]
    if (card) {
      lines.push(`Its rules card follows; use it for all UI work here. Project instructions may narrow it (parts that deliberately don't use Tyrell).`)
      if (!card.exact) lines.push(`${found.version} ships no card of its own; this one is from ${card.from}. Where they differ, that version's guides and CHANGELOG win.`)
      lines.push('', card.text)
    } else if (!imported) {
      lines.push(`Its rules card couldn't be loaded. Use the Tyrell component for every control (never hand-rolled buttons, pills, selects, modals) and colors from Tyrell classes only. Docs: https://gersak.github.io/tyrell/llms.txt`)
    } else if (!newer) {
      lines.length = 0 // CLAUDE.md already carries the card and there's no news
    }

    let context = lines.join('\n')
    if (context.length > LIMIT) {
      const cut = context.lastIndexOf('\n## ', LIMIT - 120)
      context = `${context.slice(0, cut)}\n\n(Card cut to fit. Full card: ${card.from}.)`
    }
    if (context) {
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }))
    }
  }
} catch {
  // Detection or network trouble must never get in the way of a session.
}
process.exit(0)
