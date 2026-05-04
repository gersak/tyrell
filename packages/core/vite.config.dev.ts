import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Read version from package.json (single source of truth)
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)

/**
 * Development Build Configuration
 * 
 * Creates UNMINIFIED bundle for development and debugging.
 * 
 * SAME OUTPUT FILENAME as production (dist/tyrell.js)
 * - ClojureScript site always loads the same file
 * - Switch between dev/prod by running different build command
 * - Use with --watch for continuous rebuilds
 *
 * Strategy:
 * 1. Keep ALL console.logs (debugging!)
 * 2. NO minification - readable code
 * 3. Source maps enabled
 * 4. Fast builds
 * 5. Same filename as production build
 *
 * Usage:
 *   npm run build:dev              # Single build
 *   npm run build:dev:watch        # Watch mode (auto-rebuild)
 *
 * Output: dist/tyrell.js (UNMINIFIED)
 */

export default defineConfig({
  // Inject version at build time
  define: {
    '__VERSION__': JSON.stringify(pkg.version)
  },

  plugins: [],
  
  build: {
    // SOURCE MAPS for debugging
    sourcemap: true,
    
    // Single bundle library mode
    lib: {
      entry: resolve(__dirname, 'src/cdn.ts'),
      name: 'Tyrell',
      formats: ['umd'],
      fileName: () => 'tyrell.js',  // Same filename as production!
    },

    rollupOptions: {
      external: [],

      output: {
        name: 'Tyrell',
        exports: 'named',
        inlineDynamicImports: true,
        
        // Readable code formatting
        compact: false,
        
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
          arrowFunctions: true,
        },
      },
      
      // Keep tree-shaking but don't be aggressive
      treeshake: {
        moduleSideEffects: true,  // Keep side effects for debugging
        propertyReadSideEffects: true,
      },
    },
    
    target: 'es2020',
    
    // Output to dist/ (same as production)
    outDir: resolve(__dirname, 'dist'),
    
    // Don't empty outDir - preserve ty.css
    emptyOutDir: false,
    
    // NO MINIFICATION for development
    minify: false,
    
    chunkSizeWarningLimit: 1000, // Dev bundle is bigger, that's OK
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})