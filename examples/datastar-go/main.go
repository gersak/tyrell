package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// ── Embedded icons ────────────────────────────────────────────────────────────
// SVG strings extracted from tyrell-components/icons/lucide.
// ty-icon renders light-DOM children (slot) in preference to its registry
// fallback, so <ty-icon><svg>...</svg></ty-icon> works with zero client JS.

var lucideIcons = map[string]string{
	"activity": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`,
	"calendar": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
	"check":    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
	"code":     `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>`,
	"loader":   `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`,
	"mail":     `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`,
	"send":     `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>`,
	"user":     `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
}

// tyIcon returns a <ty-icon attrs>SVG</ty-icon> string for server-rendered HTML.
// attrs is a raw attribute string, e.g. `slot="start"` or `size="sm" pulse`.
func tyIcon(name, attrs string) string {
	svg, ok := lucideIcons[name]
	if !ok {
		return `<ty-icon></ty-icon>`
	}
	if attrs != "" {
		return `<ty-icon ` + attrs + `>` + svg + `</ty-icon>`
	}
	return `<ty-icon>` + svg + `</ty-icon>`
}

// renderedHTML is the index page with icon placeholders replaced at startup.
var renderedHTML = strings.NewReplacer(
	`{icon:user:start}`,       tyIcon("user", `slot="start"`),
	`{icon:mail:start}`,       tyIcon("mail", `slot="start"`),
	`{icon:calendar:start}`,   tyIcon("calendar", `slot="start"`),
	`{icon:send:start}`,       tyIcon("send", `slot="start"`),
	`{icon:activity:sm:pulse}`, tyIcon("activity", `size="sm" pulse`),
	`{icon:code:sm}`,          tyIcon("code", `size="sm"`),
	`{icon:check:lg:success}`, tyIcon("check", `size="lg" class="ty-text-success"`),
).Replace(indexHTMLTemplate)

// ── SSE helpers ──────────────────────────────────────────────────────────────

func sseHeaders(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
}

func flush(w http.ResponseWriter) {
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}
}

func patchSignals(w http.ResponseWriter, signals map[string]any) {
	b, _ := json.Marshal(signals)
	fmt.Fprintf(w, "event: datastar-patch-signals\ndata: signals %s\n\n", b)
	flush(w)
}

func patchElements(w http.ResponseWriter, selector, html string, opts ...string) {
	var sb strings.Builder
	sb.WriteString("event: datastar-patch-elements\n")
	if selector != "" {
		sb.WriteString("data: selector " + selector + "\n")
	}
	for _, opt := range opts {
		sb.WriteString("data: " + opt + "\n")
	}
	sb.WriteString("data: elements ")
	sb.WriteString(html)
	sb.WriteString("\n\n")
	fmt.Fprint(w, sb.String())
	flush(w)
}

func parseSignals(r *http.Request) map[string]any {
	signals := make(map[string]any)
	var raw string
	if r.Method == http.MethodGet {
		raw = r.URL.Query().Get("datastar")
	} else {
		body, _ := io.ReadAll(r.Body)
		raw = string(body)
	}
	if raw != "" {
		_ = json.Unmarshal([]byte(raw), &signals)
	}
	return signals
}

func signalString(signals map[string]any, key string) string {
	if v, ok := signals[key]; ok {
		if s, ok := v.(string); ok {
			return strings.TrimSpace(s)
		}
	}
	return ""
}

// ── Validation ────────────────────────────────────────────────────────────────

var emailRe = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func validateField(field, value string) string {
	switch field {
	case "name":
		if value == "" {
			return "Name is required"
		}
		if len(value) < 2 {
			return "Name must be at least 2 characters"
		}
	case "email":
		if value == "" {
			return "Email is required"
		}
		if !emailRe.MatchString(value) {
			return "Enter a valid email address"
		}
	case "message":
		if value == "" {
			return "Message is required"
		}
		if len(value) < 10 {
			return "Message must be at least 10 characters"
		}
	}
	return ""
}

// ── Live activity feed ────────────────────────────────────────────────────────

var activities = []string{
	"Agent assigned ticket #1042 (payment issue) to support tier 2",
	"Ticket #1041 resolved — customer confirmed fix",
	"New ticket #1043 opened: login not working on mobile",
	"Agent Sarah closed 3 tickets in the last hour",
	"SLA breach warning: ticket #1038 has been open 48 hours",
	"Customer rated ticket #1040 ★★★★★",
	"New ticket #1044 opened: invoice PDF blank",
	"Ticket #1039 escalated to engineering",
	"Agent Marcus is now online",
	"Ticket #1045 merged into #1037 (duplicate)",
}

// ── Handlers ──────────────────────────────────────────────────────────────────

func handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, renderedHTML)
}

func handleValidate(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	signals := parseSignals(r)
	field := r.URL.Query().Get("field")
	value := signalString(signals, field)

	time.Sleep(80 * time.Millisecond)

	errMsg := validateField(field, value)
	patchSignals(w, map[string]any{field + "Error": errMsg})
}

func handleSubmit(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	signals := parseSignals(r)

	name := signalString(signals, "name")
	email := signalString(signals, "email")
	message := signalString(signals, "message")

	nameErr := validateField("name", name)
	emailErr := validateField("email", email)
	msgErr := validateField("message", message)

	if nameErr != "" || emailErr != "" || msgErr != "" {
		patchSignals(w, map[string]any{
			"nameError":    nameErr,
			"emailError":   emailErr,
			"messageError": msgErr,
			"submitting":   false,
		})
		return
	}

	type step struct {
		label string
		delay time.Duration
	}
	steps := []step{
		{"Validating your request...", 600 * time.Millisecond},
		{"Routing to the right team...", 900 * time.Millisecond},
		{"Sending confirmation email...", 700 * time.Millisecond},
		{"Ticket created!", 400 * time.Millisecond},
	}

	for i, s := range steps {
		time.Sleep(s.delay)
		// Icons are server-rendered inline — same pattern as the static page
		iconHTML := tyIcon("loader", `size="sm" spin`)
		if i == len(steps)-1 {
			iconHTML = tyIcon("check", `size="sm"`)
		}
		html := fmt.Sprintf(
			`<div id="submit-progress" class="flex items-center gap-3 ty-text- text-sm">%s<span>%s</span></div>`,
			iconHTML, s.label,
		)
		patchElements(w, "#submit-progress", html)
	}

	time.Sleep(300 * time.Millisecond)

	log.Printf("Ticket submitted — name=%q email=%q department=%s priority=%s",
		name, email,
		signalString(signals, "department"),
		signalString(signals, "priority"),
	)

	patchSignals(w, map[string]any{
		"submitting": false,
		"modalOpen":  true,
	})
}

func handleLive(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	ctx := r.Context()
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			msg := activities[rand.Intn(len(activities))]
			ts := time.Now().Format("15:04:05")
			entryID := fmt.Sprintf("activity-%d", time.Now().UnixMilli())
			html := fmt.Sprintf(
				`<div id="%s" class="ty-text- text-xs font-mono border-b ty-border-neutral- pb-1"><span class="ty-text--">%s</span> %s</div>`,
				entryID, ts, msg,
			)
			patchElements(w, "#activity-feed", html, "mergeMode prepend")
		}
	}
}

// ── HTML page ─────────────────────────────────────────────────────────────────
// Icon slots use {icon:name:attrs} placeholders replaced by renderedHTML above.
// There is NO icon-registration script — ty-icon renders its slotted SVG child
// instead of the registry fallback, so icons work without any client-side JS.

const indexHTMLTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tyrell + Datastar — Support Ticket</title>

  <script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@tc/dist/tyrell.js"></script>
  <link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@tc/css/tyrell.css">
  <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.8/bundles/datastar.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>

  <style>body { font-family: system-ui, sans-serif; }</style>
</head>
<body class="ty-canvas min-h-screen p-6 md:p-10"
  data-signals='{
    "name": "",
    "email": "",
    "department": "engineering",
    "priority": "normal",
    "message": "",
    "urgent": false,
    "followUp": false,
    "preferredDate": "",
    "nameError": "",
    "emailError": "",
    "messageError": "",
    "submitting": false,
    "modalOpen": false
  }'>

  <div class="max-w-4xl mx-auto flex flex-col gap-8">

    <div>
      <h1 class="ty-text++ text-3xl font-bold">Open a Support Ticket</h1>
      <p class="ty-text- mt-1">Powered by Tyrell Components + Datastar + Go SSE</p>
    </div>

    <div class="grid md:grid-cols-[1fr_320px] gap-6 items-start">

      <!-- ── Left: ticket form ───────────────────────────────────────────── -->
      <div class="ty-elevated p-6 rounded-2xl flex flex-col gap-5">

        <ty-input
          label="Your Name"
          name="name"
          required
          debounce="400"
          data-bind="name"
          data-on:change="@get('/api/validate?field=name')"
          data-attr:error="$nameError ? $nameError : null">
          {icon:user:start}
        </ty-input>

        <ty-input
          label="Email Address"
          name="email"
          type="email"
          required
          debounce="400"
          data-bind="email"
          data-on:change="@get('/api/validate?field=email')"
          data-attr:error="$emailError ? $emailError : null">
          {icon:mail:start}
        </ty-input>

        <ty-dropdown
          label="Department"
          name="department"
          data-bind="department">
          <ty-option value="engineering">Engineering</ty-option>
          <ty-option value="billing">Billing</ty-option>
          <ty-option value="account">Account &amp; Access</ty-option>
          <ty-option value="other">Other</ty-option>
        </ty-dropdown>

        <div>
          <p class="ty-text- text-sm mb-2">Priority</p>
          <ty-radio-group
            name="priority"
            orientation="horizontal"
            data-attr:value="$priority"
            data-on:change="$priority = evt.detail.value">
            <label class="flex items-center gap-2"><ty-radio value="low"></ty-radio> Low</label>
            <label class="flex items-center gap-2"><ty-radio value="normal"></ty-radio> Normal</label>
            <label class="flex items-center gap-2"><ty-radio value="high"></ty-radio> High</label>
            <label class="flex items-center gap-2"><ty-radio value="critical"></ty-radio> Critical</label>
          </ty-radio-group>
        </div>

        <ty-textarea
          label="Describe your issue"
          name="message"
          required
          rows="4"
          debounce="600"
          data-bind="message"
          data-on:change="@get('/api/validate?field=message')"
          data-attr:error="$messageError ? $messageError : null">
        </ty-textarea>

        <ty-date-picker
          label="Preferred callback date (optional)"
          name="preferredDate"
          data-bind="preferredDate">
          {icon:calendar:start}
        </ty-date-picker>

        <div class="flex flex-col gap-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <ty-switch name="urgent" data-on:change="$urgent = evt.detail.value"></ty-switch>
            <span class="ty-text-">Mark as urgent</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <ty-checkbox name="followUp" data-on:change="$followUp = evt.detail.checked"></ty-checkbox>
            <span class="ty-text-">Request a follow-up call</span>
          </label>
        </div>

        <div class="flex flex-col gap-3 pt-2">
          <div id="submit-progress"></div>
          <ty-button
            flavor="primary"
            type="button"
            data-attr:disabled="$submitting ? '' : null"
            data-on:click="$submitting = true; @post('/api/submit')">
            {icon:send:start}
            Submit Ticket
          </ty-button>
        </div>
      </div>

      <!-- ── Right: live feed + signal inspector ───────────────────────────── -->
      <div class="flex flex-col gap-4">

        <div class="ty-elevated rounded-2xl overflow-hidden">
          <div class="p-4 border-b ty-border-neutral-">
            <h2 class="ty-text+ font-semibold flex items-center gap-2">
              {icon:activity:sm:pulse}
              Live Queue
            </h2>
            <p class="ty-text-- text-xs mt-0.5">Real-time updates via SSE</p>
          </div>

          <div data-on:load="@get('/api/live')"></div>

          <ty-scroll-container max-height="280px">
            <div id="activity-feed" class="flex flex-col gap-2 p-3">
              <p class="ty-text-- text-xs text-center py-4">Connecting...</p>
            </div>
          </ty-scroll-container>
        </div>

        <div class="ty-elevated rounded-2xl overflow-hidden">
          <div class="p-4 border-b ty-border-neutral-">
            <h2 class="ty-text+ font-semibold flex items-center gap-2">
              {icon:code:sm}
              Signal Inspector
            </h2>
            <p class="ty-text-- text-xs mt-0.5">Client state, no server needed</p>
          </div>
          <div class="p-4 font-mono text-xs ty-text- flex flex-col gap-1">
            <div class="flex justify-between"><span class="ty-text--">name</span><span data-text="$name || '—'"></span></div>
            <div class="flex justify-between"><span class="ty-text--">email</span><span data-text="$email || '—'"></span></div>
            <div class="flex justify-between"><span class="ty-text--">department</span><span data-text="$department"></span></div>
            <div class="flex justify-between"><span class="ty-text--">priority</span><span data-text="$priority"></span></div>
            <div class="flex justify-between"><span class="ty-text--">urgent</span><span data-text="$urgent ? 'yes' : 'no'"></span></div>
            <div class="flex justify-between"><span class="ty-text--">followUp</span><span data-text="$followUp ? 'yes' : 'no'"></span></div>
            <div class="flex justify-between"><span class="ty-text--">preferredDate</span><span data-text="$preferredDate || '—'"></span></div>
            <div class="flex justify-between border-t ty-border-neutral- pt-2 mt-1">
              <span class="ty-text--">nameError</span>
              <span class="ty-text-danger" data-text="$nameError || '✓'"></span>
            </div>
            <div class="flex justify-between">
              <span class="ty-text--">emailError</span>
              <span class="ty-text-danger" data-text="$emailError || '✓'"></span>
            </div>
            <div class="flex justify-between">
              <span class="ty-text--">messageError</span>
              <span class="ty-text-danger" data-text="$messageError || '✓'"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ty-modal
    data-attr:open="$modalOpen ? '' : null"
    data-on:close="$modalOpen = false">
    <div class="ty-floating p-8 rounded-2xl flex flex-col gap-4 max-w-sm w-full mx-auto">
      <div class="flex items-center gap-3">
        {icon:check:lg:success}
        <h2 class="ty-text++ text-xl font-bold">Ticket Submitted!</h2>
      </div>
      <p class="ty-text-">
        We've received your request and will get back to you at
        <strong data-text="$email"></strong>.
      </p>
      <ty-button flavor="primary" data-on:click="$modalOpen = false; $name = ''; $email = ''; $message = ''">
        Done
      </ty-button>
    </div>
  </ty-modal>

</body>
</html>
`

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", handleIndex)
	mux.HandleFunc("/api/validate", handleValidate)
	mux.HandleFunc("/api/submit", handleSubmit)
	mux.HandleFunc("/api/live", handleLive)

	addr := ":8080"
	log.Printf("Tyrell + Datastar example running at http://localhost%s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
