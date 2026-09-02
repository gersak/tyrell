// Strips comments and indentation from lib/ output. tsc keeps everything,
// and consumer minifiers never touch string contents — the CSS living in
// template literals ships verbatim otherwise. Same regexes as the
// stripComments plugin in vite.config.cdn.ts.
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

let saved = 0
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (p.endsWith('.js')) {
      const src = readFileSync(p, 'utf8')
      const out = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{2,}/g, '\n')
      if (out !== src) { writeFileSync(p, out); saved += src.length - out.length }
    }
  }
}
walk('lib')
console.log(`strip-lib-comments: saved ${(saved / 1024).toFixed(0)}K`)
