# Tyrell + Datastar + Go

A self-contained Go server demonstrating how Tyrell web components compose naturally with [Datastar](https://data-star.dev) SSE-driven reactivity.

**No external Go dependencies** — standard library only. No build step for the server.

Uses **tyrell-components `1.0.0-RC20`** (pinned on jsDelivr, so the page is reproducible) and **Datastar `v1.0.0-RC.8`**.

## What it shows

| Pattern | Where |
|---|---|
| **Server-rendered icons** — Go puts `<svg>` inside `<ty-icon>` slot, zero icon JS | All icon usages |
| A real `<form>` + `data-on:submit__prevent="@post(...)"` — native validation (`required`, `minlength`, `type="email"`) blocks the submit, shows each message under its field and focuses the first bad one; no validation JS | Ticket form |
| Messages on blur after an edit, cleared as soon as the value is fixed; Enter in a field submits | Ticket form |
| Server-only rules (blocked email domains, message length) via `@get('/api/validate')` + `patch-signals`, shown through `data-attr:error` | Email, message |
| `data-bind` → ty-input, ty-textarea, ty-select, ty-date-picker | Form fields |
| `required no-clear` ty-select | Department |
| ty-radio-group with `data-bind` | Priority selection |
| ty-switch + ty-checkbox with `data-on:change` | Urgent flag, follow-up |
| Multi-step SSE progress stream on submit (`patch-elements`) | Submit button area |
| `data-attr:open` on ty-modal driven by server `patch-signals`; the page behind zooms out while it's open (default; `no-zoom` turns it off) | Success modal |
| Keep-alive SSE stream (`data-init="@get('/api/live')"`) prepending into ty-scroll-container | Live queue feed |
| Client-side signal inspector with `data-text` | Right panel |

## Run

```bash
cd examples/datastar-go
go run .                 # http://localhost:8080
PORT=8090 go run .       # if 8080 is taken
```

Go 1.22+. If `go` isn't on your PATH but Homebrew installed it, use
`/usr/local/Cellar/go/<version>/libexec/bin/go run .`.

### Try it

1. Press **Submit Ticket** with the form empty: no request is sent; every required field shows its message and focus jumps to *Your Name*.
2. Type one letter in *Your Name* and Tab away: "at least 2 characters" appears; type a second letter and it clears.
3. Enter `ada@example.com` and Tab: the server answers "We can't reply to example.com addresses" through the field's `error`; typing clears it.
4. Fill everything in (message ≥ 10 characters) and press **Enter** in any field: the form submits, progress streams in, the success modal opens and the page behind zooms out.
5. Press **Done**: the modal closes and the page zooms back.

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
<!-- The browser does required + email format; submit only fires when valid -->
<form data-on:submit__prevent="$submitting = true; @post('/api/submit')">
  <ty-input name="email" type="email" required data-bind="email"
    data-on:input="$emailError = ''"
    data-on:change="el.validity.valid && @get('/api/validate?field=email')"
    data-attr:error="$emailError ? $emailError : null">
  </ty-input>
  …
  <ty-button flavor="primary">Submit Ticket</ty-button>
</form>
```

The browser handles everything it can: `required`, `minlength` and the email format block the submit and show their messages in each field's error line. For a rule only the server knows, a valid email is checked on change: Datastar calls `GET /api/validate?field=email&datastar={"email":"..."}` and the Go handler answers with one SSE event:

```
event: datastar-patch-signals
data: signals {"emailError":"We can't reply to example.com addresses. Use your work email."}
```

Datastar merges the signal and `data-attr:error` shows it on the field; `data-on:input` clears it as soon as the user types again.

On submit, the server streams four progress events (each patching `#submit-progress`), then sets `$modalOpen = true` which opens the modal via `data-attr:open`.

The `/api/live` route is a persistent SSE connection opened by `data-init="@get('/api/live')"`. It streams random queue activity every 2 seconds, prepended (`mode prepend`) into `ty-scroll-container`. SSE needs a `data: elements` prefix on every line of the HTML, which `patchElements` adds.

## File structure

```
datastar-go/
├── main.go     # HTTP server, SSE helpers, all handlers + embedded HTML
└── go.mod      # Standard library only (Go 1.22+)
```
