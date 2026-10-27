// Minify the stylesheet sources (src/css) into the published css/ and dist/.
// css/ is what the docs link; dist/ is kept for older links.
//
//   node scripts/build-css.mjs           one build
//   node scripts/build-css.mjs --watch   rebuild on change
import * as esbuild from 'esbuild'

const entryPoints = ['tyrell', 'tyrell-theme', 'tyrell-colors-static'].map((n) => `src/css/${n}.css`)
const contexts = await Promise.all(
  ['css', 'dist'].map((outdir) => esbuild.context({ entryPoints, outdir, minify: true, logLevel: 'warning' }))
)

if (process.argv.includes('--watch')) {
  await Promise.all(contexts.map((c) => c.watch()))
} else {
  await Promise.all(contexts.map((c) => c.rebuild()))
  await Promise.all(contexts.map((c) => c.dispose()))
}
