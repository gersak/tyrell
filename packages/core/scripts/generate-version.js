#!/usr/bin/env node

/**
 * Generate src/version.ts from package.json version
 * 
 * This script is run before the lib build (tsc) to ensure
 * the version is always in sync with package.json.
 * 
 * Usage: node scripts/generate-version.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read package.json
const pkgPath = resolve(__dirname, '../package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

// Generate version.ts content
const content = `// AUTO-GENERATED FILE - DO NOT EDIT
// This file is generated from package.json by scripts/generate-version.js
// Run 'npm run generate:version' to regenerate

/**
 * Current version of tyrell-components
 * 
 * This is automatically synced with package.json during build.
 * Use \`npm version\` to bump versions.
 */
export const VERSION = '${pkg.version}'
`

// Write to src/version.ts
const outputPath = resolve(__dirname, '../src/version.ts')
writeFileSync(outputPath, content, 'utf-8')

console.log(`✅ Generated src/version.ts with version ${pkg.version}`)
