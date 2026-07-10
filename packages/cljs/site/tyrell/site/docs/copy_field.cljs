(ns tyrell.site.docs.copy-field
  "Documentation for ty-copy component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

;; ============================================================================
;; API Reference
;; ============================================================================

(defn api-reference []
  [:div.ty-elevated.rounded-lg.p-6
   [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
    [:h2.scroll-mt-6
     {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
     [:span.ty-text-- "API Reference"]]]

   [:div.mb-6
    (section-label "Attributes")
    (attribute-table
     [{:name "value"
       :type "string"
       :default "\"\""
       :description "The text to display and copy to clipboard"}
      {:name "label"
       :type "string"
       :default "-"
       :description "Label displayed above the field"}
      {:name "format"
       :type "string"
       :default "\"text\""
       :description "Display format: text (default) or code (monospace font)"}
      {:name "multiline"
       :type "boolean"
       :default "false"
       :description "Allow text to wrap — useful for SSH keys, certificates, long tokens. Copy icon stays pinned to the top-right corner."}
      {:name "horizontal-scroll"
       :type "boolean"
       :default "false"
       :description "Scroll long content sideways instead of clipping with an ellipsis. Combine with multiline for two-axis code blocks."}
      {:name "size"
       :type "string"
       :default "\"md\""
       :description "Size variant: xs, sm, md, lg, xl"}
      {:name "flavor"
       :type "string"
       :default "\"neutral\""
       :description "Semantic color: primary, secondary, success, danger, warning, neutral"}])]

   [:div
    (section-label "Events")
    (event-table
     [{:name "copy-success"
       :payload "{value: string}"
       :when-fired "Text successfully copied to clipboard"}
      {:name "copy-error"
       :payload "{error: Error}"
       :when-fired "Copy operation failed — handle for fallback UX"}])]])

;; ============================================================================
;; Examples
;; ============================================================================

(defn example-basic []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Basic")
   (demo-area
    [:div.space-y-3
     [:ty-copy {:label "API Key" :value "sk_live_1234567890abcdef"}]
     [:ty-copy {:label "Website URL" :value "https://tyrell.gersak.dev"}]
     [:ty-copy {:label "Access Token" :value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}]])
   (code-block "<ty-copy label=\"API Key\" value=\"sk_live_1234567890abcdef\"></ty-copy>
<ty-copy label=\"Website URL\" value=\"https://tyrell.gersak.dev\"></ty-copy>")])

(defn example-code-format []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Code Format")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Applies monospace font and tighter tracking — ideal for commands, hashes, and connection strings."]
   (demo-area
    [:div.space-y-3
     [:ty-copy {:label "Install" :value "npm install tyrell-components" :format "code"}]
     [:ty-copy {:label "Clone" :value "git clone https://github.com/gersak/tyrell.git" :format "code"}]
     [:ty-copy {:label "Connection String" :value "postgresql://user:pass@localhost:5432/db" :format "code"}]])
   (code-block "<ty-copy
  label=\"Install\"
  value=\"npm install tyrell-components\"
  format=\"code\">
</ty-copy>")])

(defn example-multiline []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Multiline")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Long values like SSH keys or certificates wrap instead of truncating."]
   (demo-area
    [:ty-copy {:label "SSH Public Key"
               :value "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7RvBMCvpxhCcvLrMKAGe9QsmkdLDVqD7nRwJf3P4 user@machine"
               :format "code"
               :multiline true}])
   (code-block "<ty-copy
  label=\"SSH Public Key\"
  value=\"ssh-rsa AAAA...\"
  format=\"code\"
  multiline>
</ty-copy>")])

(defn example-horizontal-scroll []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Horizontal Scroll")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Scroll long single-line values sideways instead of clipping them. Combine with "
    [:code.ty-text "multiline"] " for code blocks that keep their line breaks and scroll on both axes — the copy icon stays pinned top-right."]
   (demo-area
    [:div.space-y-3
     [:ty-copy {:label "Connection String"
                :value "postgresql://admin:s3cr3t@db.internal.example.com:5432/production?sslmode=require&application_name=tyrell"
                :format "code"
                :horizontal-scroll true}]
     [:ty-copy {:label "Deployment Command"
                :value "kubectl apply -f deploy.yaml && kubectl rollout status deployment/api --namespace=production --timeout=300s\ndocker build -t registry.example.com/api:latest . && docker push registry.example.com/api:latest"
                :format "code"
                :multiline true
                :horizontal-scroll true}]])
   (code-block "<!-- Single line, scroll sideways -->
<ty-copy
  label=\"Connection String\"
  value=\"postgresql://admin:...\"
  format=\"code\"
  horizontal-scroll>
</ty-copy>

<!-- Code block: keep line breaks, scroll both axes -->
<ty-copy
  label=\"Deployment Command\"
  value=\"kubectl apply -f ...\"
  format=\"code\"
  multiline
  horizontal-scroll>
</ty-copy>")])

(defn examples []
  (doc-section "Examples"
               [:div.space-y-6
                (example-basic)
                (example-code-format)
                (example-multiline)
                (example-horizontal-scroll)]))

;; ============================================================================
;; Sizes
;; ============================================================================

(defn sizes []
  (doc-section "Sizes"
               [:div.ty-content.rounded-lg.p-5
                (demo-area
                 [:div.space-y-3
                  (for [[size label] [["xs" "Extra Small"] ["sm" "Small"] ["md" "Medium (default)"]
                                      ["lg" "Large"] ["xl" "Extra Large"]]]
                    [:ty-copy {:size size :label label :value (str size "-value-example-123")}])])
                (code-block "<ty-copy size=\"xs\" label=\"Extra Small\" value=\"...\"></ty-copy>
<ty-copy size=\"sm\" label=\"Small\" value=\"...\"></ty-copy>
<ty-copy size=\"md\" label=\"Medium (default)\" value=\"...\"></ty-copy>
<ty-copy size=\"lg\" label=\"Large\" value=\"...\"></ty-copy>
<ty-copy size=\"xl\" label=\"Extra Large\" value=\"...\"></ty-copy>")]))

;; ============================================================================
;; Semantic Flavors
;; ============================================================================

(defn semantic-flavors []
  (doc-section "Semantic Flavors"
               [:div.ty-content.rounded-lg.p-5
                [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                 "Use colors to signal environment, access level, or sensitivity at a glance."]
                (demo-area
                 [:div.space-y-3
                  [:ty-copy {:flavor "neutral" :label "Neutral (default)" :value "neutral-value-1234"}]
                  [:ty-copy {:flavor "primary" :label "Primary API Key" :value "pk_live_primary_abc123"}]
                  [:ty-copy {:flavor "success" :label "Production URL" :value "https://production.example.com"}]
                  [:ty-copy {:flavor "warning" :label "Staging Environment" :value "https://staging.example.com"}]
                  [:ty-copy {:flavor "danger" :label "Delete Token" :value "delete_token_dangerous_abc123"}]])
                (code-block "<ty-copy flavor=\"success\" label=\"Production URL\" value=\"https://prod.example.com\"></ty-copy>
<ty-copy flavor=\"warning\" label=\"Staging\" value=\"https://staging.example.com\"></ty-copy>
<ty-copy flavor=\"danger\" label=\"Delete Token\" value=\"delete_token_abc\"></ty-copy>")]))

;; ============================================================================
;; Advanced Examples
;; ============================================================================

(defn advanced-api-keys-dashboard []
  [:div.ty-content.rounded-lg.p-5
   (section-label "API Keys Dashboard")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Group related keys with semantic flavors to communicate access level at a glance."]
   (demo-area
    [:div.ty-elevated.rounded-lg.p-4.space-y-4
     [:div
      [:p.ty-text-- {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em"
                             :text-transform "uppercase" :margin-bottom "0.5rem"}} "Production"]
      [:div.space-y-2
       [:ty-copy {:size "sm" :flavor "success" :label "Public Key" :value "pk_live_public_key_abc123"}]
       [:ty-copy {:size "sm" :flavor "danger" :label "Secret Key"
                  :value "sk_live_secret_key_xyz789" :format "code"}]]]
     [:div
      [:p.ty-text-- {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em"
                             :text-transform "uppercase" :margin-bottom "0.5rem"}} "Development"]
      [:div.space-y-2
       [:ty-copy {:size "sm" :flavor "secondary" :label "Test Public Key" :value "pk_test_public_key_def456"}]
       [:ty-copy {:size "sm" :flavor "warning" :label "Test Secret Key"
                  :value "sk_test_secret_key_uvw321" :format "code"}]]]])
   (code-block "<ty-copy size=\"sm\" flavor=\"success\" label=\"Public Key\" value=\"pk_live_...\"></ty-copy>
<ty-copy size=\"sm\" flavor=\"danger\" label=\"Secret Key\" value=\"sk_live_...\" format=\"code\"></ty-copy>")])

(defn advanced-event-handling []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Event Handling")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Listen to copy-success and copy-error for analytics, toasts, or fallback behavior."]
   (demo-area
    [:div.space-y-3
     [:ty-copy {:id "event-copy" :label "API Key (try copying)" :value "sk_live_event_example_123"}]
     [:div.flex.gap-4
      [:div.ty-elevated.rounded.px-3.py-2 {:style {:font-size "0.8125rem"}}
       [:span.ty-text-- "Last: "] [:span#copy-status "waiting..."]]
      [:div.ty-elevated.rounded.px-3.py-2 {:style {:font-size "0.8125rem"}}
       [:span.ty-text-- "Count: "] [:span#copy-count "0"]]]
     [:script
      "(function() {
  let n = 0;
  const el = document.getElementById('event-copy');
  const status = document.getElementById('copy-status');
  const count = document.getElementById('copy-count');
  if (!el) return;
  el.addEventListener('copy-success', (e) => {
    n++;
    status.textContent = e.detail.value.substring(0, 20) + '...';
    count.textContent = n;
  });
  el.addEventListener('copy-error', (e) => {
    status.textContent = 'Error: ' + e.detail.error.message;
  });
})();"]])
   (code-block "const copy = document.querySelector('ty-copy');
copy.addEventListener('copy-success', (e) => {
  showToast(`Copied: ${e.detail.value}`);
  analytics.track('copy', { field: copy.label });
});
copy.addEventListener('copy-error', (e) => {
  showFallback(copy.value); // prompt manual selection
});" "javascript")])

(defn advanced-examples []
  (doc-section "Advanced Examples"
               [:div.space-y-6
                (advanced-api-keys-dashboard)
                (advanced-event-handling)]))

;; ============================================================================
;; Best Practices
;; ============================================================================

(defn- practice-column [flavor icon-circle icon-item title items]
  [:div
   [:div.flex.items-center.gap-2.mb-3
    [:ty-icon {:class [(str "ty-text-" flavor)] :name icon-circle :size "16"}]
    [:span {:class [(str "ty-text-" flavor "+")]
            :style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} title]]
   [:div.space-y-2
    (for [text items]
      [:div.flex.items-start.gap-2
       [:ty-icon.mt-px {:class [(str "ty-text-" flavor)] :name icon-item :size "14"}]
       [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]])

(defn best-practices []
  (doc-section "Best Practices"
               [:div.ty-elevated.rounded-lg.p-5
                [:div.grid.gap-6
                 {:style {:grid-template-columns "repeat(auto-fill, minmax(260px, 1fr))"}}
                 (practice-column "success" "check-circle" "check" "Do"
                                  ["Use format=\"code\" for tokens, commands, and connection strings"
                                   "Use semantic flavors to signal env or sensitivity"
                                   "Provide clear labels describing what the value is"
                                   "Listen to copy-success for toast notifications or analytics"
                                   "Use multiline for SSH keys, certs, or long tokens"])
                 (practice-column "danger" "x-circle" "x" "Don't"
                                  ["Use for editable content — ty-input handles that"
                                   "Expose secrets without server-side access control"
                                   "Skip copy-error handling — clipboard API can fail"
                                   "Rely on color alone to distinguish fields — add clear labels"
                                   "Use for interactive actions — that's what ty-button is for"])]]))

;; ============================================================================
;; Page
;; ============================================================================

(defn view []
  (docs-page
   (component-header "ty-copy"
                     "Read-only field with one-click copy-to-clipboard. Perfect for API keys, tokens, URLs, and install commands. Icon animates copy → check on success.")
   (api-reference)
   (examples)
   (sizes)
   (semantic-flavors)
   (advanced-examples)
   (best-practices)))
