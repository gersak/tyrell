(ns tyrell.site.docs.copy-field
  "Documentation for ty-copy component"
  (:require [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private flavors ["neutral" "primary" "success" "danger" "warning"])

(def ^:private lineup
  "Playground stage: the values people actually copy."
  [{:label "API key" :value "sk_live_51HqT2xK9vB3mN8pQ4rL7w" :format "code"}
   {:label "Share link" :value "https://tyrell.dev/components/copy-field"}
   {:label "Install" :value "npm install @gersak/ty" :format "code"}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size flavor]}]
  (cond-> {}
    (not= size "sm") (assoc :size size)
    (not= flavor "neutral") (assoc :flavor flavor)))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (for [{:keys [label value format]} lineup]
       [:ty-copy (merge {:label label :value value :format format} attrs)])
     :datastar (str "<ty-copy label=\"Invite link\"" (snippets/attr-str attrs)
                    "\n  data-attr:value=\"$inviteUrl\"\n  data-on:copy-success=\"$copied = true\">\n</ty-copy>"))))

(defn- render-lineup [{:keys [size flavor]}]
  [:div.flex.flex-col.gap-4 {:style {:width "100%" :max-width "420px"}}
   (for [{:keys [label value format]} lineup]
     [:ty-copy (cond-> {:replicant/key label :label label :value value :size size :flavor flavor}
                 format (assoc :format format))])])

(defn- doc-state [k] (get-in @state/state [:copy-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:copy-doc k] v))

(def ^:private snippet
  "<ty-button flavor=\"primary\">
  Save changes
</ty-button>")

(def ^:private config
  "{\"theme\": \"dark\", \"primary\": \"#e0473e\", \"radius\": 8, \"font\": \"Inter\", \"density\": \"comfortable\"}")

(defn view []
  (component-page
   {:title "Copy Field"
    :group "Text input"
    :tag "ty-copy"
    :description "A read-only field with a copy button. Click anywhere on it to copy. Tokens, links, commands and code, single or multi-line."
    :chips [["Clipboard" "copy"] ["Keyboard" "zap"] ["TyCopy (React)" "atom"]]
    :source "packages/core/src/components/copy.ts"
    :mark "⧉"
    :demo [:div.flex.flex-col.gap-3 {:style {:width "340px"}}
           [:ty-copy {:label "API key" :value "sk_live_51HqT2xK9vB3mN8pQ" :format "code" :size "md"}]
           [:ty-copy {:label "Invite link" :value "https://tyrell.dev/join/7f3a" :size "md" :flavor "primary"}]]}

   (playground
    {:id :copy
     :defaults {:size "md" :flavor "neutral"}
     :controls [{:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :flavor :options flavors :swatch? true :tones? true}]
     :sub "Click a field to copy. The icon confirms."
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Multi-line code"
       :span 4
       :description [:span [:code "multiline"] " keeps line breaks; " [:code "format=\"code\""]
                     " sets it in monospace. The value is shown as text, so markup stays markup."]
       :code "<ty-copy format=\"code\" multiline
  value=\"<ty-button flavor=&quot;primary&quot;>…\">
</ty-copy>"}
      [:ty-copy {:label "Snippet" :format "code" :multiline "" :value snippet}])

     (example
      {:title "Long values"
       :span 2
       :description [:span [:code "horizontal-scroll"] " scrolls instead of truncating."]
       :code "<ty-copy horizontal-scroll
  format=\"code\" value=\"…\">"}
      [:ty-copy {:label "Config" :format "code" :horizontal-scroll "" :value config}])

     (example
      {:title "Confirm the copy"
       :span 3
       :description [:span "The icon turns into a check for two seconds. Listen for "
                     [:code "copy-success"] " to show more, like a toast."]
       :code "field.addEventListener(
  'copy-success',
  (e) => toast(e.detail.value));"}
      (let [n (doc-state :copies)]
        [:div.flex.flex-col.gap-3.w-full
         [:ty-copy {:label "Coupon" :value "SPRING-25" :format "code" :flavor "success"
                    :on {:copy-success #(set-doc! :copies (inc (or n 0)))}}]
         [:code.ty-text-.text-xs (if n (str "copy-success × " n) "Click the field.")]]))

     (example
      {:title "Flavors"
       :span 3
       :description "Flavor colors the icon and its hover. Keep neutral unless the value means something."
       :code "<ty-copy flavor=\"primary\" value=\"…\">
<ty-copy flavor=\"danger\" value=\"…\">"}
      [:div.flex.flex-col.gap-3.w-full
       [:ty-copy {:value "Public key: pk_7f3a9c" :flavor "primary"}]
       [:ty-copy {:value "Secret: sk_live_9b2e" :flavor "danger"}]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const field = document.querySelector('ty-copy');

field.value = token;          // shown as text, copied verbatim

field.addEventListener('copy-success', (e) => log(e.detail.value));
field.addEventListener('copy-error', (e) => {
  // no clipboard permission and the fallback failed too
  console.warn(e.detail.error);
});"}
      nil)))

   (page-section
    {:title "Theming" :sub "Field tokens plus the copy icon." :dark? true}
    (example
     {:title "Icon color"
      :side? true
      :lang "css"
      :description [:span "The field rides " [:code "--ty-input-*"] "; the icon has its own three variables."]
      :code "ty-copy.brand {
  --copy-color: #fb923c;
  --copy-color-hover: #fdba74;
  --copy-bg-hover: #431407;
  --ty-input-border: #7c2d12;
}"}
     [:div {:style {:width "100%" :max-width "340px"}}
      [:ty-copy {:label "Webhook secret" :format "code" :value "whsec_4f9a2c81e7"
                 :style {"--copy-color" "#fb923c"
                         "--copy-color-hover" "#fdba74"
                         "--copy-bg-hover" "#431407"
                         "--ty-input-border" "#7c2d12"}}]]))

   (api-section
    {:attributes ["Value"
                  ["value" "string" "\"\"" "Text shown and copied. Rendered as text, never as markup."]
                  ["label" "string" "Label above the field."]
                  "Display"
                  ["format" "string" "\"text\"" "text or code (monospace)."]
                  ["multiline" "boolean" "false" "Keep line breaks; the field grows."]
                  ["horizontal-scroll" "boolean" "false" "Scroll long values instead of truncating."]
                  "Appearance"
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl. Same ladder as the other fields."]
                  ["flavor" "string" "\"neutral\"" "Colors the copy icon: primary, success, danger, warning or custom."]
                  ["disabled" "boolean" "false" "No copying."]]
     :events [["copy-success" "{value}" "The value is on the clipboard."]
              ["copy-error" "{error}" "Clipboard API and the execCommand fallback both failed."]]
     :keyboard [["Tab" "Focus the copy button."]
                ["Enter / Space" "Copy."]]
     :css-vars [["--copy-color / -color-hover" "Copy icon."]
                ["--copy-bg-hover" "Icon button hover fill."]
                ["--ty-input-bg / -border / -color" "The field, shared with ty-input."]]})))
