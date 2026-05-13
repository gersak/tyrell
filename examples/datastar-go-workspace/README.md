# Tyrell + Datastar + Go — Workspace

A second Go + Datastar example that exercises **every Tyrell primitive that the
support-ticket demo doesn't cover**, so you can sanity-check the latest TC
build end-to-end.

> Sibling to `../datastar-go/`. Standard library only, single `main.go`.

## What it shows

| Component | Where |
|---|---|
| `ty-tabs` + `ty-tab` | Primary navigation (Overview / Members / Calendar / Files / Onboarding) |
| `ty-tooltip` | Help indicators on the Overview metric cards |
| `ty-tag` (standalone) | Status pills throughout |
| `ty-copy` | API key + webhook URL (both `code` and `text` formats) |
| `ty-popup` | Workspace-settings button (header) + per-member action menu |
| `ty-resize-observer` | Live width readout on the Overview "Responsive panel" |
| `ty-multiselect` + `ty-tag` (as option) | Skill filter on the Members tab, with server-side filtering via `data-on:change → @get('/api/members')` |
| `ty-calendar` | Date picker on the Calendar tab; selecting a day triggers `@get('/api/events')` and the day's schedule renders in the side panel |
| `ty-file-upload` | Drop zone on the Files tab; clicking Upload streams progress via SSE `patch-elements` |
| `ty-wizard` + `ty-step` | Onboarding flow with server-driven step transitions and validation |

## Run

```bash
go run .
```

Open <http://localhost:8081>.

If `../datastar-go/` is already running on `:8080`, both can coexist.

## Patterns worth noting

- **`@tc` dist tag.** Both `dist/tyrell.js` and `css/tyrell.css` are pulled from
  `tyrell-components@tc` on jsDelivr — that tag tracks the latest TC build
  (e.g. `1.0.0-TC15`). `@latest` would pin to RC6.
- **Server-rendered icons.** Same trick as the first example: a `tyIcon()`
  helper inlines an `<svg>` as a child of `<ty-icon>`, so the slot wins over
  the registry fallback and icons paint with zero client JS.
- **Wizard state lives on the server.** Each step's Next/Back button POSTs to
  `/api/wizard/{next,back}`. The server reads signals, validates, and patches
  `wizardActive` + `wizardCompleted` back to the client; the component just
  reflects those signals via `data-attr:active` / `data-attr:completed`.
- **External multiselect filter.** `ty-multiselect` keeps its options as
  static `ty-tag` children, but `data-bind="skillFilter"` exposes the
  selection as a comma-separated string that the server uses to filter the
  member list.
- **Resize observer + Datastar.** `ty-resize-observer` doesn't fire events, so
  we listen to `window.resize` via `data-on-window:resize` and read the
  registry: `window.tyResizeObserver.getSize('overview-panel').width`.

## File structure

```
datastar-go-workspace/
├── main.go     # HTTP server, SSE helpers, all handlers + embedded HTML
└── go.mod      # Standard library only (Go 1.22+)
```
