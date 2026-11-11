#!/usr/bin/env node
/**
 * Checks the facts in the agent rules card (guides/AGENT_INSTRUCTIONS.md)
 * against the source, so a component change can't silently make the card
 * wrong: size ladders, narrow-screen rungs, the pairings it recommends,
 * DEFAULT_SIZE, FLAVORS, the select's search threshold, and every ty-* /
 * --ty-* name it mentions. Runs before every pack (pack-agent-docs.mjs) and
 * in `npm test`; `node scripts/check-agent-docs.mjs` on its own.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const core = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repo = resolve(core, '../..')
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl']

export function checkAgentDocs() {
  const errors = []
  const read = (p) => readFileSync(join(core, p), 'utf8')
  const card = readFileSync(join(repo, 'guides/AGENT_INSTRUCTIONS.md'), 'utf8')
  const must = (cond, msg) => { if (!cond) errors.push(msg) }
  const grab = (src, re, what) => {
    const m = src.match(re)
    if (!m) throw new Error(`check-agent-docs: can't find ${what} in source (${re})`)
    return m[1]
  }
  const px = (remValue) => Math.round(parseFloat(remValue) * 16)

  // ── source facts ──────────────────────────────────────────────────────────
  const common = read('src/types/common.ts')
  const DEFAULT = grab(common, /export const DEFAULT_SIZE: Size = '(\w+)'/, 'DEFAULT_SIZE')
  const FLAVORS = [...grab(common, /export const FLAVORS = \[([^\]]*)\]/, 'FLAVORS').matchAll(/'([\w-]+)'/g)].map((m) => m[1])

  const css = read('src/css/tyrell.css')
  const field = Object.fromEntries(SIZES.map((s) => [s, px(grab(css, new RegExp(`--ty-size-${s}:\\s*([\\d.]+)rem`), `--ty-size-${s}`))]))

  const btn = read('src/styles/button.ts')
  const button = Object.fromEntries(SIZES.map((s) => [s, px(s === DEFAULT
    ? grab(btn, /:host\s*\{\s*--ty-button-height:\s*([\d.]+)rem/, 'base --ty-button-height')
    : grab(btn, new RegExp(`:host\\(\\[size="${s}"\\]\\)\\s*\\{\\s*--ty-button-height:\\s*([\\d.]+)rem`), `button ${s}`))]))

  const tagCss = read('src/styles/tag.ts')
  const tag = Object.fromEntries(SIZES.map((s) => [s, Number(s === DEFAULT
    ? grab(tagCss, /\n\.tag-container \{[^}]*?min-height:\s*(\d+)px/, 'base tag min-height')
    : grab(tagCss, new RegExp(`:host\\(\\[size="${s}"\\]\\) \\.tag-container \\{[^}]*?min-height:\\s*(\\d+)px`), `tag ${s}`))]))

  const fs = read('src/styles/field-size.ts')
  const block = (from, to) => fs.slice(fs.indexOf(from), to ? fs.indexOf(to) : undefined)
  const rung = (src, size) => grab(src, new RegExp(`:host\\(\\[size="${size}"\\]\\)\\s*\\{\\s*--ty-field-height:\\s*var\\(--ty-size-(\\w+)`), `narrow ${size}`)
  const at640 = block('@media (max-width: 640px)', '@media (max-width: 480px)')
  const at480 = block('@media (max-width: 480px)')
  const narrow = { lg640: field[rung(at640, 'lg')], xl640: field[rung(at640, 'xl')], xl480: field[rung(at480, 'xl')] }

  const select = read('src/components/select.ts')
  const threshold = Number(grab(select, /const SEARCH_AUTO_THRESHOLD = (\d+)/, 'SEARCH_AUTO_THRESHOLD'))
  must(/\.length > SEARCH_AUTO_THRESHOLD/.test(select), 'select.ts no longer shows the search row strictly above SEARCH_AUTO_THRESHOLD; the card says "above N"')

  // ── the card's tables and sentences ───────────────────────────────────────
  const row = (label) => {
    const line = card.split('\n').find((l) => l.startsWith(`| ${label}`))
    return line ? line.split('|').slice(2, 7).map((c) => Number(c.trim())) : null
  }
  for (const [label, ladder] of [['Field:', field], ['`ty-button`', button], ['`ty-tag`', tag]]) {
    const got = row(label)
    const want = SIZES.map((s) => ladder[s])
    must(got && got.join() === want.join(), `size row ${label}: card ${got} vs source ${want}`)
  }
  const header = `| | ${SIZES.map((s) => (s === DEFAULT ? `${s} (default)` : s)).join(' | ')} |`
  must(card.includes(header), `size table header should be: ${header}`)
  const sentences = [
    `Below 640px fields drop \`lg\` to ${narrow.lg640} and \`xl\` to ${narrow.xl640} (below 480px \`xl\` to ${narrow.xl480})`,
    `field \`md\` + button \`lg\`** (both ${field.md})`,
    `field \`sm\` + button \`md\` (${field.sm})`,
    `(field ${field[DEFAULT]}, button ${button[DEFAULT]})`,
    `Up to ${threshold} options`,
    `above ${threshold} options`,
  ]
  for (const s of sentences) must(card.includes(s), `card should say: ${s}`)
  must(field.md === button.lg && field.sm === button.md, `pairings: field md ${field.md}/button lg ${button.lg}, field sm ${field.sm}/button md ${button.md}`)
  must(tag.lg === button.md && button.md === field.sm && tag.xl === button.lg && button.lg === field.md,
    `tag pairings: tag lg ${tag.lg}=button md ${button.md}=field sm ${field.sm}; tag xl ${tag.xl}=button lg ${button.lg}=field md ${field.md}`)
  must(field.lg === button.xl && narrow.lg640 !== button.xl, 'the card says field lg + button xl matches but breaks below 640px')

  const listed = (re) => { const m = card.match(re); return m ? [...m[1].matchAll(/`([\w-]+)`/g)].map((x) => x[1]) : [] }
  const cardFlavors = listed(/Flavors: ((?:`[\w-]+`,? ?)+)\./)
  must(cardFlavors.slice().sort().join() === FLAVORS.slice().sort().join(), `flavors: card ${cardFlavors} vs FLAVORS ${FLAVORS}`)
  for (const f of listed(/There is no ((?:`[\w-]+`(?:, | or )?)+)/)) must(!FLAVORS.includes(f), `card says there is no ${f}, but FLAVORS has it`)

  // ── every ty-* / --ty-* name the card mentions exists in source ───────────
  const corpus = []
  const walk = (dir) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e)
      if (statSync(p).isDirectory()) { if (e !== 'icons') walk(p) } else if (/\.(ts|css)$/.test(e)) corpus.push(readFileSync(p, 'utf8'))
    }
  }
  walk(join(core, 'src'))
  const source = corpus.join('\n')
  const elements = new Set([...source.matchAll(/customElements\.define\(\s*['"]([\w-]+)['"]/g)].map((m) => m[1]))
  const code = [...card.matchAll(/```[\s\S]*?```|`[^`\n]+`/g)].map((m) => m[0]).join('\n')
  const names = new Set([...code.matchAll(/(?<![\w-])(--)?ty-[a-z0-9{}X-]*[a-z0-9}X][+-]*/g)].map((m) => m[0]))
  for (const name of names) {
    const real = name.replace('{flavor}', 'primary').replace(/-X\b/, '-primary')
    must(source.includes(real) || source.includes(real.replace(/\+/g, '\\+')), `card mentions ${name}, which isn't in packages/core/src`)
  }
  for (const m of code.matchAll(/<(ty-[\w-]+)/g)) must(elements.has(m[1]), `card example uses <${m[1]}>, which no component defines`)
  const table = card.slice(card.indexOf('| Need | Use |'), card.indexOf('\n\n', card.indexOf('| Need | Use |')))
  for (const m of table.matchAll(/\| [^|]*\| ([^\n]*)\|/g)) {
    for (const el of m[1].matchAll(/`(ty-[\w-]+)`/g)) must(elements.has(el[1]), `§1 recommends ${el[1]}, which no component defines`)
  }

  return { errors, checked: sentences.length + names.size + 6 }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { errors, checked } = checkAgentDocs()
  if (errors.length) {
    console.error(`guides/AGENT_INSTRUCTIONS.md disagrees with the source (${errors.length}):`)
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }
  console.log(`agent docs check: OK (${checked} facts)`)
}
