# Tyrell + Datastar + Go

A self-contained Go server demonstrating how Tyrell web components compose naturally with [Datastar](https://data-star.dev) SSE-driven reactivity.

**No external Go dependencies** — standard library only. No build step for the server.

## What it shows

| Pattern | Where |
|---|---|
| **Server-rendered icons** — Go puts `<svg>` inside `<ty-icon>` slot, zero icon JS | All icon usages |
| `data-bind` → ty-input, ty-textarea, ty-dropdown, ty-date-picker | Form fields |
| Server-side validation via `@get('/api/validate')` + `patch-signals` | Name, email, message |
| `data-attr:error` binding to ty-input error attribute | Live error display |
| ty-radio-group with `data-bind` | Priority selection |
| ty-switch + ty-checkbox with `data-on:change` | Urgent flag, follow-up |
| Multi-step SSE progress stream on submit (`patch-elements`) | Submit button area |
| `data-attr:open` on ty-modal driven by server `patch-signals` | Success modal |
| Keep-alive SSE stream (`@get('/api/live')`) into ty-scroll-container | Live queue feed |
| Client-side signal inspector with `data-text` | Right panel |

## Run

```bash
go run .
```

Open [http://localhost:8080](http://localhost:8080).

## Server-rendered icons — zero client JS

`ty-icon` uses a `<slot>` in its shadow DOM. When you put an `<svg>` as a direct child, the browser's slot assignment shows it instead of the registry fallback — no `window.tyIcons.register()`, no `await customElements.whenDefined()`, no extra script at all.

The Go server stores the 8 needed Lucide SVG strings as constants and renders them inline into the HTML:

```go
var lucideIcons = map[string]string{
    "check": `<svg ...><path d="M20 6 9 17l-5-5"/></svg>`,
    // ...
}

func tyIcon(name, attrs string) string {
    svg := lucideIcons[name]
    return `<ty-icon ` + attrs + `>` + svg + `</ty-icon>`
}
```

The HTML template uses placeholder strings replaced at startup:

```go
var renderedHTML = strings.NewReplacer(
    `{icon:user:start}`, tyIcon("user", `slot="start"`),
    // ...
).Replace(indexHTMLTemplate)
```

The browser receives `<ty-icon slot="start"><svg>...</svg></ty-icon>` in the first response. Icons render immediately — no async loading, no flash, no registry round-trip. The same `tyIcon()` function is used in SSE-streamed HTML (submit progress steps, activity feed entries), so icons arrive inline in those patches too.

## How it works

The entire UI is a single HTML page served by Go. Datastar turns HTML attributes into reactive bindings:

```html
<!-- data-bind keeps the signal and the component in sync -->
<ty-input data-bind="name" debounce="400"
  data-on:change="@get('/api/validate?field=name')"
  data-attr:error="$nameError ? $nameError : null">
</ty-input>
```

When the user types, Datastar calls `GET /api/validate?field=name&datastar={"name":"..."}`. The Go handler responds with a single SSE event:

```
event: datastar-patch-signals
data: signals {"nameError":"Name must be at least 2 characters"}
```

Datastar merges the signal, and `data-attr:error` immediately reflects it on the component — no JavaScript written by hand.

On submit, the server streams four progress events (each patching `#submit-progress`), then sets `$modalOpen = true` which opens the modal via `data-attr:open`.

The `/api/live` route is a persistent SSE connection established via `data-on:load="@get('/api/live')"`. It streams random queue activity every 2 seconds directly into `ty-scroll-container`.

## File structure

```
datastar-go/
├── main.go     # HTTP server, SSE helpers, all handlers + embedded HTML
└── go.mod      # Standard library only (Go 1.22+)
```
