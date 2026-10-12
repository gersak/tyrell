(ns tyrell.site.views.sandbox-tabs-morph
  "Hidden verification page — /internal/tabs-morph. NOT linked from nav or search.

   ty-tabs re-rendered by a server morph (Datastar patch-elements, htmx). A
   morph rewrites the element from server HTML: attributes become exactly the
   server's, children are matched by id and morphed in place. Each scenario
   mounts a fresh ty-tabs, does what a user/server would, morphs it with real
   idiomorph (htmx's morph, loaded from unpkg) and checks the result."
  (:require
   [clojure.string :as str]
   [tyrell.site.state :as state]))

(def ^:private idiomorph-url "https://unpkg.com/idiomorph@0.7.3/dist/idiomorph.min.js")

(defn- tabs-html
  "What the server renders. `attrs` go on ty-tabs; `tabs` are [id label content]."
  ([attrs] (tabs-html attrs [["a" "A" "Panel A"] ["b" "B" "Panel B"] ["c" "C" "Panel C"]]))
  ([attrs tabs]
   (str "<ty-tabs" (apply str (for [[k v] attrs] (str " " k "=\"" v "\""))) ">"
        (apply str (for [[id label content] tabs]
                     (str "<ty-tab id=\"" id "\" label=\"" label "\">" content "</ty-tab>")))
        "</ty-tabs>")))

(def ^:private server (tabs-html {"height" "240px"}))

;; A has content; Reports and Billing load on demand. Billing brings its own
;; placeholder and error message, Reports uses the built-in ones.
(def ^:private billing-slots
  "<div slot=\"loading\">Loading billing…</div><span slot=\"error\">Billing is down.</span>")

(def ^:private lazy-server
  (str "<ty-tabs height=\"240px\">"
       "<ty-tab id=\"a\" label=\"A\">Panel A</ty-tab>"
       "<ty-tab id=\"b\" label=\"Reports\" lazy></ty-tab>"
       "<ty-tab id=\"c\" label=\"Billing\" lazy>" billing-slots "</ty-tab>"
       "</ty-tabs>"))

;; ---------------------------------------------------------------------------
;; DOM helpers

(defn- wait [ms] (js/Promise. (fn [resolve] (js/setTimeout resolve ms))))
(defn- frame [] (js/Promise. (fn [resolve] (js/requestAnimationFrame #(js/requestAnimationFrame resolve)))))

(defn- stage [] (.getElementById js/document "tm-stage"))
(defn- tabs-el [] (some-> (stage) (.querySelector "ty-tabs")))

(defn- morph! [^js node html]
  (.morph js/Idiomorph node html #js {:morphStyle "outerHTML"}))

(defn- click! [^js el id]
  (some-> (.-shadowRoot el) (.querySelector (str "[data-tab-id=\"" id "\"]")) .click))

(defn- visible-panels [^js el]
  (->> (.querySelectorAll el ":scope > ty-tab")
       (filter #(= "visible" (.-visibility (js/getComputedStyle %))))
       (mapv (fn [^js t] (.-id t)))))

(defn- tab [^js el id] (.querySelector el (str ":scope > #" id)))

(defn- tab-panel [^js tab] (.querySelector (.-shadowRoot tab) ".tab-panel"))

(defn- load-state
  "What a lazy tab shows besides content: \"loading\", \"failed\" or \"none\"."
  [^js tab]
  (let [^js panel (tab-panel tab)]
    (or (.. panel -dataset -load) "none")))

(defn- slot-text [^js tab slot-name]
  (let [^js slot (.querySelector (.-shadowRoot tab) (str "slot[name=\"" slot-name "\"]"))]
    (str/join (map (fn [^js n] (.-textContent n)) (.assignedNodes slot)))))

(defn- load-snapshot [^js tab]
  (let [shown? (fn [part]
                 (not= "none" (.-display (js/getComputedStyle (.querySelector (.-shadowRoot tab) (str ".tab-" part))))))]
    {:state (load-state tab)
     :loading? (shown? "loading")
     :error? (shown? "error")
     :spinner? (some? (.querySelector (.-shadowRoot tab) ".tab-spinner svg"))
     :busy (.getAttribute (tab-panel tab) "aria-busy")}))

(defn- transform [^js el]
  (some-> (.-shadowRoot el) (.querySelector ".panels-wrapper") .-style .-transform))

(defn- readout [^js el]
  (when el
    (let [rect (.getBoundingClientRect el)
          shown (.-activeTab el)]
      {:active-tab shown
       :active-attr (.getAttribute el "active")
       :host-style (.getAttribute el "style")
       :size (str (js/Math.round (.-width rect)) " × " (js/Math.round (.-height rect)))
       :visible (visible-panels el)
       :panel-attrs (some->> (when shown (.querySelector el (str ":scope > #" shown)))
                             .-attributes (map (fn [^js a] (.-name a))) sort (str/join " "))
       :transform (transform el)
       :load (some->> shown (tab el) load-state)})))

;; ---------------------------------------------------------------------------
;; Scenarios. :setup is the first server render, :before runs on it (user
;; clicks etc.), events are recorded from then on, :act is the morph (may
;; return a promise), :check returns [[ok? "what"] ...] once things settled.

(defn- check [ok? what] [(boolean ok?) what])

(def ^:private scenarios
  [{:id :keep
    :title "Re-render without active keeps the user's tab"
    :setup server
    :before #(click! % "b")
    :act #(morph! % server)
    :check (fn [^js el events]
             [(check (= "b" (.-activeTab el)) "activeTab is b")
              (check (= ["b"] (visible-panels el)) "only panel b visible")
              (check (empty? events) "no ty-tab-change")
              (check (nil? (.getAttribute el "style")) "host has no style attribute")])}

   {:id :size
    :title "Re-render keeps size, carousel and panel attributes"
    :setup server
    :before #(click! % "c")
    :act #(morph! % server)
    :check (fn [^js el _]
             (let [attrs (set (map (fn [^js a] (.-name a)) (.-attributes (.querySelector el ":scope > #c"))))]
               [(check (< (js/Math.abs (- 240 (.-height (.getBoundingClientRect el)))) 1) "height 240px from the attribute")
                (check (= "translateX(-200%)" (transform el)) "carousel on panel c")
                (check (= ["c"] (visible-panels el)) "only panel c visible")
                (check (not-any? attrs ["role" "tabindex" "style" "aria-labelledby"])
                       "panel has no role/tabindex/style/aria attributes")]))}

   {:id :switch
    :title "Re-render with a different active switches, one event"
    :setup server
    :before #(click! % "b")
    :act #(morph! % (tabs-html {"height" "240px" "active" "c"}))
    :check (fn [^js el events]
             [(check (= "c" (.-activeTab el)) "activeTab is c")
              (check (= ["c"] (visible-panels el)) "only panel c visible")
              (check (= ["b→c"] events) (str "events " (pr-str events) " = [\"b→c\"]"))])}

   {:id :add
    :title "Add a tab and activate it in one morph, one event"
    :setup server
    :act #(morph! % (tabs-html {"height" "240px" "active" "d"}
                               [["a" "A" "Panel A"] ["b" "B" "Panel B"] ["c" "C" "Panel C"] ["d" "D" "Panel D"]]))
    :check (fn [^js el events]
             [(check (= ["a→d"] events) (str "events " (pr-str events) " = [\"a→d\"]"))
              (check (= ["d"] (visible-panels el)) "only panel d visible")
              (check (.querySelector (.-shadowRoot el) "[data-tab-id=\"d\"][aria-selected=\"true\"]")
                     "button d exists and is selected")
              (check (= "translateX(-300%)" (transform el)) "carousel on panel d")])}

   {:id :remove
    :title "Remove the shown tab, falls back to the first"
    :setup server
    :before #(click! % "c")
    :act #(morph! % (tabs-html {"height" "240px"} [["a" "A" "Panel A"] ["b" "B" "Panel B"]]))
    :check (fn [^js el events]
             [(check (= "a" (.-activeTab el)) "activeTab is a")
              (check (= ["a"] (visible-panels el)) "only panel a visible")
              (check (= ["∅→a"] events) (str "events " (pr-str events) " = [\"∅→a\"] (old tab is gone)"))])}

   {:id :insert
    :title "A tab inserted before the shown one keeps the carousel on it"
    :setup server
    :before #(click! % "b")
    :act #(morph! % (tabs-html {"height" "240px"}
                               [["z" "Z" "Panel Z"] ["a" "A" "Panel A"] ["b" "B" "Panel B"] ["c" "C" "Panel C"]]))
    :check (fn [^js el events]
             [(check (= "b" (.-activeTab el)) "activeTab is b")
              (check (= "translateX(-200%)" (transform el)) "carousel on b's new slot")
              (check (= ["b"] (visible-panels el)) "only panel b visible")
              (check (empty? events) "no ty-tab-change")])}

   {:id :label
    :title "A label/disabled change in place updates the button"
    :setup server
    :act #(morph! % (tabs-html {"height" "240px"}
                               [["a" "A" "Panel A"] ["b" "B (3)\" disabled=\"" "Panel B"] ["c" "C" "Panel C"]]))
    :check (fn [^js el _]
             (let [button (.querySelector (.-shadowRoot el) "[data-tab-id=\"b\"]")]
               [(check (= "B (3)" (str/trim (.-textContent button))) "button text is \"B (3)\"")
                (check (.-disabled button) "button is disabled")]))}

   {:id :panel
    :title "Content arrives 1.5s after the click (single-panel morphs)"
    ;; The placeholder is the app's own markup (see the lazy scenarios for ty's).
    :setup (tabs-html {"height" "240px"}
                      [["a" "A" "Panel A"] ["b" "B" "<em>Loading B… (server placeholder)</em>"] ["c" "C" "Panel C"]])
    :before #(click! % "b")
    :act (fn [^js el]
           (-> (wait 1500)
               (.then (fn []
                        (morph! (.querySelector el "#b") "<ty-tab id=\"b\" label=\"B\">Fresh B from the server</ty-tab>")
                        (morph! (.querySelector el "#a") "<ty-tab id=\"a\" label=\"A\">Fresh A from the server</ty-tab>")))))
    :check (fn [^js el events]
             [(check (= ["b"] (visible-panels el)) "only panel b visible")
              (check (= "Fresh B from the server" (.-textContent (.querySelector el "#b"))) "content replaced")
              (check (empty? events) "no ty-tab-change")])}

   {:id :css
    :title "height attribute beats page CSS; without it page CSS wins"
    :setup (tabs-html {"height" "240px" "class" "tm-sized"})
    :act #(morph! % (tabs-html {"class" "tm-sized"}))
    :check (fn [^js el _]
             [(check (< (js/Math.abs (- 320 (.-height (.getBoundingClientRect el)))) 1)
                     "after the morph dropped height: page CSS 320px")])}

   {:id :signal
    :title "Datastar data-attr + data-on: a click isn't reverted"
    :setup server
    :act (fn [^js el]
           ;; data-on:ty-tab-change="$tab = evt.detail.activeId"
           (let [signal (atom "a")]
             (set! (.-tmSignal el) signal)
             (.addEventListener el "ty-tab-change" (fn [^js e] (reset! signal (.. e -detail -activeId))))
             ;; data-attr:active="$tab" — writes the signal back when the attribute drifts
             (.observe (js/MutationObserver.
                        #(when (not= (.getAttribute el "active") @signal)
                           (.setAttribute el "active" @signal)))
                       el #js {:attributes true :attributeFilter #js ["active"]})
             (click! el "b")))
    :check (fn [^js el _]
             [(check (= "b" @(.-tmSignal el)) "signal is b")
              (check (= "b" (.getAttribute el "active")) "active attribute stays b")
              (check (= "b" (.-activeTab el)) "activeTab is b")])}

   {:id :initial
    :title "No event for the initial tab"
    :setup (tabs-html {"height" "240px" "active" "b"})
    :listen-from-mount? true
    :check (fn [^js el events]
             [(check (empty? events) "no ty-tab-change on mount")
              (check (= "b" (.-activeTab el)) "activeTab is b")])}

   {:id :correct
    :title "Correction right after mount snaps, reports the tab shown"
    :setup server
    :listen-from-mount? true
    :on-mount (fn [^js el] (.setAttribute el "active" "c"))
    :early-check (fn [^js el]
                   ;; one frame later: a snap is already at full opacity, a fade isn't
                   [(check (= "1" (.-opacity (js/getComputedStyle (.querySelector el "#c"))))
                           "panel c snapped in (no fade)")])
    :check (fn [^js el events]
             [(check (= ["a→c"] events) (str "events " (pr-str events) " = [\"a→c\"]"))
              (check (= "translateX(-200%)" (transform el)) "carousel on panel c")])}

   {:id :lazy
    :title "Lazy tab: built-in spinner while a 2s load runs, then the content"
    :setup lazy-server
    :listen-from-mount? true
    :act (fn [^js el]
           (.addEventListener (tab el "b") "ty-tab-load"
                              #(-> (wait 2000)
                                   (.then (fn [] (morph! (tab el "b") "<ty-tab id=\"b\" label=\"Reports\" lazy>Reports from the server</ty-tab>"))))
                              #js {:once true})
           (click! el "b")
           (-> (wait 400)
               (.then #(set! (.-tmLoading el) (load-snapshot (tab el "b"))))
               (.then #(wait 1800))))
    :check (fn [^js el events]
             (let [mid (.-tmLoading el)
                   b (tab el "b")]
               [(check (= ["a→b" "load:b"] events) (str "events " (pr-str events) " = [\"a→b\" \"load:b\"]"))
                (check (and (= "loading" (:state mid)) (:loading? mid) (:spinner? mid)) "after 0.4s: built-in spinner showing")
                (check (= "true" (:busy mid)) "after 0.4s: panel aria-busy")
                (check (= "none" (load-state b)) "content arrived: spinner gone")
                (check (nil? (.getAttribute (tab-panel b) "aria-busy")) "aria-busy cleared")
                (check (= "Reports from the server" (str/trim (.-textContent b))) "content is the server's")]))}

   {:id :lazy-retry
    :title "Lazy tab: load fails → slot=\"error\" + Retry; Retry loads it"
    :setup lazy-server
    :listen-from-mount? true
    :act (fn [^js el]
           (let [attempts (atom 0)
                 ^js c (tab el "c")]
             ;; The app's glue: first request fails, the retry succeeds.
             (.addEventListener c "ty-tab-load"
                                #(if (= 1 (swap! attempts inc))
                                   (-> (wait 1200) (.then (fn [] (.loadFailed c))))
                                   (-> (wait 1500)
                                       (.then (fn []
                                                (morph! (tab el "c") (str "<ty-tab id=\"c\" label=\"Billing\" lazy>"
                                                                          billing-slots "Billing from the server</ty-tab>")))))))
             (click! el "c")
             (-> (wait 400)
                 (.then #(set! (.-tmLoading el) (load-snapshot c)))
                 (.then #(wait 1200))
                 (.then (fn []
                          (set! (.-tmFailed el) (load-snapshot c))
                          (.click (.querySelector (.-shadowRoot c) ".tab-retry"))))
                 (.then #(wait 400))
                 (.then #(set! (.-tmRetry el) (load-snapshot c)))
                 (.then #(wait 1300)))))
    :check (fn [^js el events]
             (let [^js c (tab el "c")
                   loading (.-tmLoading el)
                   failed (.-tmFailed el)
                   retry (.-tmRetry el)]
               [(check (= ["a→c" "load:c" "load:c"] events) (str "events " (pr-str events) " = [\"a→c\" \"load:c\" \"load:c\"]"))
                (check (and (= "loading" (:state loading)) (:loading? loading)) "loading: slot=\"loading\" showing")
                (check (= "Loading billing…" (slot-text c "loading")) "placeholder is the app's")
                (check (and (= "failed" (:state failed)) (:error? failed) (not (:loading? failed))) "after loadFailed(): error showing")
                (check (= "Billing is down." (slot-text c "error")) "message is the app's")
                (check (= "loading" (:state retry)) "Retry: loading again")
                (check (= "none" (load-state c)) "second load arrived")
                (check (str/includes? (.-textContent c) "Billing from the server") "content is the server's")]))}

   {:id :lazy-rerender
    :title "A full re-render empties a loaded lazy tab: it loads again"
    :setup lazy-server
    :listen-from-mount? true
    :act (fn [^js el]
           (click! el "b")
           (morph! (tab el "b") "<ty-tab id=\"b\" label=\"Reports\" lazy>Reports</ty-tab>")
           (-> (wait 100)
               (.then #(morph! el lazy-server))))
    :check (fn [^js el events]
             [(check (= ["a→b" "load:b" "load:b"] events) (str "events " (pr-str events) " = [\"a→b\" \"load:b\" \"load:b\"]"))
              (check (= "loading" (load-state (tab el "b"))) "spinner again: the server's Reports is empty")
              (check (= ["b"] (visible-panels el)) "still on Reports")])}

   {:id :lazy-hidden
    :title "A re-render empties a hidden loaded tab: it loads when shown next"
    :setup lazy-server
    :listen-from-mount? true
    :act (fn [^js el]
           (click! el "c")
           (morph! (tab el "c") (str "<ty-tab id=\"c\" label=\"Billing\" lazy>" billing-slots "Billing</ty-tab>"))
           (-> (wait 100)
               (.then (fn [] (click! el "a") (morph! el lazy-server)))
               (.then #(wait 100))
               (.then (fn []
                        (set! (.-tmBefore el) (load-state (tab el "c")))
                        (click! el "c")))))
    :check (fn [^js el events]
             [(check (= ["a→c" "load:c" "c→a" "a→c" "load:c"] events)
                     (str "events " (pr-str events) " = [\"a→c\" \"load:c\" \"c→a\" \"a→c\" \"load:c\"]"))
              (check (= "none" (.-tmBefore el)) "hidden and emptied: no request, no spinner")
              (check (= "loading" (load-state (tab el "c"))) "shown again: loading")])}

   {:id :lazy-first
    :title "No ty-tab-load for the first tab, even a lazy empty one"
    :setup (str/replace lazy-server "<ty-tabs height=\"240px\">" "<ty-tabs height=\"240px\" active=\"b\">")
    :listen-from-mount? true
    :early-check (fn [^js el]
                   [(check (= "none" (load-state (tab el "b"))) "first tab: blank, no spinner (the page carries its content)")])
    :act (fn [^js el] (click! el "a") (click! el "b"))
    :check (fn [^js el events]
             [(check (= ["b→a" "a→b" "load:b"] events)
                     (str "events " (pr-str events) " = [\"b→a\" \"a→b\" \"load:b\"]: nothing on mount"))
              (check (= "loading" (load-state (tab el "b"))) "shown again by a click: loading")])}

   {:id :lazy-twice
    :title "Switching away and back while loading doesn't ask twice"
    :setup lazy-server
    :listen-from-mount? true
    :act (fn [^js el] (click! el "b") (click! el "a") (click! el "b"))
    :check (fn [^js el events]
             [(check (= ["a→b" "load:b" "b→a" "a→b"] events)
                     (str "events " (pr-str events) " = [\"a→b\" \"load:b\" \"b→a\" \"a→b\"]"))
              (check (= "loading" (load-state (tab el "b"))) "still loading")])}

   {:id :lazy-failed-again
    :title "Showing a failed tab again retries"
    :setup lazy-server
    :listen-from-mount? true
    :act (fn [^js el]
           (click! el "b")
           (.loadFailed (tab el "b"))
           (set! (.-tmFailed el) (load-snapshot (tab el "b")))
           (click! el "a")
           (click! el "b"))
    :check (fn [^js el events]
             (let [failed (.-tmFailed el)]
               [(check (and (= "failed" (:state failed)) (:error? failed)) "after loadFailed(): default error + Retry")
                (check (= ["a→b" "load:b" "b→a" "a→b" "load:b"] events)
                       (str "events " (pr-str events) " = [\"a→b\" \"load:b\" \"b→a\" \"a→b\" \"load:b\"]"))
                (check (= "loading" (load-state (tab el "b"))) "loading again")]))}

   {:id :lazy-server-active
    :title "The server switching active to a lazy tab fires ty-tab-load"
    :setup lazy-server
    :listen-from-mount? true
    :act #(morph! % (str/replace lazy-server "<ty-tabs height=\"240px\">" "<ty-tabs height=\"240px\" active=\"c\">"))
    :check (fn [^js el events]
             [(check (= ["a→c" "load:c"] events) (str "events " (pr-str events) " = [\"a→c\" \"load:c\"]"))
              (check (= "Loading billing…" (slot-text (tab el "c") "loading")) "app's placeholder showing")])}

   {:id :lazy-switch-content
    :title "The server switches to a lazy tab and sends its content in one morph: no load"
    :setup lazy-server
    :listen-from-mount? true
    :act #(morph! % (-> lazy-server
                        (str/replace "<ty-tabs height=\"240px\">" "<ty-tabs height=\"240px\" active=\"c\">")
                        (str/replace (str billing-slots "</ty-tab>") (str billing-slots "Billing from the server</ty-tab>"))))
    :check (fn [^js el events]
             [(check (= ["a→c"] events) (str "events " (pr-str events) " = [\"a→c\"]: c came with its content"))
              (check (= "none" (load-state (tab el "c"))) "no spinner")])}

   {:id :lazy-active-only
    :title "The server renders only the active panel: leaving a loaded tab doesn't reload it"
    :setup lazy-server
    :listen-from-mount? true
    :act (fn [^js el]
           (click! el "b")
           (morph! (tab el "b") "<ty-tab id=\"b\" label=\"Reports\" lazy>Reports</ty-tab>")
           (-> (wait 100)
               ;; next render: c active with content, b empty again
               (.then #(morph! el (-> lazy-server
                                      (str/replace "<ty-tabs height=\"240px\">" "<ty-tabs height=\"240px\" active=\"c\">")
                                      (str/replace (str billing-slots "</ty-tab>") (str billing-slots "Billing</ty-tab>")))))))
    :check (fn [^js el events]
             [(check (= ["a→b" "load:b" "b→c"] events) (str "events " (pr-str events) " = [\"a→b\" \"load:b\" \"b→c\"]"))
              (check (= "none" (load-state (tab el "b"))) "b hidden and empty: blank until shown again")])}

   {:id :lazy-nested
    :title "A lazy tab inside a lazy tab: only its own listener hears it"
    :setup (str "<ty-tabs height=\"240px\">"
                "<ty-tab id=\"a\" label=\"A\">Panel A</ty-tab>"
                "<ty-tab id=\"settings\" label=\"Settings\" lazy>"
                "<ty-tabs height=\"160px\"><ty-tab id=\"basic\" label=\"Basic\">Basic</ty-tab>"
                "<ty-tab id=\"advanced\" label=\"Advanced\" lazy></ty-tab></ty-tabs>"
                "</ty-tab></ty-tabs>")
    :act (fn [^js el]
           (let [^js settings (tab el "settings")
                 ^js inner (.querySelector settings "ty-tabs")
                 heard (atom [])]
             (set! (.-tmHeard el) heard)
             ;; per-tab glue, like hx-trigger / data-on:ty-tab-load on each tab
             (.addEventListener settings "ty-tab-load" #(swap! heard conj "settings"))
             (.addEventListener (tab inner "advanced") "ty-tab-load" #(swap! heard conj "advanced"))
             (click! el "settings")
             (-> (wait 300)
                 (.then #(click! inner "advanced")))))
    :check (fn [^js el _]
             (let [heard @(.-tmHeard el)]
               [(check (= ["advanced"] heard) (str "listeners heard " (pr-str heard) " = [\"advanced\"]"))
                (check (= "loading" (load-state (.querySelector el "#advanced"))) "advanced loading")]))}])

;; ---------------------------------------------------------------------------
;; Runner

(defn- sub [] (get @state/state :sandbox-tabs-morph {}))
(defn- put! [& kvs] (swap! state/state update :sandbox-tabs-morph #(apply assoc % kvs)))


(defn- load-idiomorph []
  (if (exists? js/Idiomorph)
    (js/Promise.resolve true)
    (js/Promise.
     (fn [resolve reject]
       (let [s (.createElement js/document "script")]
         (set! (.-src s) idiomorph-url)
         (set! (.-onload s) #(resolve true))
         (set! (.-onerror s) #(reject (js/Error. (str "could not load " idiomorph-url))))
         (.append (.-head js/document) s))))))

(defn- run-scenario
  "Mount a fresh ty-tabs from :setup, run the steps, record ty-tab-change as
   \"prev→active\" (∅ when the previous tab no longer exists) and ty-tab-load
   as \"load:id\"."
  [{:keys [id setup before act check early-check on-mount listen-from-mount?]}]
  (let [events (atom [])
        record (fn [^js e]
                 (let [d (.-detail e)]
                   (swap! events conj (str (or (.-previousId d) "∅") "→" (.-activeId d)))))
        record-load (fn [^js e] (swap! events conj (str "load:" (.. e -detail -id))))
        ;; ty-tab-load doesn't bubble: capture sees every tab's.
        listen! (fn [^js el]
                  (.addEventListener el "ty-tab-change" record)
                  (.addEventListener el "ty-tab-load" record-load true))]
    (put! :running id)
    (when listen-from-mount? (listen! (stage)))
    (set! (.-innerHTML (stage)) setup)
    (when on-mount (on-mount (tabs-el)))
    (-> (frame)
        (.then (fn []
                 (let [early (when early-check (early-check (tabs-el)))]
                   (when before (before (tabs-el)))
                   (-> (wait 50)
                       (.then (fn []
                                (when-not listen-from-mount? (listen! (tabs-el)))
                                (js/Promise.resolve (when act (act (tabs-el))))))
                       ;; past the 400ms panel fade, so "visible" is settled
                       (.then #(wait 600))
                       (.then (fn []
                                (.removeEventListener (stage) "ty-tab-change" record)
                                (.removeEventListener (stage) "ty-tab-load" record-load true)
                                (let [el (tabs-el)
                                      checks (into (vec early) (check el @events))]
                                  (put! :running nil :readout (readout el))
                                  (swap! state/state assoc-in [:sandbox-tabs-morph :results id]
                                         {:ok? (every? first checks) :checks checks}))))))))
        (.catch (fn [^js e]
                  (put! :running nil)
                  (swap! state/state assoc-in [:sandbox-tabs-morph :results id]
                         {:ok? false :checks [[false (str "threw: " (.-message e))]]}))))))

(defn- run-one! [scenario]
  (-> (load-idiomorph)
      (.then #(run-scenario scenario))
      (.catch (fn [^js e] (put! :error (.-message e))))))

(defn- run-all! []
  (put! :results {})
  (reduce (fn [p s] (.then p #(run-one! s))) (js/Promise.resolve nil) scenarios))

;; ---------------------------------------------------------------------------
;; View

(defn- result-row [{:keys [id title]} {:keys [ok? checks]} running?]
  [:div.ty-content.rounded-lg.p-3.space-y-1 {:replicant/key id}
   [:div.flex.items-center.justify-between.gap-3
    [:span.ty-text.font-semibold {:style {:font-size "0.875rem"}}
     (cond running? "… " (nil? ok?) "· " ok? "✅ " :else "❌ ") title]
    [:ty-button {:size "sm" :appearance "outlined" :on {:click #(run-one! (some (fn [s] (when (= id (:id s)) s)) scenarios))}}
     "Run"]]
   (for [[pass? what] checks]
     [:div.font-mono {:replicant/key what
                      :class (if pass? "ty-text--" "ty-text-danger")
                      :style {:font-size "0.75rem"}}
      (str (if pass? "  ✓ " "  ✗ ") what)])])

(defn view []
  (let [{:keys [results running readout error]} (sub)
        passed (count (filter :ok? (vals results)))]
    [:div.p-6.max-w-3xl.mx-auto.space-y-6
     [:style "ty-tabs.tm-sized { height: 320px; }"]
     [:h1.text-2xl.font-bold.ty-text "ty-tabs under server morphs (hidden — /internal/tabs-morph)"]
     [:p.ty-text-.max-w-2xl {:style {:font-size "0.875rem" :line-height "1.7"}}
      "Each scenario mounts a fresh " [:code "ty-tabs"] " from server HTML, acts like a user or "
      "server would, then re-renders it with real idiomorph (the morph htmx uses; Datastar's works "
      "the same way: attributes become exactly the server's, children are matched by id). "
      "Checks run after the 400ms panel fade. The lazy scenarios load slowly on purpose "
      "(1–2s) so you can watch the spinner, the error and Retry."]

     [:div.flex.items-center.gap-3
      [:ty-button {:flavor "primary" :on {:click run-all!}} "Run all"]
      (when (seq results)
        [:span.ty-text- {:style {:font-size "0.875rem"}} (str passed " / " (count scenarios) " passed")])
      (when error [:span.ty-text-danger {:style {:font-size "0.875rem"}} error])]

     [:div#tm-stage.ty-elevated.rounded-lg.p-4 {:style {:min-height "260px"}}]

     (when readout
       [:pre.ty-content.rounded-lg.p-3.ty-text-.font-mono {:style {:font-size "0.75rem" :margin 0}}
        (str/join "\n" (for [[k v] readout] (str (name k) ": " (pr-str v))))])

     [:div.space-y-2
      (for [s scenarios]
        (result-row s (get results (:id s)) (= running (:id s))))]]))
