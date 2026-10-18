(ns tyrell.site.docs.popup
  "Documentation for ty-popup component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(def ^:private placements
  (for [side ["top" "bottom" "left" "right"] align ["-start" "" "-end"]] (str side align)))

(defn- doc-state [k] (get-in @state/state [:popup-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:popup-doc k] v))

(defn- close-from-inside!
  "Content closes its popup by dispatching ty:close-popup (bubbles to the popup)."
  [^js e]
  (.dispatchEvent (.-currentTarget e) (js/CustomEvent. "ty:close-popup" #js {:bubbles true :composed true})))

(defn- card [& children]
  (into [:div.ty-floating.rounded-xl.p-4.flex.flex-col.gap-3.text-sm {:style {:min-width "220px"}}] children))

(defn- menu-item [icon label & [flavor]]
  [:button.flex.items-center.gap-2.w-full.rounded-md.px-2.text-left.cursor-pointer.hover:ty-bg-neutral- {:replicant/key label :class (into ["py-1.5"] (if flavor [(str "ty-text-" flavor)] ["ty-text+"]))
    :on {:click close-from-inside!}}
   [:ty-icon {:name icon :size "sm"}] label])

(defn- snippets [{:keys [placement offset manual]}]
  (let [attrs (str (when (not= placement "bottom") (str " placement=\"" placement "\""))
                   (when (not= offset "8") (str " offset=\"" offset "\""))
                   (when manual " manual"))]
    [["html" "HTML" "html"
      (str "<ty-button>\n  Share\n  <ty-popup" attrs ">\n    <div class=\"card\">…</div>\n  </ty-popup>\n</ty-button>")]
     ["react" "React" "javascript"
      (str "import { TyButton, TyPopup } from 'tyrell-react'\n\n"
           "<TyButton>\n  Share\n  <TyPopup" attrs ">\n    <div className=\"card\">…</div>\n  </TyPopup>\n</TyButton>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/Button \"Share\"\n [:> ty/Popup {"
           (str/triml (str (when (not= placement "bottom") (str ":placement \"" placement "\" "))
                           (when (not= offset "8") (str ":offset " offset " "))
                           (when manual ":manual true")))
           "}\n  [:div.card …]]]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-button \"Share\"\n [:ty-popup {"
           (str/triml (str (when (not= placement "bottom") (str ":placement \"" placement "\" "))
                           (when (not= offset "8") (str ":offset \"" offset "\" "))
                           (when manual ":manual \"\"")))
           "}\n  [:div.card …]]]")]
     ;; opening fetches; the server's SSE patches #share-card
     ["datastar" "Datastar" "html"
      (str "<ty-button>\n  Share\n  <ty-popup" attrs "\n    data-on:open=\"@get('/share-links')\">\n"
           "    <div id=\"share-card\" class=\"card\">…</div>\n  </ty-popup>\n</ty-button>")]]))

(defn- render-playground [{:keys [placement offset manual]}]
  [:div.flex.flex-col.items-center.gap-3
   [:ty-button {:flavor "primary" :size "md" :id "doc-popup-trigger"}
    [:ty-icon {:slot "start" :name "share-2"}] "Share"
    [:ty-popup (cond-> {:placement placement :offset offset :id "doc-popup-play"}
                 manual (assoc :manual ""))
     (card [:span.font-semibold.ty-text++ "Share “Release notes”"]
           [:ty-copy {:value "https://tyrell.dev/n/7f3a" :size "sm"}]
           [:div.flex.justify-end
            [:ty-button {:size "sm" :appearance "ghost" :on {:click close-from-inside!}} "Done"]])]]
   (when manual
     [:ty-button {:size "sm" :appearance "outlined"
                  :on {:click #(.togglePopup (js/document.getElementById "doc-popup-play"))}}
      "togglePopup()"])])

(def ^:private form-snippets
  "Quick form, one tab per stack."
  [["html" "HTML" "html"
    "<ty-button>
  Add label
  <ty-popup placement=\"bottom-start\">
    <form id=\"new-label\">
      <ty-input name=\"label\" label=\"New label\"></ty-input>
      <ty-button flavor=\"primary\">Add</ty-button>
    </form>
  </ty-popup>
</ty-button>

<script>
  document.getElementById('new-label').addEventListener('submit', (e) => {
    e.preventDefault();
    addLabel(new FormData(e.target).get('label'));
    e.target.closest('ty-popup').closePopup();
  });
</script>"]
   ["react" "React" "javascript"
    "import { TyButton, TyPopup, TyInput } from 'tyrell-react'

<TyButton>
  Add label
  <TyPopup placement=\"bottom-start\">
    <form onSubmit={(e) => {
      e.preventDefault()
      addLabel(new FormData(e.currentTarget).get('label'))
      e.currentTarget.closest('ty-popup').closePopup()
    }}>
      <TyInput name=\"label\" label=\"New label\" />
      <TyButton flavor=\"primary\">Add</TyButton>
    </form>
  </TyPopup>
</TyButton>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Button \"Add label\"
 [:> ty/Popup {:placement \"bottom-start\"}
  [:form {:on-submit (fn [e]
                       (.preventDefault e)
                       (let [form (.-currentTarget e)]
                         (add-label! (.get (js/FormData. form) \"label\"))
                         (.closePopup (.closest form \"ty-popup\"))))}
   [:> ty/Input {:name \"label\" :label \"New label\"}]
   [:> ty/Button {:flavor \"primary\"} \"Add\"]]]]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-button \"Add label\"
 [:ty-popup {:placement \"bottom-start\"}
  [:form {:on {:submit (fn [e]
                         (.preventDefault e)
                         (let [form (.-target e)]
                           (add-label! (.get (js/FormData. form) \"label\"))
                           (.closePopup (.closest form \"ty-popup\"))))}}
   [:ty-input {:name \"label\" :label \"New label\"}]
   [:ty-button {:flavor \"primary\"} \"Add\"]]]]"]
   ["datastar" "Datastar" "html"
    "<ty-button>
  Add label
  <ty-popup placement=\"bottom-start\">
    <form data-on:submit__prevent=\"@post('/labels', {contentType: 'form'});
      el.closest('ty-popup').closePopup()\">
      <ty-input name=\"label\" label=\"New label\"></ty-input>
      <ty-button flavor=\"primary\">Add</ty-button>
    </form>
  </ty-popup>
</ty-button>"]])

(def ^:private api-snippets
  "JavaScript API example, one tab per stack."
  [["html" "HTML" "html"
    "<ty-popup id=\"share\">…</ty-popup>

<script>
  const popup = document.getElementById('share');

  popup.openPopup();
  popup.closePopup();
  popup.togglePopup();

  popup.addEventListener('open', () => loadShareLinks());
  popup.addEventListener('close', () => track('share-closed'));
</script>"]
   ["react" "React" "javascript"
    "import { useRef } from 'react'
import { TyPopup } from 'tyrell-react'

const popup = useRef(null)
// popup.current.openPopup() / closePopup() / togglePopup()

<TyPopup ref={popup}
  onOpen={() => loadShareLinks()}
  onClose={() => track('share-closed')}>
  …
</TyPopup>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

;; (.openPopup @popup) / .closePopup / .togglePopup
[:> ty/Popup {:ref #(reset! popup %)
              :on-open #(load-share-links!)
              :on-close #(track! \"share-closed\")}
 …]"]
   ["replicant" "Replicant" "clojure"
    ";; (.openPopup @popup) / .closePopup / .togglePopup
[:ty-popup {:replicant/on-mount (fn [{:replicant/keys [node]}] (reset! popup node))
            :on {:open #(load-share-links!)
                 :close #(track! \"share-closed\")}}
 …]"]
   ["datastar" "Datastar" "html"
    "<!-- $_share.openPopup() / closePopup() / togglePopup().
     The _ keeps the element out of the signals sent to the server. -->
<ty-popup data-ref:_share
  data-on:open=\"@get('/share-links')\"
  data-on:close=\"@post('/track/share-closed')\">
  …
</ty-popup>"]])

(defn view []
  (component-page
   {:title "Popup"
    :group "Overlays"
    :tag "ty-popup"
    :description "Click-triggered content anchored to its parent. Menus, share cards, quick forms. Picks the side with room, closes on outside click and Escape."
    :chips [["Top layer" "layers"] ["Keyboard" "zap"] ["TyPopup (React)" "atom"]]
    :source "packages/core/src/components/popup.ts"
    :mark "⌃"
    :demo [:ty-button {:size "md" :appearance "outlined"}
           "Actions" [:ty-icon {:slot "end" :name "chevron-down"}]
           [:ty-popup {:placement "bottom-start"}
            (card (menu-item "edit" "Edit")
                  (menu-item "copy" "Duplicate")
                  (menu-item "archive" "Archive")
                  (menu-item "trash" "Delete" "danger"))]]}

   (playground
    {:id :popup
     :defaults {:placement "bottom" :offset "8" :manual false}
     :controls [{:key :placement :options placements :select? true}
                {:key :offset :options ["4" "8" "16"]}
                {:key :manual :switch? true}]
     :sub "Click Share. With manual on, only the API opens it."
     :render render-playground
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Action menu"
       :span 3
       :description [:span "A popup inside an icon button. Items close it by dispatching "
                     [:code "ty:close-popup"] "."]
       :code "<ty-button action aria-label=\"More\">
  <ty-icon name=\"more-vertical\"></ty-icon>
  <ty-popup placement=\"bottom-end\">…</ty-popup>
</ty-button>

item.dispatchEvent(new CustomEvent(
  'ty:close-popup', { bubbles: true }));"}
      [:ty-button {:action "" :appearance "outlined" :size "md" :aria-label "More"}
       [:ty-icon {:name "more-vertical"}]
       [:ty-popup {:placement "bottom-end"}
        (card (menu-item "edit" "Rename")
              (menu-item "copy" "Duplicate")
              (menu-item "trash" "Delete" "danger"))]])

     (example
      {:title "Quick form"
       :span 3
       :description "Fields work inside; the popup only closes on outside click, Escape, or when you say so."
       :tabs form-snippets}
      (let [labels (or (doc-state :labels) ["bug" "docs"])]
        [:div.flex.flex-wrap.items-center.gap-2
         (for [l labels] [:ty-tag {:replicant/key l :size "sm"} l])
         [:ty-button {:size "sm" :appearance "ghost"}
          [:ty-icon {:slot "start" :name "plus"}] "Add label"
          [:ty-popup {:placement "bottom-start"}
           [:form.ty-floating.rounded-xl.p-4.flex.flex-col.gap-3 {:style {:width "240px"}
                                                                   :on {:submit (fn [^js e]
                                                                                  (.preventDefault e)
                                                                                  (let [v (.get (js/FormData. (.-target e)) "label")]
                                                                                    (when (seq v) (set-doc! :labels (conj labels v))))
                                                                                  (close-from-inside! e))}}
            [:ty-input {:name "label" :label "New label" :placeholder "e.g. design" :size "sm"}]
            [:ty-button {:size "md" :flavor "primary"} "Add"]]]]]))

     (example
      {:title "Twelve placements"
       :span 6
       :description [:span "A side plus an optional alignment. When there's no room it flips to the opposite side and keeps the alignment."]
       :code "placement=\"top | top-start | top-end | bottom… | left… | right…\""}
      [:div.flex.flex-wrap.gap-2
       (for [p ["top-start" "top" "top-end" "bottom-start" "bottom" "bottom-end" "left" "right"]]
         [:ty-button {:replicant/key p :size "sm" :appearance "outlined"} p
          [:ty-popup {:placement p}
           [:div.ty-floating.rounded-lg.px-3.py-2.font-mono.text-xs.ty-text p]]])])

     (example
      {:title "JavaScript API"
       :tabs api-snippets}
      nil)))

   (page-section
    {:title "Theming" :sub "Motion only; the panel is yours." :dark? true}
    (example
     {:title "Motion"
      :side? true
      :lang "css"
      :description [:span "ty-popup draws nothing but the positioned layer. Duration, easing and starting scale of the entrance are variables; a lower scale gives the spring room to overshoot."]
      :code "ty-popup {
  --ty-popup-duration: 420ms;
  --ty-popup-ease: cubic-bezier(.2, 1.6, .4, 1);
  --ty-popup-scale: .8;
}"}
     [:ty-button.self-start {:size "md"} "Bouncy popup"
      [:ty-popup {:style {"--ty-popup-duration" "420ms"
                          "--ty-popup-ease" "cubic-bezier(.2, 1.6, .4, 1)"
                          "--ty-popup-scale" ".8"}}
       (card [:span.ty-text+ "Springy entrance."])]]))

   (api-section
    {:attributes ["Position"
                  ["placement" "string" "\"bottom\"" "top, bottom, left, right, each with optional -start / -end. Flips when there's no room."]
                  ["offset" "number" "8" "Gap to the anchor, in px."]
                  "Behavior"
                  ["manual" "boolean" "false" "The parent doesn't open it; use the methods."]
                  ["disable-close" "boolean" "false" "Outside click and Escape don't close it."]]
     :properties [["openPopup()" "() => void" "Open."]
                  ["closePopup()" "() => void" "Close."]
                  ["togglePopup()" "() => void" "Toggle."]]
     :events [["open" "—" "Opened and positioned. Doesn't bubble."]
              ["close" "—" "Closed. Doesn't bubble."]
              ["ty:close-popup" "—" "Dispatch it (bubbling) from inside the content to close the popup."]]
     :slots [["(default)" "The popup content. The anchor is the popup's parent element; a ty-button anchor inside a form needs type=\"button\", or its press submits."]]
     :keyboard [["Enter / Space on the anchor" "Open, on a ty-button as on a native button. Opening, by key or click, moves focus into the popup: an [autofocus] control in it, else the popup itself."]
                ["Esc" "Close, unless disable-close. A select list or date picker calendar open inside closes first."]]
     :css-vars [["--ty-popup-duration" "Entrance and exit duration."]
                ["--ty-popup-ease" "Entrance easing."]
                ["--ty-popup-scale" "Starting scale of the entrance (.96)."]]})))
