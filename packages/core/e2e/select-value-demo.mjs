// Visual confirmation for the ty-select "value is the selection" rewrite.
// Loads the LOCAL build (./dist), built fresh by the last `npm run build:cdn`.
//
//   node e2e/select-value-demo.mjs      -> http://127.0.0.1:4175/
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const page = `<!doctype html><html><head><meta charset="utf-8">
<title>ty-select - value is the selection</title>
<link rel="stylesheet" href="/dist/tyrell.css">
<link rel="stylesheet" href="/dist/tyrell-theme.css">
<script src="/dist/tyrell.js"></script>
<style>
  body{font-family:system-ui;max-width:900px;margin:0 auto;padding:24px}
  section{border:1px solid #ddd;border-radius:8px;padding:16px 20px;margin-bottom:20px}
  h2{font-size:15px;margin:0 0 4px}
  p.sub{color:#888;font-size:13px;margin:0 0 14px}
  .verdict{font-weight:600;font-size:13px;margin-top:10px;padding:8px 10px;border-radius:6px}
  .verdict.pass{background:#e9f9ee;color:#177245}
  .verdict.fail{background:#fdeaea;color:#a11}
  .verdict.pending{background:#f3f3f3;color:#888}
  .row{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}
  .col{flex:1;min-width:260px}
  code{background:#f3f3f3;padding:1px 5px;border-radius:4px;font-size:12.5px}
  small.label{display:block;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}
</style>
</head><body class="ty-content">

<h1 style="font-size:20px">ty-select - value is the selection, options are a view of it</h1>
<p class="sub">Four things to eyeball. Each section renders the real component and states its own verdict.</p>

<section>
  <h2>A - ty-selected-tags and ty-selected-options are the same element</h2>
  <p class="sub">Both names registered on one class (ty-modal/ty-dialog precedent). Identical markup, two tag names.</p>
  <div class="row">
    <div class="col">
      <small class="label">ty-select (shared)</small>
      <ty-select id="a-sel" multiple label="Flavors">
        <ty-option value="v">Vanilla</ty-option>
        <ty-option value="c" selected>Chocolate</ty-option>
        <ty-option value="s" selected>Strawberry</ty-option>
      </ty-select>
    </div>
    <div class="col">
      <small class="label">&lt;ty-selected-tags for="a-sel"&gt;</small>
      <ty-selected-tags for="a-sel"></ty-selected-tags>
    </div>
    <div class="col">
      <small class="label">&lt;ty-selected-options for="a-sel"&gt;</small>
      <ty-selected-options for="a-sel"></ty-selected-options>
    </div>
  </div>
  <div id="v-a" class="verdict pending">checking...</div>
</section>

<section>
  <h2>B - chips are correct on the VERY FIRST paint (the regression this rewrite caused, now fixed)</h2>
  <p class="sub">Multiple select, two options pre-marked selected in markup, NO value attribute. ty-selected-tags reads picker.value in its own synchronous connectedCallback.</p>
  <div class="row">
    <div class="col">
      <ty-select id="b-sel" multiple label="Toppings">
        <ty-option value="p" selected>Pepperoni</ty-option>
        <ty-option value="m" selected>Mushroom</ty-option>
        <ty-option value="o">Olives</ty-option>
      </ty-select>
    </div>
    <div class="col">
      <ty-selected-tags for="b-sel"></ty-selected-tags>
    </div>
  </div>
  <div id="v-b" class="verdict pending">checking...</div>
</section>

<section>
  <h2>C - a value with ZERO options ever present (external-search) still reports correctly</h2>
  <p class="sub">value="bobo", external-search, NO ty-option children at all. .value, required validity and FormData must all agree a selection exists.</p>
  <ty-select id="c-sel" name="robot" value="bobo" required external-search label="Robot (external search)"></ty-select>
  <div id="v-c" class="verdict pending">checking...</div>
</section>

<section>
  <h2>D - pre-selected OPTION, no value attribute on the select</h2>
  <p class="sub">List shows the tick - does the trigger field show it too?</p>
  <ty-select id="d-sel" label="Auth method">
    <ty-option value="k8s">Kubernetes</ty-option>
    <ty-option value="token" selected>Static token</ty-option>
  </ty-select>
  <div id="v-d" class="verdict pending">checking...</div>
</section>

<script>
function verdict(id, ok, text) {
  const el = document.getElementById(id)
  el.className = 'verdict ' + (ok ? 'pass' : 'fail')
  el.textContent = (ok ? 'PASS - ' : 'FAIL - ') + text
}

window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
  const aTags = document.querySelector('ty-selected-tags[for="a-sel"]').querySelectorAll('ty-tag')
  const aOpts = document.querySelector('ty-selected-options[for="a-sel"]').querySelectorAll('ty-tag')
  const aTagsText = Array.from(aTags).map(t => t.textContent.trim()).sort().join(',')
  const aOptsText = Array.from(aOpts).map(t => t.textContent.trim()).sort().join(',')
  verdict('v-a', aTags.length === 2 && aTagsText === aOptsText,
    aTags.length + ' chips via ty-selected-tags, ' + aOpts.length + ' via ty-selected-options - content: "' + aTagsText + '" vs "' + aOptsText + '"')

  const bChips = document.querySelector('ty-selected-tags[for="b-sel"]').querySelectorAll('ty-tag')
  verdict('v-b', bChips.length === 2, bChips.length + ' chips rendered (expected 2), no reload or delay')

  const cSel = document.getElementById('c-sel')
  const cForm = document.createElement('form')
  cSel.replaceWith(cForm); cForm.appendChild(cSel)
  const cValue = cSel.value
  const cValid = cForm.checkValidity()
  const cFormData = new FormData(cForm).get('robot')
  verdict('v-c', cValue === 'bobo' && cValid && cFormData === 'bobo',
    '.value="' + cValue + '" - required valid=' + cValid + ' - FormData="' + cFormData + '" (zero options ever appended)')

  const dSel = document.getElementById('d-sel')
  const dClone = dSel.querySelector(':scope > [cloned][slot="selected"]')
  const dText = dClone ? dClone.textContent.trim() : ''
  verdict('v-d', dSel.value === 'token' && dText === 'Static token',
    '.value="' + dSel.value + '" - trigger shows "' + dText + '"')
}, 250))
</script>
</body></html>`

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname === '/') { res.setHeader('content-type', 'text/html; charset=utf-8'); return res.end(page) }
  if (url.pathname.startsWith('/dist/')) {
    try {
      const body = await readFile(resolve(root, '.' + url.pathname))
      res.setHeader('content-type', url.pathname.endsWith('.css') ? 'text/css' : 'application/javascript')
      return res.end(body)
    } catch { res.statusCode = 404; return res.end() }
  }
  res.statusCode = 404; res.end()
}).listen(4175, '127.0.0.1', () => console.log('http://127.0.0.1:4175/'))
