import * as esbuild from 'esbuild';

// Wrapper tests run in a real headless Chromium so the custom elements from
// packages/core (built lib) actually upgrade — that's where prop → attribute
// → property bridging can go wrong.
//
// React ships CommonJS, so each test file is bundled whole by esbuild on
// request (React, react-dom, the wrappers' src and core's lib) instead of
// being served module by module.
//
// REACT=18 swaps in the react-18 / react-dom-18 aliases: React 18 needs the
// wrappers' imperative property bridge (utils/use-boolean-prop.ts), React 19
// doesn't, so both paths are covered by running the suite twice.
const react18 = process.env.REACT === '18';

export default {
  files: 'test/**/*.test.tsx',
  concurrency: 1,
  testFramework: { config: { timeout: 5000 } },
  plugins: [
    {
      name: 'bundle-tests',
      async serve(context) {
        if (!context.path.startsWith('/test/') || !context.path.endsWith('.test.tsx')) return;
        const result = await esbuild.build({
          entryPoints: ['.' + context.path],
          bundle: true,
          write: false,
          format: 'esm',
          target: 'es2022',
          jsx: 'automatic',
          sourcemap: 'inline',
          define: { 'process.env.NODE_ENV': '"development"' },
          alias: react18 ? { react: 'react-18', 'react-dom': 'react-dom-18' } : {},
        });
        return { body: result.outputFiles[0].text, type: 'js' };
      },
    },
  ],
};
