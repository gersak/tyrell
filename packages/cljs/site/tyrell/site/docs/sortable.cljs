(ns tyrell.site.docs.sortable
  "Documentation for ty-sortable"
  (:require [tyrell.site.docs.common :refer [component-page page-section bento example api-section]]
            [tyrell.site.state :as state]))

;; Each demo's order lives in [:sortable-doc demo] as {list-id [key ...]}.
;; The change handler merges value.order into it and Replicant re-renders.

(def ^:private titles
  {"h1" "Inbox zero" "h2" "Code review" "h3" "Lunch"
   "a" "Design review" "b" "Fix login redirect" "c" "Update changelog" "d" "Plan the sprint"
   "k1" "Billing page" "k2" "Dark mode audit" "k3" "Search API"
   "k4" "Onboarding emails" "k5" "Rate limits" "k6" "Fix flaky test"
   "i1" "Crash on save" "i2" "CSV export" "i3" "Wrong total in cart" "i4" "Saved filters"
   "m1" "Draft the post" "m2" "Pick a cover image" "m3" "Schedule it" "m4" "Proofread"})

(def ^:private kinds {"i1" "bug" "i2" "feature" "i3" "bug" "i4" "feature"})

(def ^:private defaults
  {:hero {"doc-sort-hero" ["h1" "h2" "h3"]}
   :list {"doc-sort-list" ["a" "b" "c" "d"]}
   :touch {"doc-sort-touch" ["a" "b" "c" "d"]}
   :board {"doc-board-todo" ["k1" "k2" "k3"] "doc-board-doing" ["k4" "k5"] "doc-board-done" ["k6"]}
   :accepts {"doc-acc-inbox" ["i1" "i2" "i3" "i4"] "doc-acc-bugs" []}
   :menu {"doc-menu-todo" ["m1" "m2" "m3"] "doc-menu-done" ["m4"]}})

(defn- lists [demo] (merge (get defaults demo) (get-in @state/state [:sortable-doc demo])))

(defn- apply-order! [demo]
  (fn [^js e]
    (swap! state/state assoc-in [:sortable-doc demo]
           (merge (lists demo) (js->clj (.. e -detail -value -order))))))

(defn- handle [k]
  [:button.flex.items-center.justify-center.w-8.h-8.rounded-md.shrink-0.ty-text--.hover:ty-bg-neutral-
   {:type "button" :data-handle "" :aria-label (str "Move " (titles k))}
   [:ty-icon {:name "grip-vertical" :size "sm"}]])

(defn- card
  "An item with a handle. :replicant/key makes Replicant move the node, so
   the hold sees the new order."
  [k & extra]
  (into [:div.flex.items-center.gap-2.rounded-lg.border.ty-border-.ty-elevated.pl-1.pr-3.text-sm.ty-text
         {:replicant/key k :data-key k :class ["py-0.5"]}
         (handle k) [:span.truncate (titles k)]]
        extra))

(defn- plain-card
  "No handle: the whole item is the grip."
  [k]
  [:div.rounded-lg.border.ty-border-.ty-elevated.px-3.py-2.text-sm.ty-text
   {:replicant/key k :data-key k}
   (titles k)])

(defn- sortable
  ([demo id attrs] (sortable demo id attrs card))
  ([demo id attrs item]
   [:ty-sortable.ty-canvas.flex.flex-col.gap-2.rounded-xl.p-2
    (merge {:id id :replicant/key id :style {:min-height "3.5rem"}
            :on {:ty-sortable-change (apply-order! demo)}}
           attrs)
    (for [k (get (lists demo) id)] (item k))]))

(defn- column [demo id label attrs & [item]]
  [:div.flex.flex-col.gap-2.min-w-0 {:replicant/key id}
   [:div.flex.items-center.justify-between.px-1
    [:span.text-xs.font-semibold.uppercase.tracking-widest.ty-text-- label]
    [:span.text-xs.font-mono.ty-text-- (count (get (lists demo) id))]]
   (sortable demo id (assoc attrs :label label) (or item card))])

(defn- columns [min-width & children]
  (into [:div.w-full.gap-4 {:style {:display "grid"
                                    :grid-template-columns (str "repeat(auto-fit, minmax(" min-width ", 1fr))")}}]
        children))

;; --- Move to… ------------------------------------------------------------------

(defn- move! [list-id k opts]
  (-> (.move (js/document.getElementById list-id) k (clj->js opts))
      (.catch (fn [_] nil))))

(defn- menu-card [k]
  (let [ls (lists :menu)
        todo? (some #{k} (get ls "doc-menu-todo"))
        [id other other-label] (if todo? ["doc-menu-todo" "doc-menu-done" "Done"] ["doc-menu-done" "doc-menu-todo" "To do"])
        ks (get ls id)
        i (.indexOf ks k)
        arrow (fn [icon label to disabled?]
                [:ty-button {:size "xs" :appearance "ghost" :action "" :aria-label (str "Move " (titles k) " " label)
                             :disabled (when disabled? "") :on {:click #(move! id k {:index to})}}
                 [:ty-icon {:name icon :size "xs"}]])]
    (card k
          [:div.ml-auto.flex.items-center.gap-1.shrink-0
           (arrow "arrow-up" "up" (dec i) (zero? i))
           (arrow "arrow-down" "down" (inc i) (= i (dec (count ks))))
           [:ty-button {:size "xs" :appearance "ghost" :aria-label (str "Move " (titles k) " to " other-label)
                        :on {:click #(move! id k {:to other})}}
            other-label]])))

;; --- Snippets ------------------------------------------------------------------

(def ^:private render-js
  "<script>
  // Render value.order: every list the move touched, by id.
  document.addEventListener('ty-sortable-change', (e) => {
    const lists = Object.entries(e.detail.value.order).map(([id, keys]) =>
      [document.getElementById(id),
       keys.map((k) => document.querySelector(`[data-key=\"${k}\"]`))]);
    lists.forEach(([list, items]) => list.replaceChildren(...items));
  });
</script>")

(def ^:private list-snippets
  [["html" "HTML" "html"
    (str "<ty-sortable id=\"tasks\" label=\"Tasks\">
  <div data-key=\"a\">
    <button type=\"button\" data-handle aria-label=\"Move Design review\">
      <ty-icon name=\"grip-vertical\"></ty-icon>
    </button>
    Design review
  </div>
  …
</ty-sortable>

" render-js)]
   ["replicant" "Replicant" "clojure"
    "[:ty-sortable {:id \"tasks\" :label \"Tasks\"
               :on {:ty-sortable-change
                    #(swap! lists merge (js->clj (.. % -detail -value -order)))}}
 (for [k (get @lists \"tasks\")]
   [:div {:replicant/key k :data-key k}
    [:button {:type \"button\" :data-handle \"\" :aria-label (str \"Move \" (titles k))}
     [:ty-icon {:name \"grip-vertical\"}]]
    (titles k)])]"]])

(def ^:private board-snippets
  [["html" "HTML" "html"
    (str "<ty-sortable id=\"todo\" group=\"board\" label=\"To do\" preview=\"shift\" flash>…</ty-sortable>
<ty-sortable id=\"doing\" group=\"board\" label=\"Doing\" preview=\"shift\" flash>…</ty-sortable>
<ty-sortable id=\"done\" group=\"board\" label=\"Done\" preview=\"shift\" flash>…</ty-sortable>

" render-js)]
   ["replicant" "Replicant" "clojure"
    "(defn column [id label]
  [:ty-sortable {:id id :group \"board\" :label label :preview \"shift\" :flash true
                 :on {:ty-sortable-change
                      #(swap! board merge (js->clj (.. % -detail -value -order)))}}
   (for [k (get @board id)]
     [:div {:replicant/key k :data-key k} (handle k) (titles k)])])

[:div.grid.grid-cols-3.gap-4
 (column \"todo\" \"To do\")
 (column \"doing\" \"Doing\")
 (column \"done\" \"Done\")]"]])

(def ^:private accepts-code
  "<ty-sortable id=\"inbox\" group=\"triage\">
  <div data-key=\"i1\" data-kind=\"bug\">…</div>
  <div data-key=\"i2\" data-kind=\"feature\">…</div>
</ty-sortable>
<ty-sortable id=\"bugs\" group=\"triage\" accepts=\"[data-kind=bug]\"></ty-sortable>

<script>
  // Rules a selector can't express: false blocks that slot.
  bugs.canDrop = ({ item, index }) => index < 10;
</script>")

(def ^:private move-snippets
  [["html" "HTML" "javascript"
    "const todo = document.getElementById('todo');

await todo.move('m1', { index: 0 });              // top of its list
await todo.move('m1', { to: 'done' });            // end of another list in the group
await todo.move('m1', { to: 'done', before: 'm4' });

// Resolves 'accepted', 'rejected', 'reconciled' or 'unknown'."]
   ["replicant" "Replicant" "clojure"
    "[:ty-button {:on {:click #(.move (js/document.getElementById \"todo\") k
                                #js {:to \"done\"})}}
 \"Move to Done\"]"]])

(def ^:private datastar-code
  "<ty-sortable id=\"todo\" group=\"board\" label=\"To do\"
  data-signals:move=\"null\"
  data-indicator:_saving
  data-attr:aria-busy=\"$_saving ? 'true' : 'false'\"
  data-on:ty-sortable-change=\"$move = evt.detail.value; @post('/board/move')\">
  <div id=\"card-12\">
    <button type=\"button\" data-handle aria-label=\"Move Fix login\">…</button>
    Fix login
  </div>
</ty-sortable>")

(def ^:private htmx-code
  "<div id=\"board\" hx-ext=\"morph\">
  <ty-sortable id=\"todo\" group=\"board\" label=\"To do\"
    hx-post=\"/board/move\"
    hx-trigger=\"ty-sortable-change\"
    hx-vals='js:{move: JSON.stringify(event.detail.value)}'
    hx-target=\"#board\"
    hx-swap=\"morph:innerHTML\">
    <div id=\"card-12\">…</div>
  </ty-sortable>
  …
</div>")

(def ^:private touch-code
  "<!-- Handle: drags at once, the rest of the row scrolls -->
<div data-key=\"a\">
  <button type=\"button\" data-handle aria-label=\"Move Design review\"
    style=\"width: 44px; height: 44px\">…</button>
  Design review
</div>

<!-- No handle: press and hold 250ms -->
<div data-key=\"b\">Fix login redirect</div>")

;; --- Page ----------------------------------------------------------------------

(defn view []
  (component-page
   {:title "Sortable"
    :group "Layout primitives"
    :tag "ty-sortable"
    :description "Reorder a list, or move items between lists, by mouse, touch, keyboard or move(). It never moves your nodes: it fires ty-sortable-change, your app renders the new order, and the result holds on screen until it does."
    :chips [["Keyboard" "zap"] ["Touch" "smartphone"] ["Screen readers" "accessibility"]]
    :source "packages/core/src/components/sortable.ts"
    :mark "⇅"
    :demo [:div {:style {:width "300px"}}
           (sortable :hero "doc-sort-hero" {:label "Today"})]}

   (page-section
    {:title "Examples"}
    (bento
     (example
      {:title "List"
       :span 3
       :description [:span "Drag a handle, or focus it and press Space, move with ↑ ↓, Space to drop, Escape to cancel. "
                     "The handler writes " [:code "value.order"] " back."]
       :tabs list-snippets}
      [:div.w-full (sortable :list "doc-sort-list" {:label "Tasks"})])

     (example
      {:title "Move to…"
       :span 3
       :description [:span [:code "move()"] " is the drag-free path for menus and buttons. Same event, same hold."]
       :tabs move-snippets}
      (columns "12rem"
               (column :menu "doc-menu-todo" "To do" {:group "menu"} menu-card)
               (column :menu "doc-menu-done" "Done" {:group "menu"} menu-card)))

     (example
      {:title "Kanban"
       :description [:span "Lists with the same " [:code "group"] " trade items. "
                     [:code "value.order"] " holds both the source and the destination, so one merge renders both. "
                     "With the keyboard, ← → switch columns. "
                     [:code "preview=\"shift\""] " moves the cards aside while you drag; "
                     [:code "flash"] " outlines the card where it lands."]
       :tabs board-snippets}
      (columns "11rem"
               (column :board "doc-board-todo" "To do" {:group "board" :preview "shift" :flash true})
               (column :board "doc-board-doing" "Doing" {:group "board" :preview "shift" :flash true})
               (column :board "doc-board-done" "Done" {:group "board" :preview "shift" :flash true})))

     (example
      {:title "Accepts"
       :description [:span "Bugs only takes items matching " [:code "accepts=\"[data-kind=bug]\""]
                     ". A blocked drop shows red and snaps back."]
       :code accepts-code}
      (let [item (fn [k] (card k [:ty-tag.ml-auto {:size "xs" :flavor (if (= "bug" (kinds k)) "danger-" "primary-")} (kinds k)]))
            kind-of (fn [k] (assoc-in (item k) [1 :data-kind] (kinds k)))]
        (columns "12rem"
                 (column :accepts "doc-acc-inbox" "Inbox" {:group "triage"} kind-of)
                 (column :accepts "doc-acc-bugs" "Bugs only" {:group "triage" :accepts "[data-kind=bug]"} kind-of))))))

   (page-section
    {:title "Server rendering"
     :sub "Send value to the server and let it render the lists. Put aria-busy on the list while the request runs: if the response doesn't change the order, the move snaps back as soon as it lands."}
    (bento
     (example
      {:title "Datastar"
       :span 3
       :description [:span "The server patches the touched columns with " [:code "patch-elements"]
                     ". Items need an id, or Datastar matches them by position."]
       :code datastar-code}
      nil)
     (example
      {:title "htmx"
       :span 3
       :description [:span "htmx puts " [:code "htmx-request"] " on the list during the request; ty reads it like aria-busy."]
       :code htmx-code}
      nil)))

   (page-section
    {:title "Mobile"}
    (example
     {:title "Handles or long-press"
      :side? true
      :description [:span "A handle drags at once and leaves the rest of the row to scroll; give it a 44px target. "
                    "Without one, press and hold 250ms; moving earlier scrolls the page. ty sets "
                    [:code "touch-action: none"] " on handles, including a custom " [:code "handle"] " selector."]
      :code touch-code}
     [:div.w-full (sortable :touch "doc-sort-touch" {:label "Tasks" :preview "shift"} plain-card)]))

   (api-section
    {:attributes ["ty-sortable"
                  ["group" "string" "Lists with the same group trade items. Each needs an id."]
                  ["axis" "string" "\"vertical\"" "vertical or horizontal: hit testing, the drop line and arrow keys."]
                  ["handle" "selector" "\"[data-handle]\"" "If an item contains a match, drags start only there. Otherwise the whole item is the grip."]
                  ["accepts" "selector" "Items from other lists must match it to drop here."]
                  ["disabled" "boolean" "false" "No drags from or into this list."]
                  ["key-attr" "string" "Attribute holding the item key, checked before data-key and id."]
                  ["hold-timeout" "number" "5000" "ms to hold a result with no render and no busy signal."]
                  ["label" "string" "List name in announcements. Falls back to aria-label, then id."]
                  ["preview" "string" "\"line\"" "line: a drop line marks the slot. shift: the other items move aside while dragging (the native feel on phones). The list under the pointer decides: set it on every list of a group."]
                  ["flash" "boolean" "false" "Outline the item briefly where it lands."]
                  ["aria-busy" "\"true\"" "A request is in flight: the hold waits for it, up to 30s."]
                  "Items"
                  ["data-key / id" "string" "The key in value. Required when a server or morph renders the list."]
                  ["data-locked" "boolean" "Can't be dragged. Locked runs at the start or end stay put."]
                  ["data-sortable-ignore" "boolean" "Not an item: headers, empty states."]
                  ["data-no-drag" "boolean" "Pressing inside it never starts a drag."]]
     :properties [["canDrop" "({item, key, from, to, index}) => boolean" "Extra rule per slot. false blocks it."]
                  ["labels" "object" "Announcement overrides: pickedUp, moved, blocked, dropped, rejected, reconciled, removed, unknown, cancelled, pending. Placeholders {item} {position} {total} {list}."]
                  ["items" "HTMLElement[]" "Items in order. Read-only."]
                  ["keyOf(item)" "(Element) => string | null" "An item's key."]
                  ["move(itemOrKey, opts)" "({to, index, before, after}) => Promise<outcome>" "Move without dragging. Fires the same change and holds the same way."]
                  ["settle(outcome?)" "('accepted' | 'rejected') => void" "End the hold now. No argument re-checks the DOM."]]
     :events [["ty-sortable-change" "{value: {key, group, source, from, to, order}, item, fromContainer, toContainer}"
               "Fired on the destination. Bubbles; preventDefault() rejects. from / to: {list, index, prev, next}. order: the new keys of each touched list, by id."]
              ["ty-sortable-start" "{value: {key, group, source, from}, item}" "Drag or keyboard pick-up started, on the source."]
              ["ty-sortable-cancel" "{value: {key, group, source, from}, item, reason}" "Ended without a drop: escape, spill, blocked, pointercancel, gone, disabled or blur."]
              ["ty-sortable-settle" "{value, outcome}" "The hold ended: accepted, rejected, reconciled or unknown."]]
     :keyboard [["Space / Enter" "On a handle: pick up, then drop."]
                ["↑ ↓" "One slot. ← → with axis=\"horizontal\"."]
                ["← →" "Previous / next list in the group. ↑ ↓ with axis=\"horizontal\"."]
                ["Home / End" "First / last slot."]
                ["Escape / Tab" "Cancel. The item goes back."]]
     :css-vars [["--ty-sortable-indicator-color" "Drop line."]
                ["--ty-sortable-blocked-color" "Drop line and outline over a list that refuses the item."]
                ["--ty-sortable-indicator-size" "Drop line thickness. 2px, 3px on touch."]
                ["--ty-sortable-source-opacity" "The item's original place while it moves. 0.4."]
                ["--ty-sortable-source-outline" "Outline on that place, e.g. 2px dashed. none."]
                ["--ty-sortable-ghost-shadow" "Shadow of the dragged copy."]
                ["--ty-sortable-ghost-scale" "How much the copy grows when picked up. 1.02."]
                ["--ty-sortable-ghost-rotate" "Tilt of the copy, e.g. 3deg. 0deg."]
                ["--ty-sortable-flash-color" "flash outline. Defaults to the indicator color."]
                ["--ty-sortable-duration" "Settle and snap-back animation."]]})))
