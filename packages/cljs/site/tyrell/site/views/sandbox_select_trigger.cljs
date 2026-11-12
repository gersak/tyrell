(ns tyrell.site.views.sandbox-select-trigger
  "Hidden verification page — NOT linked from any nav, NOT in the docs/guide
   route lists. Reachable only by direct URL at /internal/select-trigger.

   ty-select with slot=\"trigger\": rc.21 (from the CDN) next to this build,
   each in its own iframe so both versions can be registered at once.

   The bug: the select's stub stayed a tab stop next to a focusable trigger,
   with its ring stripped, and all ARIA lived on the stub or on the trigger's
   host — so a ty-button trigger took two Tab presses, the first invisible,
   and a screen reader heard a bare \"Newest, button\".

   Expected in the right frame: one stop per select, each named after the
   label and what the trigger shows, with haspopup=listbox and a live
   aria-expanded.")

(def ^:private rc21 "https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-rc.21")

(def ^:private body
  "<button id='start'>start here</button>
   <ty-select label='Sort' value='new'><ty-button slot='trigger' size='md'>Newest</ty-button>
     <ty-option value='new'>Newest</ty-option><ty-option value='old'>Oldest</ty-option></ty-select>
   <ty-select label='Status' value='active'><ty-tag slot='trigger' flavor='success'>Active</ty-tag>
     <ty-option value='active'>Active</ty-option><ty-option value='paused'>Paused</ty-option></ty-select>
   <ty-select label='Filter' value='all'><ty-tag slot='trigger' clickable>All</ty-tag>
     <ty-option value='all'>All</ty-option><ty-option value='mine'>Mine</ty-option></ty-select>
   <ty-select label='Order' value='asc'><button slot='trigger'>Ascending</button>
     <ty-option value='asc'>Ascending</ty-option><ty-option value='desc'>Descending</ty-option></ty-select>
   <button id='end'>end</button>
   <ol id='log'></ol>")

(def ^:private inspector
  "Logs every focus stop: where focus really is (inside shadow roots too) and
   what assistive tech gets there."
  "<script>
  const log = document.getElementById('log');
  addEventListener('focusin', () => {
    let a = document.activeElement; const host = a;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    if (!a || a.id === 'start') { log.replaceChildren(); return; }
    const by = a.getAttribute('aria-labelledby');
    const name = a.getAttribute('aria-label')
      || (by && a.getRootNode().getElementById(by)?.textContent.trim())
      || (a.classList.contains('select-stub') ? '' : (host === a ? a : host).textContent.replace(/\\s+/g, ' ').trim());
    const role = a.getAttribute('role') || ({ BUTTON: 'button', A: 'link' }[a.tagName] || 'generic');
    const where = host === a ? a.tagName.toLowerCase()
      : host.tagName.toLowerCase() + ' › ' + (a.classList.contains('select-stub') ? 'select wrapper' : a.tagName.toLowerCase());
    const li = document.createElement('li');
    li.textContent = where + ' — ' + role + ' \"' + (name || '(no name)') + '\" · haspopup=' +
      (a.getAttribute('aria-haspopup') || '—') + ' · expanded=' + (a.getAttribute('aria-expanded') || '—');
    if (a.id !== 'end' && (!name || !a.getAttribute('aria-haspopup'))) li.style.color = '#b42318';
    log.append(li);
  });
  </script>")

(defn- frame-html [script-src]
  (str "<!doctype html><html><head><meta charset='utf-8'>"
       "<link rel='stylesheet' href='" rc21 "/css/tyrell.css'>"
       "<link rel='stylesheet' href='" rc21 "/css/tyrell-theme.css'>"
       "<script src='" script-src "'></script>"
       "<style>body{font:14px system-ui;margin:16px;display:flex;flex-wrap:wrap;gap:12px;align-items:center}"
       "#log{flex-basis:100%;margin:12px 0 0;padding-left:20px;font:12px ui-monospace,monospace;line-height:1.9}</style>"
       "</head><body>" body inspector "</body></html>"))

(defn- frame [title hint script-src]
  [:div.ty-content.rounded-lg.p-4.space-y-2
   [:h2.ty-text+.font-semibold title]
   [:p.ty-text- {:style {:font-size "0.8rem"}} hint]
   [:iframe.w-full.rounded {:srcdoc (frame-html script-src)
                            :title title
                            :style {:height "470px" :border "0"}}]])

(defn view []
  [:div.p-6.max-w-6xl.mx-auto.space-y-6
   [:h1.text-2xl.font-bold.ty-text "ty-select custom trigger: focus and ARIA (hidden — /internal/select-trigger)"]
   [:p.ty-text-.max-w-3xl {:style {:font-size "0.875rem" :line-height "1.7"}}
    "In each frame, click " [:strong "start here"] ", then press Tab until " [:strong "end"]
    ". Every line is one Tab stop: where focus landed and what a screen reader gets there. "
    "Red lines are stops with no name or no \"opens a list\"."]
   [:div.grid.gap-4 {:style {:grid-template-columns "repeat(auto-fit, minmax(420px, 1fr))"}}
    (frame "Before: rc.21"
           "7 stops for 4 selects. The ty-button, the clickable tag and the native button each get an invisible \"select wrapper\" stop first; on the triggers themselves nothing says they open a list."
           (str rc21 "/dist/tyrell.js"))
    (frame "After: this build"
           "4 stops. Each is named \"Label: value\", announces haspopup=listbox, and flips aria-expanded when opened. The plain tag can't take focus, so the select is the stop and draws a ring."
           "/tyrell/tyrell.js")]])
