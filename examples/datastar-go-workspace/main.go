package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// ── Embedded icons ────────────────────────────────────────────────────────────
// SVG strings from Lucide. Slotted as light-DOM children of <ty-icon> so the
// browser renders them in place of the registry fallback — no client JS needed.

var lucideIcons = map[string]string{
	"activity":         `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`,
	"calendar":         `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
	"check":            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
	"compass":          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
	"file":             `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
	"info":             `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
	"key":              `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-3 3"/><path d="m18 5 3 3"/><path d="m15 5 3 3"/></svg>`,
	"layout":           `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
	"loader":           `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`,
	"mail":             `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`,
	"more":             `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
	"sparkles":         `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
	"settings":         `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
	"upload":           `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
	"user":             `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
	"users":            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
}

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

var renderedHTML = strings.NewReplacer(
	`{icon:layout:sm}`,     tyIcon("layout", `size="sm"`),
	`{icon:users:sm}`,      tyIcon("users", `size="sm"`),
	`{icon:calendar:sm}`,   tyIcon("calendar", `size="sm"`),
	`{icon:file:sm}`,       tyIcon("file", `size="sm"`),
	`{icon:compass:sm}`,    tyIcon("compass", `size="sm"`),
	`{icon:compass:lg}`,    tyIcon("compass", `size="lg" class="ty-text-primary"`),
	`{icon:settings}`,      tyIcon("settings", `size="sm"`),
	`{icon:settings:lg}`,   tyIcon("settings", `size="lg" class="ty-text-primary"`),
	`{icon:info:xs}`,       tyIcon("info", `size="xs"`),
	`{icon:key:start}`,     tyIcon("key", `slot="start"`),
	`{icon:upload:start}`,  tyIcon("upload", `slot="start"`),
	`{icon:more}`,          tyIcon("more", `size="sm"`),
	`{icon:activity:pulse}`, tyIcon("activity", `size="sm" pulse`),
	`{icon:user:start}`,    tyIcon("user", `slot="start"`),
	`{icon:user:lg}`,       tyIcon("user", `size="lg" class="ty-text-primary"`),
	`{icon:mail:start}`,    tyIcon("mail", `slot="start"`),
	`{icon:check}`,         tyIcon("check", `size="sm"`),
	`{icon:check:lg}`,      tyIcon("check", `size="lg" class="ty-text-success"`),
	`{icon:sparkles}`,      tyIcon("sparkles", `size="sm" class="ty-text-warning"`),
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

func patchElements(w http.ResponseWriter, html string, opts ...string) {
	var sb strings.Builder
	sb.WriteString("event: datastar-patch-elements\n")
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

// ── Domain data ──────────────────────────────────────────────────────────────

type member struct {
	Name   string
	Role   string
	Skills []string
	Status string // active | away | offline
}

var members = []member{
	{"Alice Chen", "Engineering Lead", []string{"backend", "devops"}, "active"},
	{"Bob Rivera", "Senior Frontend", []string{"frontend", "design"}, "active"},
	{"Cara Müller", "Product Designer", []string{"design", "frontend"}, "away"},
	{"Diego López", "Mobile Developer", []string{"mobile", "frontend"}, "active"},
	{"Erin Patel", "QA Engineer", []string{"qa", "backend"}, "offline"},
	{"Felix Tanaka", "Product Manager", []string{"pm"}, "active"},
	{"Greta Olsson", "Senior Backend", []string{"backend"}, "active"},
	{"Hassan Ahmadi", "DevOps Engineer", []string{"devops", "backend"}, "away"},
}

func hasAnySkill(m member, want []string) bool {
	if len(want) == 0 {
		return true
	}
	for _, w := range want {
		w = strings.TrimSpace(w)
		if w == "" {
			continue
		}
		for _, s := range m.Skills {
			if s == w {
				return true
			}
		}
	}
	return false
}

func renderMembers(filter []string) string {
	var sb strings.Builder
	sb.WriteString(`<div id="members-list" class="flex flex-col gap-3">`)
	count := 0
	for _, m := range members {
		if !hasAnySkill(m, filter) {
			continue
		}
		count++
		statusFlavor := "neutral"
		switch m.Status {
		case "active":
			statusFlavor = "success"
		case "away":
			statusFlavor = "warning"
		}
		var skillTags strings.Builder
		for _, s := range m.Skills {
			fmt.Fprintf(&skillTags, `<ty-tag size="xs" flavor="primary" pill>%s</ty-tag>`, s)
		}
		fmt.Fprintf(&sb, `
<div class="ty-elevated p-3 rounded-lg flex items-center gap-3">
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="ty-text+ font-semibold">%s</span>
      <ty-tag size="xs" flavor="%s" pill>%s</ty-tag>
    </div>
    <div class="ty-text-- text-xs mt-0.5">%s</div>
    <div class="flex gap-1.5 mt-2 flex-wrap">%s</div>
  </div>
  <button type="button" class="ty-text- p-2 rounded relative" aria-label="Member actions">
    %s
    <ty-popup placement="bottom" offset="4">
      <div class="ty-floating p-1.5 rounded-lg flex flex-col w-44">
        <button type="button" class="text-left px-3 py-2 rounded text-sm hover:ty-bg-neutral-">View profile</button>
        <button type="button" class="text-left px-3 py-2 rounded text-sm hover:ty-bg-neutral-">Send message</button>
        <button type="button" class="text-left px-3 py-2 rounded text-sm hover:ty-bg-neutral- ty-text-danger">Remove from team</button>
      </div>
    </ty-popup>
  </button>
</div>`, m.Name, statusFlavor, m.Status, m.Role, skillTags.String(),
			tyIcon("more", `size="sm"`))
	}
	if count == 0 {
		sb.WriteString(`<p class="ty-text-- text-sm text-center py-8">No members match the selected skills.</p>`)
	}
	sb.WriteString(`</div>`)
	return sb.String()
}

// Deterministic events per date — same date → same list.
type event struct {
	Time  string
	Title string
}

var eventPool = []event{
	{"09:00", "Team standup"},
	{"10:30", "Design review with Cara"},
	{"11:00", "1:1 with Bob"},
	{"13:00", "Sprint planning"},
	{"14:30", "Customer demo"},
	{"15:00", "Architecture review"},
	{"16:00", "Hiring sync"},
	{"17:00", "Retrospective"},
}

func eventsFor(date string) []event {
	h := 0
	for _, c := range date {
		h = h*31 + int(c)
	}
	if h < 0 {
		h = -h
	}
	n := (h % 4) + 1
	out := make([]event, 0, n)
	for i := 0; i < n; i++ {
		out = append(out, eventPool[(h+i)%len(eventPool)])
	}
	return out
}

// Wizard step order
var wizardSteps = []string{"welcome", "profile", "preferences", "done"}

func stepIndex(id string) int {
	for i, s := range wizardSteps {
		if s == id {
			return i
		}
	}
	return -1
}

func completedUpTo(active string) string {
	idx := stepIndex(active)
	if idx <= 0 {
		return ""
	}
	return strings.Join(wizardSteps[:idx], ",")
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

func handleMembers(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	signals := parseSignals(r)
	filterStr := signalString(signals, "skillFilter")
	var filter []string
	if filterStr != "" {
		filter = strings.Split(filterStr, ",")
	}
	patchElements(w, renderMembers(filter))
}

func handleEvents(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	signals := parseSignals(r)
	date := signalString(signals, "selectedDate")
	if date == "" {
		patchElements(w, `<div id="events-list" class="ty-text-- text-sm text-center py-8">Pick a date to see the day's schedule.</div>`)
		return
	}
	events := eventsFor(date)
	var sb strings.Builder
	fmt.Fprintf(&sb, `<div id="events-list" class="flex flex-col gap-2"><div class="ty-text+ font-semibold text-sm mb-1">%s — %d event(s)</div>`, date, len(events))
	for _, e := range events {
		fmt.Fprintf(&sb, `<div class="ty-elevated p-3 rounded-lg flex items-center gap-3"><div class="ty-text- font-mono text-xs w-14">%s</div><div class="flex-1 ty-text">%s</div></div>`, e.Time, e.Title)
	}
	sb.WriteString(`</div>`)
	patchElements(w, sb.String())
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	signals := parseSignals(r)

	count := 1
	if v, ok := signals["uploadCount"]; ok {
		if f, ok := v.(float64); ok && f > 0 {
			count = int(f)
		}
	}

	for i := 1; i <= count; i++ {
		for p := 0; p <= 100; p += 25 {
			icon := tyIcon("upload", `size="sm" class="ty-text-primary"`)
			html := fmt.Sprintf(
				`<div id="upload-progress" class="flex items-center gap-3 ty-text- text-sm">%s<span>Uploading file %d of %d — %d%%</span></div>`,
				icon, i, count, p,
			)
			patchElements(w, html)
			time.Sleep(120 * time.Millisecond)
		}
	}

	patchSignals(w, map[string]any{"uploading": false})
	final := fmt.Sprintf(
		`<div id="upload-progress" class="flex items-center gap-3 ty-text-success text-sm">%s<span>%d file(s) uploaded successfully.</span></div>`,
		tyIcon("check", `size="sm"`), count,
	)
	patchElements(w, final)
}

var wizardEmailRe = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func handleWizardNext(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	signals := parseSignals(r)
	current := signalString(signals, "wizardActive")
	if current == "" {
		current = "welcome"
	}

	if current == "profile" {
		name := signalString(signals, "wizName")
		email := signalString(signals, "wizEmail")
		nameErr := ""
		emailErr := ""
		if name == "" {
			nameErr = "Please enter your full name"
		} else if len(name) < 2 {
			nameErr = "That seems a bit short"
		}
		if email == "" {
			emailErr = "Email is required"
		} else if !wizardEmailRe.MatchString(email) {
			emailErr = "Enter a valid email address"
		}
		if nameErr != "" || emailErr != "" {
			patchSignals(w, map[string]any{
				"wizNameError":  nameErr,
				"wizEmailError": emailErr,
			})
			return
		}
	}

	idx := stepIndex(current)
	if idx < 0 || idx >= len(wizardSteps)-1 {
		return
	}
	next := wizardSteps[idx+1]
	patchSignals(w, map[string]any{
		"wizardActive":    next,
		"wizardCompleted": completedUpTo(next),
		"wizNameError":    "",
		"wizEmailError":   "",
	})
}

func handleWizardBack(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	signals := parseSignals(r)
	current := signalString(signals, "wizardActive")
	idx := stepIndex(current)
	if idx <= 0 {
		return
	}
	prev := wizardSteps[idx-1]
	patchSignals(w, map[string]any{
		"wizardActive":    prev,
		"wizardCompleted": completedUpTo(prev),
		"wizNameError":    "",
		"wizEmailError":   "",
	})
}

func handleWizardReset(w http.ResponseWriter, r *http.Request) {
	sseHeaders(w)
	patchSignals(w, map[string]any{
		"wizardActive":      "welcome",
		"wizardCompleted":   "",
		"wizName":           "",
		"wizEmail":          "",
		"wizRole":           "Engineering",
		"wizTheme":          "system",
		"wizNotify":         true,
		"wizProductUpdates": false,
		"wizNameError":      "",
		"wizEmailError":     "",
	})
}

// ── HTML page ─────────────────────────────────────────────────────────────────

const indexHTMLTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tyrell + Datastar — Workspace</title>

  <script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@tc/dist/tyrell.js"></script>
  <link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@tc/css/tyrell.css">
  <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.8/bundles/datastar.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    body { font-family: system-ui, sans-serif; }
    /* Make the popup-trigger button visibly hoverable */
    .more-btn:hover { background: var(--ty-color-neutral-soft); }
    .more-btn { transition: background 120ms ease; }
    /* ty-resize-observer live width display via custom event */
    .panel-width::after { content: attr(data-width) " px"; }
  </style>
</head>
<body class="ty-canvas min-h-screen p-6 md:p-10"
  data-signals='{
    "skillFilter": "",
    "selectedDate": "",
    "uploading": false,
    "uploadCount": 0,
    "wizardActive": "welcome",
    "wizardCompleted": "",
    "wizName": "",
    "wizEmail": "",
    "wizRole": "Engineering",
    "wizTheme": "system",
    "wizNotify": true,
    "wizProductUpdates": false,
    "wizNameError": "",
    "wizEmailError": "",
    "panelWidth": 0
  }'>

  <div class="max-w-6xl mx-auto flex flex-col gap-8">

    <!-- ── Header ───────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="ty-text++ text-3xl font-bold">Acme Workspace</h1>
        <p class="ty-text- mt-1">A tour of every Tyrell component not covered in the support-ticket demo.</p>
      </div>

      <!-- Workspace settings popup (anchored to a regular button) -->
      <button type="button" class="more-btn ty-elevated px-4 py-2 rounded-lg flex items-center gap-2 ty-text- text-sm relative">
        {icon:settings}
        Settings
        <ty-popup placement="bottom" offset="6">
          <div class="ty-floating p-4 rounded-xl flex flex-col gap-3 w-64">
            <div class="ty-text+ font-semibold">Workspace settings</div>
            <label class="flex items-center justify-between gap-3 text-sm ty-text-">
              <span>Public visibility</span>
              <ty-switch></ty-switch>
            </label>
            <label class="flex items-center justify-between gap-3 text-sm ty-text-">
              <span>Allow guest invites</span>
              <ty-switch></ty-switch>
            </label>
            <p class="ty-text-- text-xs">Click outside or press ESC to close.</p>
          </div>
        </ty-popup>
      </button>
    </div>

    <!-- ── Tabs: the main navigation ────────────────────────────────────────── -->
    <ty-tabs width="100%" height="720px" active="overview">

      <!-- ─── Overview tab ──────────────────────────────────────────────────── -->
      <ty-tab id="overview" label="Overview">
        <div class="p-6 flex flex-col gap-6">

          <div class="grid md:grid-cols-3 gap-4">

            <!-- Metric card with tooltip -->
            <div class="ty-elevated p-4 rounded-xl flex flex-col gap-1">
              <div class="flex items-center gap-1.5">
                <span class="ty-text-- text-xs uppercase tracking-wide">Active members</span>
                <span class="relative inline-flex ty-text- cursor-help">
                  {icon:info:xs}
                  <ty-tooltip placement="top" flavor="dark">
                    Members marked &quot;active&quot; in the last 24 hours.
                  </ty-tooltip>
                </span>
              </div>
              <div class="ty-text++ text-2xl font-bold">5</div>
              <div class="flex gap-1.5">
                <ty-tag size="xs" flavor="success" pill>up 2</ty-tag>
                <ty-tag size="xs" flavor="neutral" pill>this week</ty-tag>
              </div>
            </div>

            <div class="ty-elevated p-4 rounded-xl flex flex-col gap-1">
              <div class="flex items-center gap-1.5">
                <span class="ty-text-- text-xs uppercase tracking-wide">Open tickets</span>
                <span class="relative inline-flex ty-text- cursor-help">
                  {icon:info:xs}
                  <ty-tooltip placement="top" flavor="dark">Tickets in the queue, regardless of priority.</ty-tooltip>
                </span>
              </div>
              <div class="ty-text++ text-2xl font-bold">12</div>
              <ty-tag size="xs" flavor="warning" pill>3 high priority</ty-tag>
            </div>

            <div class="ty-elevated p-4 rounded-xl flex flex-col gap-1">
              <div class="flex items-center gap-1.5">
                <span class="ty-text-- text-xs uppercase tracking-wide">Resolution time</span>
                <span class="relative inline-flex ty-text- cursor-help">
                  {icon:info:xs}
                  <ty-tooltip placement="top" flavor="dark">Median time-to-close across the last 30 days.</ty-tooltip>
                </span>
              </div>
              <div class="ty-text++ text-2xl font-bold">4.2h</div>
              <ty-tag size="xs" flavor="success" pill>↓ 18%</ty-tag>
            </div>

          </div>

          <!-- Copy-to-clipboard -->
          <div class="ty-elevated p-5 rounded-xl flex flex-col gap-3">
            <div class="ty-text+ font-semibold flex items-center gap-2">
              {icon:activity:pulse}
              API access
            </div>
            <ty-copy label="API key" format="code"
              value="sk_test_your_key_here">
              {icon:key:start}
            </ty-copy>
            <ty-copy label="Webhook URL"
              value="https://acme.workspace.dev/hooks/incoming/89a2b">
            </ty-copy>
          </div>

          <!-- ty-resize-observer demo -->
          <ty-resize-observer id="overview-panel">
            <div class="ty-elevated p-5 rounded-xl flex items-center justify-between gap-4 flex-wrap"
                 data-on-window:resize__debounce.150ms="$panelWidth = (window.tyResizeObserver && window.tyResizeObserver.getSize('overview-panel') || {width: 0}).width | 0"
                 data-on-load="$panelWidth = (window.tyResizeObserver && window.tyResizeObserver.getSize('overview-panel') || {width: 0}).width | 0">
              <div>
                <div class="ty-text+ font-semibold">Responsive panel</div>
                <p class="ty-text-- text-xs mt-0.5">Wrapped in &lt;ty-resize-observer&gt;. Resize the window to see live size.</p>
              </div>
              <div class="ty-text++ font-mono text-lg"><span data-text="$panelWidth"></span> px</div>
            </div>
          </ty-resize-observer>

        </div>
      </ty-tab>

      <!-- ─── Members tab ───────────────────────────────────────────────────── -->
      <ty-tab id="members" label="Members">
        <div class="p-6 flex flex-col gap-5">

          <div class="flex items-center gap-2 ty-text+ font-semibold">
            {icon:users:sm}
            Team
          </div>

          <ty-multiselect
            label="Filter by skill"
            placeholder="Pick one or more skills..."
            data-bind="skillFilter"
            data-on:change="@get('/api/members')">
            <ty-tag value="frontend" flavor="primary">Frontend</ty-tag>
            <ty-tag value="backend" flavor="primary">Backend</ty-tag>
            <ty-tag value="design" flavor="primary">Design</ty-tag>
            <ty-tag value="devops" flavor="primary">DevOps</ty-tag>
            <ty-tag value="mobile" flavor="primary">Mobile</ty-tag>
            <ty-tag value="qa" flavor="primary">QA</ty-tag>
            <ty-tag value="pm" flavor="primary">PM</ty-tag>
          </ty-multiselect>

          <div data-on-load="@get('/api/members')">
            <div id="members-list" class="ty-text-- text-sm text-center py-8">Loading members...</div>
          </div>
        </div>
      </ty-tab>

      <!-- ─── Calendar tab ──────────────────────────────────────────────────── -->
      <ty-tab id="calendar" label="Calendar">
        <div class="p-6 grid md:grid-cols-[auto_1fr] gap-6 items-start">

          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 ty-text+ font-semibold">
              {icon:calendar:sm}
              Pick a date
            </div>
            <ty-calendar
              data-on:change="$selectedDate = evt.detail.year + '-' + String(evt.detail.month).padStart(2,'0') + '-' + String(evt.detail.day).padStart(2,'0'); @get('/api/events')">
            </ty-calendar>
          </div>

          <div class="ty-elevated p-5 rounded-xl min-h-[280px]">
            <div id="events-list" class="ty-text-- text-sm text-center py-8">Pick a date to see the day's schedule.</div>
          </div>

        </div>
      </ty-tab>

      <!-- ─── Files tab ─────────────────────────────────────────────────────── -->
      <ty-tab id="files" label="Files">
        <div class="p-6 flex flex-col gap-5">

          <div class="flex items-center gap-2 ty-text+ font-semibold">
            {icon:file:sm}
            Project files
          </div>

          <ty-file-upload
            name="files"
            multiple
            accept="image/*,application/pdf"
            label="Drop files or click to browse"
            data-on:change="$uploadCount = evt.detail.files.length">
          </ty-file-upload>

          <div class="flex items-center justify-between gap-3">
            <div id="upload-progress" class="ty-text-- text-sm">No upload in progress.</div>
            <ty-button
              flavor="primary"
              type="button"
              data-attr:disabled="($uploadCount === 0 || $uploading) ? '' : null"
              data-on:click="$uploading = true; @post('/api/upload')">
              {icon:upload:start}
              Upload <span data-text="$uploadCount"></span> file(s)
            </ty-button>
          </div>

          <div class="ty-elevated p-4 rounded-xl flex flex-col gap-2 mt-2">
            <div class="ty-text- text-sm font-semibold">Existing files</div>
            <div class="flex items-center gap-3 py-1.5 border-t ty-border-neutral-">
              <span class="ty-text-">spec.pdf</span>
              <ty-tag size="xs" flavor="neutral" pill>pdf</ty-tag>
              <span class="ml-auto ty-text-- text-xs font-mono">128 KB</span>
            </div>
            <div class="flex items-center gap-3 py-1.5 border-t ty-border-neutral-">
              <span class="ty-text-">hero-banner.png</span>
              <ty-tag size="xs" flavor="info" pill>image</ty-tag>
              <span class="ml-auto ty-text-- text-xs font-mono">412 KB</span>
            </div>
            <div class="flex items-center gap-3 py-1.5 border-t ty-border-neutral-">
              <span class="ty-text-">README.md</span>
              <ty-tag size="xs" flavor="success" pill>doc</ty-tag>
              <span class="ml-auto ty-text-- text-xs font-mono">3 KB</span>
            </div>
          </div>

        </div>
      </ty-tab>

      <!-- ─── Onboarding (wizard) tab ──────────────────────────────────────── -->
      <ty-tab id="onboarding" label="Onboarding">
        <div class="p-6">

          <div class="flex items-center justify-between gap-2 mb-4">
            <div class="flex items-center gap-2 ty-text+ font-semibold">
              {icon:compass:sm}
              New-member onboarding
            </div>
            <div class="ty-text-- text-xs">
              Step <span data-text="(['welcome','profile','preferences','done'].indexOf($wizardActive) + 1)"></span> of 4
            </div>
          </div>

          <ty-wizard
            width="100%" height="600px"
            data-attr:active="$wizardActive"
            data-attr:completed="$wizardCompleted">

            <!-- ── Step 1: Welcome ──────────────────────────────────────────── -->
            <ty-step id="welcome" label="Welcome" description="Quick intro">
              <div class="p-8 max-w-xl mx-auto flex flex-col items-center gap-5 text-center">

                <div class="ty-bg-primary- rounded-full p-5 flex items-center justify-center">
                  {icon:compass:lg}
                </div>

                <div class="flex flex-col gap-2">
                  <h3 class="ty-text++ text-2xl font-bold">Welcome to Acme Workspace</h3>
                  <p class="ty-text- max-w-md">Let's set up your account in three quick steps. It takes about a minute and you can change everything later.</p>
                </div>

                <div class="grid grid-cols-3 gap-3 w-full mt-2">
                  <div class="ty-elevated rounded-lg p-3 flex flex-col items-center gap-1.5">
                    {icon:user:lg}
                    <p class="text-xs ty-text- font-medium">Your profile</p>
                    <p class="ty-text-- text-[10px]">Name &amp; email</p>
                  </div>
                  <div class="ty-elevated rounded-lg p-3 flex flex-col items-center gap-1.5">
                    {icon:settings:lg}
                    <p class="text-xs ty-text- font-medium">Preferences</p>
                    <p class="ty-text-- text-[10px]">Theme &amp; alerts</p>
                  </div>
                  <div class="ty-elevated rounded-lg p-3 flex flex-col items-center gap-1.5">
                    {icon:check:lg}
                    <p class="text-xs ty-text- font-medium">Done</p>
                    <p class="ty-text-- text-[10px]">Ready to go</p>
                  </div>
                </div>

                <ty-button flavor="primary" size="lg" data-on:click="@post('/api/wizard/next')" class="mt-3">
                  Get started
                </ty-button>

              </div>
            </ty-step>

            <!-- ── Step 2: Profile ──────────────────────────────────────────── -->
            <ty-step id="profile" label="Profile" description="Tell us about you">
              <div class="p-6 max-w-md mx-auto flex flex-col gap-5">

                <div>
                  <h3 class="ty-text++ text-xl font-bold">About you</h3>
                  <p class="ty-text-- text-sm mt-1">We'll use this to set up your account and personalize your view.</p>
                </div>

                <ty-input
                  label="Full name"
                  required
                  data-bind="wizName"
                  data-attr:error="$wizNameError ? $wizNameError : null">
                  {icon:user:start}
                </ty-input>

                <ty-input
                  label="Work email"
                  type="email"
                  required
                  data-bind="wizEmail"
                  data-attr:error="$wizEmailError ? $wizEmailError : null">
                  {icon:mail:start}
                </ty-input>

                <ty-dropdown label="Role" data-bind="wizRole">
                  <ty-option value="Engineering">Engineering</ty-option>
                  <ty-option value="Design">Design</ty-option>
                  <ty-option value="Product">Product</ty-option>
                  <ty-option value="Support">Support</ty-option>
                  <ty-option value="Other">Other</ty-option>
                </ty-dropdown>

                <div class="flex justify-between gap-3 mt-2">
                  <ty-button flavor="neutral" outlined data-on:click="@post('/api/wizard/back')">Back</ty-button>
                  <ty-button flavor="primary" data-on:click="@post('/api/wizard/next')">Continue</ty-button>
                </div>
              </div>
            </ty-step>

            <!-- ── Step 3: Preferences ──────────────────────────────────────── -->
            <ty-step id="preferences" label="Preferences" description="Theme &amp; notifications">
              <div class="p-6 max-w-md mx-auto flex flex-col gap-5">

                <div>
                  <h3 class="ty-text++ text-xl font-bold">Preferences</h3>
                  <p class="ty-text-- text-sm mt-1">You can change these later from your settings.</p>
                </div>

                <div class="flex flex-col gap-2">
                  <p class="ty-text font-medium text-sm">Theme</p>
                  <ty-radio-group orientation="horizontal"
                    data-attr:value="$wizTheme"
                    data-on:change="$wizTheme = evt.detail.value">
                    <label class="flex items-center gap-2 cursor-pointer"><ty-radio value="light"></ty-radio> Light</label>
                    <label class="flex items-center gap-2 cursor-pointer"><ty-radio value="dark"></ty-radio> Dark</label>
                    <label class="flex items-center gap-2 cursor-pointer"><ty-radio value="system"></ty-radio> System</label>
                  </ty-radio-group>
                </div>

                <div class="flex flex-col gap-3 pt-3 border-t ty-border-neutral-">
                  <label class="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p class="ty-text font-medium text-sm">Weekly digest</p>
                      <p class="ty-text-- text-xs">A Monday summary of activity in your workspace</p>
                    </div>
                    <ty-switch
                      data-attr:value="$wizNotify ? '' : null"
                      data-on:change="$wizNotify = evt.detail.value"></ty-switch>
                  </label>
                  <label class="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p class="ty-text font-medium text-sm">Product updates</p>
                      <p class="ty-text-- text-xs">New features and changelog announcements</p>
                    </div>
                    <ty-switch
                      data-attr:value="$wizProductUpdates ? '' : null"
                      data-on:change="$wizProductUpdates = evt.detail.value"></ty-switch>
                  </label>
                </div>

                <div class="flex justify-between gap-3 mt-2">
                  <ty-button flavor="neutral" outlined data-on:click="@post('/api/wizard/back')">Back</ty-button>
                  <ty-button flavor="primary" data-on:click="@post('/api/wizard/next')">Continue</ty-button>
                </div>
              </div>
            </ty-step>

            <!-- ── Step 4: Done ─────────────────────────────────────────────── -->
            <ty-step id="done" label="Done" description="All set">
              <div class="p-6 max-w-md mx-auto flex flex-col gap-5">

                <div class="flex flex-col items-center gap-3 text-center">
                  <div class="ty-bg-success- rounded-full p-4 flex items-center justify-center">
                    {icon:check:lg}
                  </div>
                  <div>
                    <h3 class="ty-text++ text-2xl font-bold">You're all set!</h3>
                    <p class="ty-text- mt-1">
                      Welcome, <strong data-text="$wizName || 'friend'"></strong>. Your account is ready.
                    </p>
                  </div>
                </div>

                <!-- Summary card -->
                <div class="ty-elevated rounded-xl p-4 flex flex-col gap-2.5">
                  <div class="flex items-center gap-1.5 mb-1">
                    {icon:sparkles}
                    <p class="ty-text-- text-xs uppercase tracking-wide font-semibold">Your details</p>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="ty-text-">Name</span>
                    <span class="ty-text font-medium" data-text="$wizName"></span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="ty-text-">Email</span>
                    <span class="ty-text font-medium font-mono text-xs" data-text="$wizEmail"></span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="ty-text-">Role</span>
                    <ty-tag size="xs" flavor="primary" pill><span data-text="$wizRole"></span></ty-tag>
                  </div>
                  <div class="flex items-center justify-between text-sm pt-2 border-t ty-border-neutral-">
                    <span class="ty-text-">Theme</span>
                    <ty-tag size="xs" flavor="neutral" pill><span data-text="$wizTheme"></span></ty-tag>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="ty-text-">Weekly digest</span>
                    <ty-tag size="xs" data-attr:flavor="$wizNotify ? 'success' : 'neutral'" pill>
                      <span data-text="$wizNotify ? 'enabled' : 'off'"></span>
                    </ty-tag>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="ty-text-">Product updates</span>
                    <ty-tag size="xs" data-attr:flavor="$wizProductUpdates ? 'success' : 'neutral'" pill>
                      <span data-text="$wizProductUpdates ? 'enabled' : 'off'"></span>
                    </ty-tag>
                  </div>
                </div>

                <div class="flex justify-center gap-3 mt-1">
                  <ty-button flavor="neutral" outlined data-on:click="@post('/api/wizard/reset')">Start over</ty-button>
                  <ty-button flavor="primary">Go to dashboard</ty-button>
                </div>

              </div>
            </ty-step>

          </ty-wizard>

        </div>
      </ty-tab>

    </ty-tabs>

  </div>

</body>
</html>
`

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", handleIndex)
	mux.HandleFunc("/api/members", handleMembers)
	mux.HandleFunc("/api/events", handleEvents)
	mux.HandleFunc("/api/upload", handleUpload)
	mux.HandleFunc("/api/wizard/next", handleWizardNext)
	mux.HandleFunc("/api/wizard/back", handleWizardBack)
	mux.HandleFunc("/api/wizard/reset", handleWizardReset)

	addr := ":8081"
	log.Printf("Tyrell + Datastar workspace example at http://localhost%s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
