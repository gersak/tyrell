(ns tyrell.site.docs.popup
  "Documentation for ty-popup component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(def ^:private placements ["top" "bottom" "left" "right"])

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
     ["datastar" "Datastar" "html"
      (str "<ty-button>\n  Share\n  <ty-popup" attrs " data-on:open=\"@get('/share-links')\">\n    <div id=\"share-card\">…</div>\n  </ty-popup>\n</ty-button>")]]))

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

(defn view []
  (component-page
   {:title "Popup"
    :group "Overlays"
    :tag "ty-popup"
    :description "Click-triggered content anchored to its parent. Menus, share cards, quick forms. Picks the side with room, closes on outside click and Escape."
    :chips [["Top layer" "layers"] ["Keyboard" "zap"] ["TyPopup (React)" "atom"]]
    :source "packages/core/src/components/popup.ts"
    :mark "⌃"
    :demo [:div.flex.flex-col.items-start.gap-2
           [:ty-button {:size "md" :appearance "outlined"} "Actions" [:ty-icon {:slot "end" :name "chevron-down"}]]
           (card (menu-item "edit" "Rename")
                 (menu-item "copy" "Duplicate")
                 (menu-item "archive" "Archive")
                 (menu-item "trash" "Delete" "danger"))]}

   (playground
    {:id :popup
     :defaults {:placement "bottom" :offset "8" :manual false}
     :controls [{:key :placement :options placements}
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
       :code "<ty-button>
  Add label
  <ty-popup>
    <form>…</form>
  </ty-popup>
</ty-button>"}
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
       :lang "javascript"
       :code "const popup = document.querySelector('ty-popup');

popup.openPopup();
popup.closePopup();
popup.togglePopup();

popup.addEventListener('open', () => loadShareLinks());
popup.addEventListener('close', () => track('share-closed'));"}
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
     [:ty-button {:size "md"} "Bouncy popup"
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
     :slots [["(default)" "The popup content. The anchor is the popup's parent element."]]
     :keyboard [["Enter / Space on the anchor" "Open."]
                ["Esc" "Close, unless disable-close."]]
     :css-vars [["--ty-popup-duration" "Entrance and exit duration."]
                ["--ty-popup-ease" "Entrance easing."]
                ["--ty-popup-scale" "Starting scale of the entrance (.96)."]]})))
