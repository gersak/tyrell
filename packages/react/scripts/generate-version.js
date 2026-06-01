#!/usr/bin/env node

/**
 * Generate src/version.ts from package.json version.
 *
 * Run before `tsc` so the version constant compiled into dist/ always
 * matches the published package.json. Mirrors the same script in
 * packages/core/scripts/generate-version.js.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pkgPath = resolve(__dirname, '../package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

const content = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from package.json by scripts/generate-version.js
// Run 'npm run generate:version' to regenerate.

/** Current version of tyrell-react. Synced with package.json on build. */
export const VERSION = '${pkg.version}'
`

const outputPath = resolve(__dirname, '../src/version.ts')
writeFileSync(outputPath, content, 'utf-8')

console.log(`✅ Generated src/version.ts with version ${pkg.version}`)
