// Streaming-parse repro for ty-select's blank trigger.
//
// The docs site is an SPA — the HTML parser never builds a ty-select there,
// so it can't show this bug. This server streams a real document and pauses
// INSIDE the selected option (which is deliberately the LAST child), so the
// select's `value` syncs while the option is still an empty shell.
//
//   node e2e/stream-select.mjs      → http://127.0.0.1:4174/
//
// Left pane: tyrell-components@1.0.0-TC53 from jsdelivr (no fix).
// Right pane: ./dist/tyrell.js (with fix). Same bytes, same timing.
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PAUSE_MS = 1500
const CDN = 'https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-TC53'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const head = (lib) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${lib === 'cdn' ? CDN + '/css/tyrell.css' : '/dist/tyrell.css'}">
<link rel="stylesheet" href="${lib === 'cdn' ? CDN + '/css/tyrell-theme.css' : '/dist/tyrell-theme.css'}">
<script src="${lib === 'cdn' ? CDN + '/dist/tyrell.js' : '/dist/tyrell.js'}"></script>
<style>body{font-family:system-ui;padding:20px;margin:0}small{color:#888}</style>
</head><body class="ty-content">
<p><b>${lib === 'cdn' ? 'TC53 (CDN) — before' : 'local dist — after'}</b><br>
<small>value="token" · selected option is the LAST child · ${PAUSE_MS}ms pause inside it</small></p>
<ty-select name="auth" value="token" label="Auth method" style="max-width:320px">
  <ty-option value="k8s">Kubernetes</ty-option>
  <ty-option value="token" selected>`

const tail = `Static token</ty-option>
</ty-select>
<p id="r"><small>waiting…</small></p>

<hr style="margin:24px 0;border:0;border-top:1px solid #ddd">
<p><b>Case 2 — the modal one.</b><br>
<small>no <code>value</code> on the select; the option carries <code>selected</code>. No streaming involved.</small></p>
<ty-select id="s2" name="auth2" label="Auth method" style="max-width:320px">
  <ty-option value="k8s">Kubernetes</ty-option>
  <ty-option value="token" selected>Static token</ty-option>
</ty-select>
<p id="r2"><small>waiting…</small></p>

<script>
  const report = (sel, out, why) => {
    const c = document.querySelector(sel + ' > [cloned][slot="selected"]')
    const t = (c && c.textContent.trim()) || ''
    document.getElementById(out).innerHTML = t
      ? '<b style="color:#2a7">trigger shows: “' + t + '”</b>'
      : '<b style="color:#c33">trigger is BLANK</b> <small>(' + why + ')</small>'
  }
  window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    report('ty-select[name="auth"]', 'r', 'clone captured before the option had text')
    report('#s2', 'r2', 'value never set from the selected attribute — list is ticked, field is not')
  }, 300))
</script>
</body></html>`

const index = `<!doctype html><html><head><meta charset="utf-8"><title>ty-select streaming-parse</title>
<style>body{margin:0;font-family:system-ui}h1{font-size:16px;padding:12px 16px;margin:0;border-bottom:1px solid #ddd}
.row{display:grid;grid-template-columns:1fr 1fr;height:calc(100vh - 45px)}iframe{border:0;width:100%;height:100%}
.row>div:first-child{border-right:1px solid #ddd}</style></head><body>
<h1>ty-select blank trigger — case 1: streamed document (${PAUSE_MS}ms gap inside the last option) · case 2: option carries <code>selected</code>, no <code>value</code> on the select</h1>
<div class="row"><div><iframe src="/case?lib=cdn"></iframe></div><div><iframe src="/case?lib=local"></iframe></div></div>
</body></html>`

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname === '/') return res.end(index)
  if (url.pathname.startsWith('/dist/')) {
    try {
      const body = await readFile(resolve(root, '.' + url.pathname))
      res.setHeader('content-type', url.pathname.endsWith('.css') ? 'text/css' : 'application/javascript')
      return res.end(body)
    } catch { res.statusCode = 404; return res.end() }
  }
  if (url.pathname === '/case') {
    res.setHeader('content-type', 'text/html; charset=utf-8')
    res.write(head(url.searchParams.get('lib') === 'cdn' ? 'cdn' : 'local'))
    await sleep(PAUSE_MS)     // ← the parser has the empty <ty-option value="token"> now
    return res.end(tail)
  }
  res.statusCode = 404; res.end()
}).listen(4174, '127.0.0.1', () => console.log('http://127.0.0.1:4174/'))
