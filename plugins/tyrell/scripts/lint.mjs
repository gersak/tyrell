#!/usr/bin/env node
/**
 * Stop: check the UI files changed since the last check for hand-rolled
 * controls, raw colors and removed Tyrell API, and hand the findings back to
 * Claude (exit 2) once per turn. A line carrying `tyrell-ignore` is skipped.
 * Runs only in sessions where session-start found Tyrell.
 */
import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { loadSession, readInput, readText, saveSession, sourceFiles } from './common.mjs'

const MAX_SHOWN = 40
const CONTROL = '(?:btn|pill|chip|badge|seg|segmented|drawer)'
const CONTROL_CLASS = new RegExp(`^${CONTROL}(?:-[\\w-]+)?$`)
const CSS_CONTROL = new RegExp(`(?<![\\w-])\\.(${CONTROL}(?:-[\\w-]+)?)(?![\\w-])`)
const TW_COLOR = /(?<![\w-])((?:bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|placeholder|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)|(?:bg|text|border)-(?:black|white))(?![\w-])/
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/
const KIND = {
  css: /^\.(css|scss|less)$/,
  clj: /^\.(clj|cljs|cljc)$/,
  markup: /^\.(html?|vue|svelte|templ|erb|heex|eex|php|twig|hbs|njk|liquid|jinja2?|[jt]sx|[cm]?[jt]s|go|py)$/,
}

const kindOf = (file) => {
  const ext = extname(file).toLowerCase()
  return Object.keys(KIND).find((k) => KIND[k].test(ext)) || null
}

function classTokens(line, kind) {
  const tokens = []
  if (kind === 'clj') {
    for (const m of line.matchAll(/:[a-z][\w-]*((?:\.[\w-]+)+)/g)) tokens.push(...m[1].split('.').filter(Boolean))
    for (const m of line.matchAll(/:class\s+(?:\[([^\]]*)\]|"([^"]*)")/g)) {
      tokens.push(...(m[1] || m[2]).replace(/[":]/g, ' ').split(/\s+/).filter(Boolean))
    }
  } else {
    for (const m of line.matchAll(/class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["'`]([^"'`]*)["'`])/g)) {
      tokens.push(...(m[1] ?? m[2] ?? m[3]).split(/\s+/).filter(Boolean))
    }
  }
  return tokens
}

function lintLine(line, kind) {
  const found = []
  const hit = (msg) => found.push(msg)

  // Hand-rolled controls
  if (kind === 'css' || /\{\s*$|\{[^}]*:/.test(line)) {
    const m = line.match(CSS_CONTROL)
    if (m && (kind === 'css' || new RegExp(`\\.${m[1]}[^{;]*\\{`).test(line))) {
      hit(`hand-rolled control CSS .${m[1]}: use the Tyrell component (ty-button, ty-tag, ty-select trigger, ty-modal)`)
    }
  }
  const classes = [...new Set(classTokens(line, kind).filter((t) => CONTROL_CLASS.test(t)))]
  if (classes.length) hit(`hand-rolled control class ${classes.map((c) => `"${c}"`).join(', ')}: use the Tyrell component (ty-button, ty-tag, ty-select trigger, ty-modal)`)
  if (kind === 'clj') {
    for (const m of line.matchAll(/\[:(button|select|dialog|textarea|input)(?=[\s.#\]{])/g)) {
      const attrs = line.slice(m.index, m.index + 80)
      if (m[1] === 'input' && /"hidden"|:hidden/.test(attrs)) continue
      hit(`native [:${m[1]}]: use the ty-* component (ty-button, ty-select, ty-modal, ty-textarea, ty-input)`)
    }
  } else if (kind === 'markup') {
    const m = line.match(/<(button|select|dialog|textarea)(?=[\s>/])/)
    if (m) hit(`native <${m[1]}>: use the ty-* component (ty-button, ty-select, ty-modal, ty-textarea)`)
    if (/<input(?=[\s>/])(?![^>]*type\s*=\s*["']?hidden)/.test(line)) hit('native <input>: use ty-input / ty-checkbox / ty-radio / ty-file-upload')
    const c = line.match(/createElement\(\s*['"](button|select|dialog|textarea|input)['"]/)
    if (c) hit(`createElement('${c[1]}'): use the ty-* component`)
  }

  // Colors
  if (kind !== 'css') {
    const tw = line.match(TW_COLOR)
    if (tw) hit(`Tailwind color class ${tw[1]}: colors come from Tyrell classes (ty-text-*, ty-bg-*, ty-border-*)`)
    if (/style\s*=\s*["'{][^"'}]*(?:color|background|border|fill|stroke)[\w-]*\s*:\s*[^;"'}]*(?:#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/.test(line) ||
        /:style\s*\{[^}]*:(?:color|background[\w-]*|border[\w-]*)\s+"(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(line)) {
      hit('raw color in an inline style: use Tyrell color classes')
    }
    if (/(?<![\w-])divide-[xy](?![\w-])/.test(line)) hit('Tailwind divide-x/y: use ty-divide-x / ty-divide-y')
  } else {
    // Declarations only; custom properties (--x: #...) are how a theme is set, so they pass.
    for (const d of line.matchAll(/(?:^|[{;\s])(color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|fill|stroke|caret-color|accent-color|text-decoration-color)\s*:\s*([^;}]*)/g)) {
      if (RAW_COLOR.test(d[2]) && !d[2].includes('var(')) {
        hit(`raw color in ${d[1]}: use Tyrell tokens/classes; theme with --ty-primary-seed or a custom flavor`)
        break
      }
    }
  }

  // Removed or misremembered API
  const flavor = line.match(/flavor\s*=\s*["'](info|secondary|accent)["']|:flavor\s+[":](info|secondary|accent)|(?<![\w-])ty-(?:text|bg|border)-(info|secondary|accent)(?![\w])/)
  if (flavor) hit(`no flavor "${flavor[1] || flavor[2] || flavor[3]}": flavors are primary, success, danger, warning, neutral`)
  const removed = line.match(/<ty-(dropdown|multiselect)\b|:ty-(dropdown|multiselect)\b/)
  if (removed) hit(`ty-${removed[1] || removed[2]} was removed: use ty-select`)
  if (/import\s*\*\s*as\s+\w+\s+from\s+["']tyrell-components\/icons\//.test(line)) hit('namespace icon import ships every icon: import the icons you use by name')
  return found
}

function changedFiles(root) {
  try {
    const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 })
    const top = git('rev-parse', '--show-toplevel').trim()
    const parts = git('status', '--porcelain', '--untracked-files=all', '-z').split('\0').filter(Boolean)
    const files = []
    for (let i = 0; i < parts.length; i++) {
      const entry = parts[i]
      const status = entry.slice(0, 2)
      if (status[0] === 'R' || status[0] === 'C') i++ // -z puts the old path next
      if (!status.includes('D')) files.push(join(top, entry.slice(3)))
    }
    return files
  } catch {
    return [...sourceFiles(root, { maxFiles: 2000 })]
  }
}

const mtime = (f) => { try { return statSync(f).mtimeMs } catch { return 0 } }

try {
  const input = await readInput()
  const state = loadSession(input.session_id)
  // stop_hook_active: Claude is already answering this hook's findings; one round per turn.
  if (state && !input.stop_hook_active) {
    const since = state.lastCheck
    saveSession(input.session_id, { ...state, lastCheck: Date.now() })

    const findings = []
    for (const file of changedFiles(state.root)) {
      const kind = kindOf(file)
      if (!kind || /\.min\.|[\\/](vendor|dist|build|target|node_modules|cljs-runtime)[\\/]/.test(file) || mtime(file) <= since) continue
      const text = readText(file, 300 * 1024)
      if (!text) continue
      text.split('\n').forEach((line, i) => {
        if (line.includes('tyrell-ignore')) return
        for (const msg of lintLine(line, kind)) findings.push({ file, line: i + 1, msg, src: line.trim().slice(0, 90) })
      })
    }

    if (findings.length) {
      let out = `Tyrell lint: ${findings.length} issue(s) in files changed this turn (the Tyrell rules card explains each).\n`
      let last = null
      for (const f of findings.slice(0, MAX_SHOWN)) {
        if (f.file !== last) { out += `${relative(state.root, f.file)}\n`; last = f.file }
        out += `  ${f.line}: ${f.msg}\n      ${f.src}\n`
      }
      if (findings.length > MAX_SHOWN) out += `…and ${findings.length - MAX_SHOWN} more.\n`
      out += 'Fix them, or keep a line on purpose by adding a `tyrell-ignore` comment to it.\n'
      process.stderr.write(out)
      process.exit(2)
    }
  }
} catch {
  // A lint failure must never trap Claude in a turn.
}
process.exit(0)
