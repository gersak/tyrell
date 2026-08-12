import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Read version from package.json (single source of truth)
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)

/**
 * CDN Build Configuration
 * 
 * Creates heavily optimized UMD bundle for CDN distribution.
 * 
 * COMPONENTS ONLY - NO ICON DATA
 * - Users get icon registry utilities to register their own icons
 * - Keeps bundle size minimal
 * - Icons distributed separately via NPM for tree-shaking
 * 
 * Strategy:
 * 1. Single UMD bundle (all components in one file)
 * 2. No source maps (size critical)
 * 3. Maximum Terser optimization
 * 4. Aggressive mangling (internal code only)
 * 5. Zero whitespace
 * 6. Drop all console statements
 * 
 * Output: dist/tyrell.js
 */

/**
 * Terser only minifies code, never string contents — and ~40% of this bundle
 * is CSS living inside template literals in src/styles/*.ts, prose comments
 * and all. Stripping /* … *\/ before the bundle runs is worth ~30kB raw /
 * ~13kB gzip. JS comments go too, which terser would have dropped anyway.
 */
const stripComments = () => ({
  name: 'strip-comments',
  transform(code: string, id: string) {
    if (!id.endsWith('.ts')) return null
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Indentation and blank lines inside those same literals are shipped
      // bytes too. Newlines stay (ASI needs them; CSS doesn't care).
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{2,}/g, '\n')
  },
})

export default defineConfig({
  // Inject version at build time
  define: {
    '__VERSION__': JSON.stringify(pkg.version)
  },

  plugins: [stripComments()],

  build: {
    // NO SOURCE MAPS for CDN (size critical)
    sourcemap: false,

    // Single bundle library mode
    lib: {
      entry: resolve(__dirname, 'src/cdn.ts'),  // ← CDN entry point (NO icons!)
      name: 'Tyrell',
      formats: ['umd'], // UMD for browser <script> tag
      fileName: () => 'tyrell.js',
    },

    rollupOptions: {
      external: [],

      output: {
        // Ultra-compact output
        compact: true,

        // Minify even the formatting
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
          arrowFunctions: true,
          symbols: true,
        },

        // For UMD: global name
        name: 'Tyrell',

        // Aggressive exports optimization
        exports: 'named',

        // Put everything in one chunk
        inlineDynamicImports: true,
      },

      // MAXIMUM tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        annotations: true,
        unknownGlobalSideEffects: false,
      },
    },

    // Target modern browsers (more optimizations possible)
    target: 'es2020',

    // CDN output directory - local dist/
    outDir: resolve(__dirname, 'dist'),

    emptyOutDir: true,

    // Use Terser with MAXIMUM COMPRESSION
    minify: 'terser',

    terserOptions: {
      // COMPRESSION SETTINGS - Maximum
      compress: {
        // Multiple passes for maximum optimization
        passes: 5,

        // Remove ALL console and debugger
        drop_console: true,
        drop_debugger: true,

        // Remove dead code aggressively
        dead_code: true,
        unused: true,

        // Inline everything possible
        inline: 3,

        // Optimize variables and functions
        reduce_vars: true,
        reduce_funcs: true,
        collapse_vars: true,

        // NOTE: booleans_as_integers is intentionally disabled.
        // Terser converts true→1/false→0 which breaks String(boolProp) producing
        // "1"/"0" instead of "true"/"false" — aria-checked CSS selectors then fail.
        booleans_as_integers: false,

        // Remove pure function calls
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.trace',
          'console.warn'
        ],
        pure_getters: true,

        // Safe optimizations
        conditionals: true,
        comparisons: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        sequences: true,

        // AGGRESSIVE optimizations
        unsafe: true,              // Aggressive optimizations
        unsafe_arrows: true,       // Optimize arrow functions
        unsafe_comps: true,        // Optimize comparisons
        unsafe_math: true,         // Optimize Math.*
        unsafe_methods: true,      // Optimize method calls
        unsafe_proto: true,        // Optimize prototype
        unsafe_regexp: true,       // Optimize regexes
        unsafe_undefined: true,    // Optimize undefined

        // Remove unnecessary code
        arrows: true,
        arguments: true,
        keep_fargs: false,
        keep_infinity: false,
      },

      // MANGLING SETTINGS - Aggressive
      mangle: {
        // Mangle top-level names
        toplevel: true,

        // Mangle properties (CAREFUL with web components!)
        properties: {
          // Only mangle properties starting with underscore
          regex: /^_/,
          // Keep these properties unmangled (web component lifecycle)
          reserved: [
            'connectedCallback',
            'disconnectedCallback',
            'adoptedCallback',
            'attributeChangedCallback',
            'observedAttributes',
            'shadowRoot',
            'customElements',
            'register',
            'get',
            'has',
            'list',
          ],
        },

        // Keep class names for web components (required!)
        keep_classnames: /^Ty/,

        // Don't keep function names (smaller output)
        keep_fnames: false,
      },

      // OUTPUT FORMAT SETTINGS
      format: {
        // Remove ALL comments
        comments: false,

        // Target ES2020
        ecma: 2020,

        // No ASCII escaping (smaller)
        ascii_only: false,

        // No beautification
        beautify: false,

        // Minimize braces
        braces: false,

        // Semicolons (semicolons are smaller than newlines)
        semicolons: true,

        // Shorten output
        shebang: false,

        // Wrap IIFEs
        wrap_iife: false,

        // Add banner for license/attribution
        preamble: '/*! Tyrell Components | Components Only (NO Icons) | MIT License | https://github.com/gersak/tyrell */',
      },
    },

    // No chunk size warnings (we want single file)
    chunkSizeWarningLimit: 500,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})