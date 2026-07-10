import { esbuildPlugin } from '@web/dev-server-esbuild';
import { chromeLauncher } from '@web/test-runner-chrome';

// Component tests run in a real headless Chromium — these web components rely on
// ElementInternals, shadow DOM, ResizeObserver/MutationObserver, :has() and
// oklch(), none of which jsdom/happy-dom support faithfully.
//
// Tests import the BUILT lib (run `npm run build:lib` first; the `test` script
// does this), so they exercise the same code consumers ship.
export default {
  files: 'test/**/*.test.ts',
  nodeResolve: true,
  // Run test files one at a time. These components register globally and use
  // page-level observers (Resize/Mutation/rAF); running files in parallel pages
  // caused cross-file timing stalls.
  concurrency: 1,
  plugins: [esbuildPlugin({ ts: true, target: 'es2022' })],
  browsers: [
    chromeLauncher({
      // --no-sandbox is required to launch Chromium as root / in CI containers.
      launchOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    }),
  ],
  testFramework: {
    config: { timeout: 5000 },
  },
  // Load axe-core as a classic script so it registers window.axe (its UMD/CJS
  // build doesn't import cleanly as an ES module under esbuild). a11y.test.ts
  // reads window.axe.
  testRunnerHtml: (testFramework) => `
    <html>
      <body>
        <script src="/node_modules/axe-core/axe.min.js"></script>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
};
