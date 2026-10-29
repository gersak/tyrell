import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import dts from 'vite-plugin-dts'

// Read version from package.json (single source of truth)
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)

export default defineConfig(({ mode }) => ({
  // Inject version at build time
  define: {
    '__VERSION__': JSON.stringify(pkg.version)
  },

  plugins: [
    dts({
      include: ['src/**/*'],
      outDir: resolve(__dirname, 'dist'), // Output to packages/core/dist/
      rollupTypes: true,
    })
  ],
  
  build: {
    // Generate sourcemaps (disable for smallest size)
    sourcemap: true,
    
    lib: {
      entry: {
        // Main entry point
        index: resolve(__dirname, 'src/index.ts'),
        
        // Individual component entries for tree-shaking
        'components/button': resolve(__dirname, 'src/components/button.ts'),
        'components/modal': resolve(__dirname, 'src/components/modal.ts'),
        'components/input': resolve(__dirname, 'src/components/input.ts'),
        'components/dropdown': resolve(__dirname, 'src/components/dropdown.ts'),
        'components/checkbox': resolve(__dirname, 'src/components/checkbox.ts'),
        'components/textarea': resolve(__dirname, 'src/components/textarea.ts'),
        'components/popup': resolve(__dirname, 'src/components/popup.ts'),
        'components/tooltip': resolve(__dirname, 'src/components/tooltip.ts'),
        'components/tag': resolve(__dirname, 'src/components/tag.ts'),
        'components/option': resolve(__dirname, 'src/components/option.ts'),
        'components/icon': resolve(__dirname, 'src/components/icon.ts'),
        'components/tabs': resolve(__dirname, 'src/components/tabs.ts'),
        'components/tab': resolve(__dirname, 'src/components/tab.ts'),
        'components/sortable': resolve(__dirname, 'src/components/sortable.ts'),
        
        // Utils for tree-shakeable imports
        'utils/icon-registry': resolve(__dirname, 'src/utils/icon-registry.ts'),
        
        // Icon sets for tree-shakeable imports
        'icons/lucide': resolve(__dirname, 'src/icons/lucide.ts'),
        'icons/heroicons/outline': resolve(__dirname, 'src/icons/heroicons/outline.ts'),
        'icons/heroicons/solid': resolve(__dirname, 'src/icons/heroicons/solid.ts'),
        'icons/heroicons/mini': resolve(__dirname, 'src/icons/heroicons/mini.ts'),
        'icons/heroicons/micro': resolve(__dirname, 'src/icons/heroicons/micro.ts'),
        'icons/material/filled': resolve(__dirname, 'src/icons/material/filled.ts'),
        'icons/material/outlined': resolve(__dirname, 'src/icons/material/outlined.ts'),
        'icons/material/round': resolve(__dirname, 'src/icons/material/round.ts'),
        'icons/material/sharp': resolve(__dirname, 'src/icons/material/sharp.ts'),
        'icons/material/two-tone': resolve(__dirname, 'src/icons/material/two-tone.ts'),
        'icons/fontawesome/solid': resolve(__dirname, 'src/icons/fontawesome/solid.ts'),
        'icons/fontawesome/regular': resolve(__dirname, 'src/icons/fontawesome/regular.ts'),
        'icons/fontawesome/brands': resolve(__dirname, 'src/icons/fontawesome/brands.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    
    rollupOptions: {
      // Externalize dependencies
      external: [],
      
      output: {
        // Preserve module structure
        preserveModules: false,
        
        // Use named exports
        exports: 'named',
        
        // Advanced mangling for smaller output
        compact: true,
        
        // More aggressive tree-shaking
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
      },
      
      // Tree-shaking configuration
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    
    // Target modern browsers (allows more optimizations)
    target: 'es2020',
    
    // Output directory - local dist/
    outDir: resolve(__dirname, 'dist'),
    
    // Empty output dir before build
    emptyOutDir: true,
    
    // Use Terser for better compression (slower build, smaller output)
    // Options: 'esbuild' (fast), 'terser' (smaller)
    minify: 'terser',
    
    // Terser options for maximum compression
    terserOptions: {
      compress: {
        // Remove console statements ONLY in production
        drop_console: mode === 'production',
        drop_debugger: true,
        
        // More aggressive optimizations
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        pure_getters: true,
        unsafe: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_methods: false,
      },
      mangle: {
        // Mangle property names for smaller output
        properties: {
          // Don't mangle properties starting with _
          regex: /^_/,
        },
      },
      format: {
        // Remove comments
        comments: false,
        
        // Shorter output
        ecma: 2020,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 100,
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: '/dev/index.html',
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}))