// ty-sortable against real hypermedia libraries: Datastar (SSE morph) and
// htmx 2 + idiomorph. The server owns the board; the browser only renders
// what it sends back. Moves into the "locked" column are refused by
// re-sending the unchanged board — ty-sortable must snap those back.
//
//   node e2e/sortable-hypermedia.mjs      → http://127.0.0.1:4175/
//
//   /ds                 Datastar page (data-on:ty-sortable-change → @post)
//   /hx                 htmx page (hx-post on each list, morph:outerHTML)
//   /hx?delay=150       same, with hx-swap="morph:outerHTML swap:150ms"
//   /ds?v=docs, /hx?v=docs   the docs-page snippets verbatim
//   POST /reset         back to the initial board
//
// Env: PORT (4175), LATENCY ms per move request (120).
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.PORT || 4175)
const LATENCY = Number(process.env.LATENCY ?? 120)
const DATASTAR = 'https://cdn.jsdelivr.net/gh/starfederation/datastar@1.0.4/bundles/datastar.js'
const HTMX = 'https://cdn.jsdelivr.net/npm/htmx.org@2.0.11/dist/htmx.min.js'
const IDIOMORPH = 'https://cdn.jsdelivr.net/npm/idiomorph@0.7.4/dist/idiomorph-ext.min.js'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'done', title: 'Done' },
  { id: 'locked', title: 'Locked (server refuses)' },
]
const initial = () => ({ todo: ['a', 'b', 'c'], done: ['d', 'e'], locked: ['z'] })
let board = initial()

/** Server-side rule. Returns an error string when the move is refused. */
function applyMove(move) {
  if (!move || typeof move.key !== 'string' || !move.to || !(move.to.list in board)) return 'bad move'
  if (move.to.list === 'locked') return 'locked column'
  const from = Object.keys(board).find((l) => board[l].includes(move.key))
  if (!from) return 'unknown item'
  if (from === 'locked') return 'locked column'
  board[from] = board[from].filter((k) => k !== move.key)
  const list = board[move.to.list]
  const at = Math.max(0, Math.min(Number(move.to.index) || 0, list.length))
  list.splice(at, 0, move.key)
  return null
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const CARD = 'padding:12px;margin:0 0 8px;background:#e5e7eb;border-radius:6px;user-select:none'

/** One column's ty-sortable. `listAttrs` adds per-library attributes. */
const renderList = (c, listAttrs) => `<ty-sortable id="${c.id}" group="board" label="${esc(c.title)}" ${listAttrs} style="display:block;min-height:60px;--ty-sortable-duration:0ms">
${board[c.id].map((k) => `    <div id="card-${k}" data-key="${k}" style="${CARD}">Card ${k.toUpperCase()}</div>`).join('\n')}
  </ty-sortable>`

const renderColumns = (listAttrs) =>
  COLUMNS.map((c) => `  <section style="width:200px"><h3>${esc(c.title)}</h3>\n  ${renderList(c, listAttrs)}</section>`).join('\n')

/** The whole board. */
const renderBoard = (boardAttrs, listAttrs) =>
  `<div id="board" ${boardAttrs} style="display:flex;gap:16px;align-items:flex-start">\n${renderColumns(listAttrs)}\n</div>`

const page = (title, headScripts, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="/dist/tyrell.css">
<script src="/dist/tyrell.js"></script>
${headScripts}
<style>body{font-family:system-ui;padding:20px;margin:0}</style>
</head>${body}</html>`

// --- Datastar -----------------------------------------------------------------
// data-indicator:saving is true while the @post is in flight; data-attr:aria-busy
// mirrors it on each list, which is what ty-sortable watches for "request over".
// It must be the STRING 'true': data-attr renders boolean true as aria-busy=""
// (and false removes it), which ty-sortable does not count as busy.
//
// variant "board": listeners on #board, the server patches the whole board.
// variant "docs":  the docs-page snippet verbatim, on each list; the server
//                  patches only the touched columns (one event, several elements).
const DS_DOCS_LIST = `data-signals:move="null"
  data-indicator:_saving
  data-attr:aria-busy="$_saving ? 'true' : 'false'"
  data-on:ty-sortable-change="$move = evt.detail.value; @post('/ds/move?v=docs')"`
const dsBoard = (v) => v === 'docs'
  ? renderBoard('', DS_DOCS_LIST)
  : renderBoard(
    `data-indicator:saving data-on:ty-sortable-change="$move = evt.detail.value; @post('/ds/move')"`,
    `data-attr:aria-busy="$saving ? 'true' : 'false'"`,
  )
const dsPage = (v) => page('ty-sortable × Datastar',
  `<script type="module" src="${DATASTAR}"></script>`,
  `<body${v === 'docs' ? '' : ' data-signals="{move: {}}"'}>\n${dsBoard(v)}\n</body>`)

// --- htmx ---------------------------------------------------------------------
// hx-post must sit on each ty-sortable (it isn't inherited): the change event
// fires on the destination list, so that list issues the request and gets the
// htmx-request class — which is what ty-sortable watches.
//
// variant "board": target/swap/vals inherited from #board, morph:outerHTML,
//                  optional swap delay.
// variant "docs":  the docs-page snippet verbatim: everything on the list,
//                  hx-target="#board" hx-swap="morph:innerHTML", hx-ext on #board.
const HX_DOCS_LIST = `hx-post="/hx/move?v=docs"
    hx-trigger="ty-sortable-change"
    hx-vals='js:{move: JSON.stringify(event.detail.value)}'
    hx-target="#board"
    hx-swap="morph:innerHTML"`
const hxBoard = (v, delay) => v === 'docs'
  ? renderBoard('hx-ext="morph"', HX_DOCS_LIST)
  : renderBoard(
    `hx-target="this" hx-swap="morph:outerHTML${delay ? ` swap:${delay}ms` : ''}" hx-vals='js:{move: JSON.stringify(event.detail.value)}'`,
    `hx-post="/hx/move${delay ? `?delay=${delay}` : ''}" hx-trigger="ty-sortable-change"`,
  )
const hxPage = (v, delay) => page('ty-sortable × htmx',
  `<script src="${HTMX}"></script>\n<script src="${IDIOMORPH}"></script>`,
  `<body${v === 'docs' ? '' : ' hx-ext="morph"'}>\n${hxBoard(v, delay)}\n</body>`)

// --- Server -------------------------------------------------------------------
const readBody = (req) => new Promise((r) => {
  let b = ''
  req.on('data', (c) => (b += c))
  req.on('end', () => r(b))
})

function sse(res, html) {
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
  const lines = html.split('\n').map((l) => `data: elements ${l}`).join('\n')
  res.end(`event: datastar-patch-elements\n${lines}\n\n`)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const p = url.pathname
  try {
    if (p === '/') {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      return res.end('<ul><li><a href="/ds">Datastar</a><li><a href="/hx">htmx</a><li><a href="/hx?delay=150">htmx, swap:150ms</a><li><a href="/ds?v=docs">Datastar (docs snippet)</a><li><a href="/hx?v=docs">htmx (docs snippet)</a></ul>')
    }
    if (p.startsWith('/dist/')) {
      const body = await readFile(resolve(root, '.' + p))
      res.setHeader('content-type', p.endsWith('.css') ? 'text/css' : 'application/javascript')
      return res.end(body)
    }
    if (p === '/state') {
      res.setHeader('content-type', 'application/json')
      return res.end(JSON.stringify(board))
    }
    if (p === '/reset' && req.method === 'POST') {
      board = initial()
      return res.end('ok')
    }
    if (p === '/ds') {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      return res.end(dsPage(url.searchParams.get('v')))
    }
    if (p === '/ds/move' && req.method === 'POST') {
      // Datastar posts all signals as JSON: {move: {...}, saving: true}.
      const signals = JSON.parse((await readBody(req)) || '{}')
      const err = applyMove(signals.move)
      if (err) console.log('ds refused:', err)
      await sleep(LATENCY)
      if (url.searchParams.get('v') !== 'docs') return sse(res, dsBoard()) // refused → the same board, unchanged
      // Only the touched columns (refused → the same columns, unchanged).
      const touched = COLUMNS.filter((c) => c.id === signals.move?.from?.list || c.id === signals.move?.to?.list)
      return sse(res, touched.map((c) => renderList(c, DS_DOCS_LIST)).join('\n'))
    }
    if (p === '/hx') {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      return res.end(hxPage(url.searchParams.get('v'), Number(url.searchParams.get('delay')) || 0))
    }
    if (p === '/hx/move' && req.method === 'POST') {
      const form = new URLSearchParams(await readBody(req))
      const err = applyMove(JSON.parse(form.get('move') || 'null'))
      if (err) console.log('hx refused:', err)
      await sleep(LATENCY)
      res.setHeader('content-type', 'text/html; charset=utf-8')
      // docs variant swaps innerHTML of #board: send just the columns.
      if (url.searchParams.get('v') === 'docs') return res.end(renderColumns(HX_DOCS_LIST))
      return res.end(hxBoard(null, Number(url.searchParams.get('delay')) || 0))
    }
    res.statusCode = 404
    res.end()
  } catch (e) {
    res.statusCode = 500
    res.end(String(e))
  }
})
server.listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}/`))
