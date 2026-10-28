# Tyrell + Datastar + Go — Workspace

A second Go + Datastar example that exercises **every Tyrell primitive that the
support-ticket demo doesn't cover**, so you can sanity-check the latest TC
build end-to-end.

> Sibling to `../datastar-go/`. Standard library only, single `main.go`.
> Uses **tyrell-components `1.0.0-RC19`** (pinned on jsDelivr) and **Datastar `v1.0.0-RC.8`**.

## What it shows

| Component | Where |
|---|---|
| `ty-tabs` + `ty-tab` | Primary navigation (Overview / Members / Reports / Calendar / Files / Onboarding) |
| Lazy `ty-tab` (`lazy` + `data-on:ty-tab-load`) | Members and Reports load the first time they're shown, with a spinner; Reports fails its first load on purpose to show `loadFailed()` → "Couldn't load." + Retry |
| `ty-tooltip` | Help indicators on the Overview metric cards |
| `ty-tag` (standalone) | Status pills throughout |
| `ty-copy` | API key + webhook URL (both `code` and `text` formats) |
| `ty-popup` | Workspace-settings button (header) + per-member action menu |
| `ty-resize-observer` | Live width readout on the Overview "Responsive panel" |
| `ty-select multiple compact` + `ty-option` + `ty-selected-options` | Skill filter on the Members tab: picks show as dismissible chips, server-side filtering via `data-on:change → @get('/api/members')` |
| `ty-calendar` | Date picker on the Calendar tab; selecting a day triggers `@get('/api/events')` and the day's schedule renders in the side panel |
| `ty-file-upload` | Drop zone on the Files tab; clicking Upload streams progress via SSE `patch-elements` |
| `ty-wizard` + `ty-step` | Onboarding flow with server-driven step transitions; the Profile step is a real `<form>` (native `required` / `minlength` / `type="email"`, Enter submits) |

## Run

```bash
cd examples/datastar-go-workspace
go run .                 # http://localhost:8081
PORT=8091 go run .       # if 8081 is taken
```

If `../datastar-go/` is already running on `:8080`, both can coexist.

## Patterns worth noting

- **Pinned version.** `dist/tyrell.js`, `css/tyrell.css`, and `css/tyrell-theme.css` are pulled from
  `tyrell-components@1.0.0-RC19` on jsDelivr. Pinned rather than `@tc` (which moves with
  every test build) so the page always loads what it was written against.
- **Lazy tabs.** An empty `<ty-tab lazy>` fires `ty-tab-load` when first shown. The
  server answers with the same `<ty-tab>` plus content (`patch-elements`, morphed by
  id), so the opening tag is shared in Go (`lazyTabOpen`). A failed fetch reaches the
  tab's `data-on:datastar-fetch` listener, which calls `el.loadFailed()`.
- **Server-rendered icons.** Same trick as the first example: a `tyIcon()`
  helper inlines an `<svg>` as a child of `<ty-icon>`, so the slot wins over
  the registry fallback and icons paint with zero client JS.
- **Wizard state lives on the server.** Each step's Next/Back button POSTs to
  `/api/wizard/{next,back}`. The server reads signals, validates, and patches
  `wizardActive` + `wizardCompleted` back to the client; the component just
  reflects those signals via `data-attr:active` / `data-attr:completed`.
- **Server-side multiselect filter.** `data-bind="skillFilter"` exposes the
  `ty-select multiple` selection as a comma-separated string that the server
  uses to filter the member list. The server renders the tab with
  `value="<skillFilter>"`, so the select shows the current filter.
- **Resize observer + Datastar.** `ty-resize-observer` doesn't fire events, so
  we listen to window resizes via `data-on:resize__window__debounce.150ms` and read
  the registry: `window.tyResizeObserver.getSize('overview-panel').width`.
- **Popup anchors.** A `ty-popup` anchors to its parent. The member menu's anchor
  is a `div role="button"`, not a `<button>`: the menu holds buttons, and HTML can't
  nest them.

## File structure

```
datastar-go-workspace/
├── main.go     # HTTP server, SSE helpers, all handlers + embedded HTML
└── go.mod      # Standard library only (Go 1.22+)
```
