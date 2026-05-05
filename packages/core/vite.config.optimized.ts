import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
      rollupTypes: true,
    })
  ],
  
  build: {
    // Disable sourcemaps for smallest size (enable for debugging)
    sourcemap: false,
    
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
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    
    rollupOptions: {
      external: [],
      
      output: {
        preserveModules: false,
        exports: 'named',
        compact: true,
        
        // Optimize output code generation
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
          arrowFunctions: true,
        },
      },
      
      // Aggressive tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        annotations: true,
      },
    },
    
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    
    // Use Terser with optimized settings
    minify: 'terser',
    
    terserOptions: {
      compress: {
        // Drop console and debugger
        drop_console: true,
        drop_debugger: true,
        
        // Aggressive optimizations
        passes: 3,
        
        // Remove unused code
        dead_code: true,
        unused: true,
        
        // Inline and optimize
        inline: 3,
        reduce_vars: true,
        reduce_funcs: true,
        
        // Boolean optimizations
        booleans_as_integers: true,
        
        // Pure function annotations
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        pure_getters: true,
        
        // Safe optimizations
        unsafe: false,
        unsafe_arrows: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false,
      },
      
      mangle: {
        // Mangle top-level names
        toplevel: true,
        
        // Don't mangle properties (safer for web components)
        properties: false,
        
        // Keep class names for web components
        keep_classnames: true,
        keep_fnames: false,
      },
      
      format: {
        comments: false,
        ecma: 2020,
        ascii_only: false,
        beautify: false,
        braces: false,
        preamble: '/* Tyrell Components - https://github.com/gersak/tyrell */',
      },
    },
    
    chunkSizeWarningLimit: 100,
  },
  
  server: {
    port: 3000,
    open: '/dev/index.html',
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
