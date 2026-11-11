/**
 * Shared by the Tyrell plugin hooks: find Tyrell in a project, get the rules
 * card for its version, keep a little per-session state.
 *
 * Network, cached under ~/.cache/tyrell-agents (TYRELL_AGENTS_OFFLINE=1 turns
 * it off): the card for a published version from jsDelivr, then unpkg, then
 * the newest card; npm dist-tags. Only the package name and a version go out.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, relative } from 'node:path'

export const CACHE = join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'tyrell-agents')
const SESSIONS = join(CACHE, 'sessions')
const OFFLINE = process.env.TYRELL_AGENTS_OFFLINE === '1'
const DEADLINE = Date.now() + 8000 // all network for one hook run
const HOUR = 3600e3
const PKGS = ['tyrell-components', 'tyrell-react']
const CARD_TITLE = '# Tyrell — rules for coding agents'
export const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'target', 'coverage', 'vendor', '__pycache__', 'cljs-runtime'])
export const SOURCE = /\.(html?|css|scss|less|[cm]?[jt]sx?|vue|svelte|clj[sc]?|edn|templ|go|py|rb|erb|ex|exs|heex|eex|php|twig|hbs|njk|liquid|jinja2?)$/i

export async function readInput() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  try { return JSON.parse(raw || '{}') } catch { return {} }
}

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }

export function readText(p, max = 512 * 1024) {
  try { return statSync(p).size <= max ? readFileSync(p, 'utf8') : null } catch { return null }
}

/** Source files under root, skipping dot-dirs, dependencies and build output. */
export function* sourceFiles(root, { maxFiles = 4000, maxDepth = 8 } = {}) {
  let count = 0
  const stack = [[root, 0]]
  while (stack.length) {
    const [dir, depth] = stack.pop()
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const p = join(dir, e.name)
      if (e.isDirectory()) { if (depth < maxDepth && !SKIP_DIRS.has(e.name)) stack.push([p, depth + 1]) }
      else if (e.isFile() && SOURCE.test(e.name)) { yield p; if (++count >= maxFiles) return }
    }
  }
}

function childDirs(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !SKIP_DIRS.has(e.name))
      .slice(0, 100)
      .map((e) => join(dir, e.name))
  } catch { return [] }
}

const bare = (v) => String(v || '').replace(/^[\^~=v\s]+/, '').trim()

/** Which Tyrell this project uses — { version, via, card?, docs? } — or null. */
export function detect(root) {
  // Tyrell's own repo: the card is for apps that use Tyrell, not for its source.
  if (readJson(join(root, 'packages/core/package.json'))?.name === 'tyrell-components') return null

  // 1. The installed package: npm projects, and shadow-cljs projects (the jar's deps.cljs installs it).
  const bases = [root]
  for (const d of childDirs(root)) bases.push(d, ...childDirs(d))
  for (const base of bases) {
    for (const pkg of PKGS) {
      const dir = join(base, 'node_modules', pkg)
      const meta = readJson(join(dir, 'package.json'))
      if (meta?.version) {
        const card = join(dir, 'AGENTS.md')
        return { version: meta.version, via: relative(root, dir), card: existsSync(card) ? card : null }
      }
    }
  }

  // 2. Declared, not installed.
  const pj = readJson(join(root, 'package.json'))
  for (const pkg of PKGS) {
    const v = pj && (pj.dependencies?.[pkg] || pj.devDependencies?.[pkg] || pj.peerDependencies?.[pkg])
    if (v) return { version: bare(v), via: `package.json (${pkg}, not installed)` }
  }
  for (const f of ['deps.edn', 'shadow-cljs.edn', 'project.clj', 'bb.edn']) {
    const m = (readText(join(root, f)) || '').match(/dev\.gersak\/tyrell\s+(?:\{:mvn\/version\s+)?"([^"]+)"/)
    if (m) return { version: m[1], via: f }
  }

  // 3. A CDN pin in the source: HTML, server templates, Clojure/Go/Python views.
  const pins = new Map()
  for (const file of sourceFiles(root)) {
    const text = readText(file)
    if (!text || !text.includes('tyrell-components')) continue
    for (const m of text.matchAll(/tyrell-components@([\w.+-]+)/g)) pins.set(m[1], (pins.get(m[1]) || 0) + 1)
    if (/npm\/tyrell-components\//.test(text)) pins.set('latest', (pins.get('latest') || 0) + 1)
  }
  if (pins.size) {
    const [version] = [...pins.entries()].sort((a, b) => b[1] - a[1])[0]
    return { version, via: 'a CDN pin in the source' }
  }
  return null
}

async function fetchText(url) {
  const ms = Math.min(2500, DEADLINE - Date.now())
  if (OFFLINE || ms < 200) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms) })
    return res.ok ? await res.text() : null
  } catch { return null }
}

/** Cached fetch: a fresh copy for maxAge, a stale copy beats nothing, misses are remembered for missAge. */
async function cached(key, url, { maxAge = Infinity, missAge = 6 * HOUR, valid = () => true } = {}) {
  const file = join(CACHE, key)
  const miss = `${file}.miss`
  const age = (p) => { try { return Date.now() - statSync(p).mtimeMs } catch { return Infinity } }
  if (age(file) < maxAge || age(miss) < missAge) return readText(file)
  const text = await fetchText(url)
  mkdirSync(CACHE, { recursive: true })
  if (text && valid(text)) { writeFileSync(file, text); rmSync(miss, { force: true }); return text }
  writeFileSync(miss, '')
  return readText(file)
}

const isCard = (t) => t.includes(CARD_TITLE)
const stripComments = (t) => t.replace(/<!--(?!\/?tyrell-version)[\s\S]*?-->\n*/g, '')

export async function distTags() {
  const raw = await cached('dist-tags.json', 'https://registry.npmjs.org/-/package/tyrell-components/dist-tags', { maxAge: 6 * HOUR, missAge: HOUR })
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

/** The rules card for what the project uses — { text, from, exact } — or null. */
export async function getCard(found, tags) {
  if (found.card) return { text: readText(found.card), from: found.card, exact: true }
  // Only published versions are ever asked for: a CDN remembers early 404s.
  const want = found.version === 'latest' ? tags?.latest : found.version
  if (want && /^\d+\.\d+\.\d+/.test(want)) {
    for (const [cdn, url] of [
      ['jsdelivr', `https://cdn.jsdelivr.net/npm/tyrell-components@${want}/AGENTS.md`],
      ['unpkg', `https://unpkg.com/tyrell-components@${want}/AGENTS.md`],
    ]) {
      const text = await cached(`card-${want}-${cdn}.md`, url, { valid: isCard })
      if (text) return { text, from: `tyrell-components@${want}`, exact: true }
    }
  }
  // Versions from before the card shipped: the newest published card.
  const latest = tags?.latest
  if (latest && latest !== want) {
    const text = await cached(`card-${latest}-jsdelivr.md`, `https://cdn.jsdelivr.net/npm/tyrell-components@${latest}/AGENTS.md`, { valid: isCard })
    if (text) return { text, from: `tyrell-components@${latest}`, exact: false }
  }
  const master = await cached('card-master.md', 'https://raw.githubusercontent.com/gersak/tyrell/master/guides/AGENT_INSTRUCTIONS.md', { maxAge: 12 * HOUR, valid: isCard })
  return master ? { text: stripComments(master), from: 'gersak/tyrell master', exact: false } : null
}

/**
 * The published dist-tags that are newer than `installed`, e.g. "latest 1.0.0-rc.22",
 * or null. Old (1.0.0-RC20, -TC61) and new (1.0.0-rc.21) names both parse; RC and
 * TC numbers aren't comparable with each other, so only the same channel counts.
 */
export function newerTags(installed, tags) {
  const parse = (v) => {
    const m = String(v || '').match(/^(\d+)\.(\d+)\.(\d+)(?:-(rc|tc)\.?(\d+))?$/i)
    return m && { base: [+m[1], +m[2], +m[3]], ch: (m[4] || '').toLowerCase(), n: m[5] ? +m[5] : 0 }
  }
  const mine = parse(installed)
  if (!mine) return null
  const out = []
  for (const tag of ['latest', 'tc']) {
    const t = parse(tags?.[tag])
    if (!t) continue
    const base = t.base[0] - mine.base[0] || t.base[1] - mine.base[1] || t.base[2] - mine.base[2]
    const newer = base > 0 || (base === 0 && ((t.ch === mine.ch && t.n > mine.n) || (mine.ch && !t.ch)))
    if (newer) out.push(`${tag} ${tags[tag]}`)
  }
  return out.length ? out.join(', ') : null
}

const sessionFile = (id) => join(SESSIONS, `${String(id).replace(/[^\w-]/g, '')}.json`)

export function saveSession(id, state) {
  if (!id) return
  mkdirSync(SESSIONS, { recursive: true })
  writeFileSync(sessionFile(id), JSON.stringify(state))
}

export function loadSession(id) {
  return id ? readJson(sessionFile(id)) : null
}

export function pruneSessions(days = 7) {
  try {
    for (const f of readdirSync(SESSIONS)) {
      const p = join(SESSIONS, f)
      if (Date.now() - statSync(p).mtimeMs > days * 24 * HOUR) rmSync(p, { force: true })
    }
  } catch {}
}
