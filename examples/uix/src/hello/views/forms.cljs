(ns hello.views.forms
  "Forms with native validation.

   The fields carry their rules (required, type, pattern, min-length, min/max).
   The browser checks them before `submit` fires, so the submit handlers here
   only ever see valid data: failing fields show their message in their own
   error line and the first one takes focus. The code only handles what a
   browser can't know: a server-side error, and a cross-field check
   (password confirmation) via setCustomValidity."
  (:require
    ["tyrell-react" :as ty]
    [clojure.string :as str]
    [uix.core :as uix :refer [defui $ use-state use-ref use-effect]]))

(def ^:private empty-contact
  {:name ""
   :email ""
   :phone ""
   :subject ""
   :message ""
   :priority "medium"
   :newsletter false})

(def ^:private priorities
  [["low"    "Low"    "neutral"]
   ["medium" "Medium" "primary"]
   ["high"   "High"   "warning"]
   ["urgent" "Urgent" "danger"]])

(defui section-title [{:keys [children]}]
  ($ :h3.ty-text+.text-lg.font-semibold.border-b.ty-border.pb-2 children))

(defui contact-form []
  (let [[data set-data] (use-state empty-contact)
        [server-errors set-server-errors] (use-state {})
        [loading set-loading] (use-state false)
        [sent set-sent] (use-state nil)
        ;; Bumped by Clear: the form remounts, so shown messages go with it
        [form-key set-form-key] (use-state 0)
        field! (fn [k]
                 (fn [^js e]
                   (let [v (.. e -detail -value)]
                     (set-data #(assoc % k v))
                     (set-server-errors #(dissoc % k)))))
        submit (fn [^js e]
                 ;; Only runs once every field passes its rules
                 (.preventDefault e)
                 (set-loading true)
                 (js/setTimeout
                   (fn []
                     (set-loading false)
                     (if (str/ends-with? (:email data) "@taken.com")
                       (set-server-errors {:email "We already have a ticket from this address"})
                       (set-sent data)))
                   800))
        clear (fn []
                (set-data empty-contact)
                (set-server-errors {})
                (set-sent nil)
                (set-form-key inc))]
    ($ :div
       (when sent
         ($ :div.ty-bg-success-.ty-border-success.border.rounded-lg.p-4.mb-6
            ($ :div.flex.items-center.gap-2
               ($ ty/Icon {:name "check" :class "ty-text-success++"})
               ($ :h3.ty-text-success++.font-semibold "Message sent"))
            ($ :p.ty-text-success.text-sm.mt-1
               (str "Thanks, " (:name sent) ". We'll answer at " (:email sent) "."))))

       ($ :form.ty-elevated.p-6.rounded-lg.max-w-2xl.mx-auto.space-y-6
          {:key form-key :on-submit submit}

          ($ :div.text-center.mb-6
             ($ :h2.ty-text++.text-2xl.font-bold.mb-2 "Contact Us")
             ($ :p.ty-text-.text-sm
                "Press Send with gaps to see the messages. An address ending in "
                ($ :code.font-mono "@taken.com") " gets a server-side error."))

          ($ :div.space-y-4
             ($ section-title "Personal Information")
             ($ :div.grid.grid-cols-1.md:grid-cols-2.gap-4
                ($ ty/Input {:name "name"
                             :label "Full name"
                             :placeholder "Ada Lovelace"
                             :required true
                             :min-length 2
                             :value (:name data)
                             :on-change (field! :name)})
                ($ ty/Input {:name "email"
                             :type "email"
                             :label "Email address"
                             :placeholder "you@company.com"
                             :required true
                             :value (:email data)
                             :error (:email server-errors)
                             :on-change (field! :email)}))
             ($ ty/Input {:name "phone"
                          :type "tel"
                          :label "Phone (optional)"
                          :placeholder "+1 555 123 4567"
                          :pattern "[0-9+ ]{7,}"
                          :value (:phone data)
                          :on-change (field! :phone)}))

          ($ :div.space-y-4
             ($ section-title "Your Message")
             ($ :div.grid.grid-cols-1.md:grid-cols-3.gap-4
                ($ :div.md:col-span-2
                   ($ ty/Input {:name "subject"
                                :label "Subject"
                                :placeholder "What's it about?"
                                :max-length 80
                                :value (:subject data)
                                :on-change (field! :subject)}))
                ($ ty/Select {:name "priority"
                              :label "Priority"
                              :value (:priority data)
                              :on-change #(set-data (fn [d] (assoc d :priority (or (.. ^js % -detail -value) "medium"))))}
                   (for [[v label flavor] priorities]
                     ($ ty/Option {:key v :value v :flavor flavor} label))))
             ($ ty/Textarea {:name "message"
                             :label "Message"
                             :rows 5
                             :required true
                             :placeholder "Please describe your inquiry in detail..."
                             :value (:message data)
                             :on-change (field! :message)})
             ($ :div.text-xs.ty-text-.text-right
                (str (count (:message data)) " characters")))

          ($ :div.space-y-4
             ($ section-title "Preferences")
             ;; ty-checkbox is the tick only; a wrapping <label> names it
             ($ :label.flex.items-center.gap-3.cursor-pointer
                ($ ty/Checkbox {:name "newsletter"
                                :checked (:newsletter data)
                                :on-change #(set-data (fn [d] (assoc d :newsletter (.. ^js % -detail -checked))))})
                ($ :span.ty-text.text-sm
                   "Subscribe to our newsletter for updates and special offers")))

          ($ :div.flex.flex-col.sm:flex-row.gap-3.pt-4.border-t.ty-border
             ($ ty/Button {:type "button"
                           :flavor "neutral"
                           :appearance "outlined"
                           :on-click clear}
                ($ ty/Icon {:slot "start" :name "x"})
                "Clear")
             ($ :div.sm:ml-auto
                ($ ty/Button {:type "submit"
                              :flavor "primary"
                              :loading loading}
                   ($ ty/Icon {:slot "start" :name "send"})
                   (if loading "Sending..." "Send message"))))))))

(defui account-form []
  "Every native rule on one form, plus a cross-field check."
  (let [[password set-password] (use-state "")
        [confirm set-confirm] (use-state "")
        [created set-created] (use-state nil)
        confirm-ref (use-ref nil)]
    ;; Passwords that differ make the confirm field invalid, so the form
    ;; won't submit and the message shows like any other rule's.
    (use-effect
      (fn []
        (when-let [^js el @confirm-ref]
          (.setCustomValidity el (if (and (seq confirm) (not= password confirm))
                                   "Passwords don't match"
                                   ""))))
      [password confirm])
    ($ :form.ty-elevated.p-6.rounded-lg.max-w-2xl.mx-auto.space-y-4
       {:on-submit (fn [^js e]
                     (.preventDefault e)
                     (set-created (-> (js/FormData. (.-currentTarget e))
                                      (.get "username"))))}
       ($ :div
          ($ :h2.ty-text++.text-xl.font-bold "Create an account")
          ($ :p.ty-text-.text-sm.mt-1
             "pattern, min-length, min/max, type=\"url\" and a cross-field check with setCustomValidity."))
       ($ :div.grid.grid-cols-1.md:grid-cols-2.gap-4
          ($ ty/Input {:name "username"
                       :label "Username"
                       :placeholder "ada_l"
                       :required true
                       :min-length 3
                       :max-length 20
                       :pattern "[a-z0-9_]+"
                       :too-short-message "At least {minlength} characters, please"})
          ($ ty/Input {:name "age"
                       :type "number"
                       :label "Age"
                       :required true
                       :min 13
                       :max 120})
          ($ ty/Input {:name "password"
                       :type "password"
                       :label "Password"
                       :required true
                       :min-length 8
                       :on-change #(set-password (.. ^js % -detail -value))})
          ($ ty/Input {:ref confirm-ref
                       :name "confirm"
                       :type "password"
                       :label "Confirm password"
                       :required true
                       :on-change #(set-confirm (.. ^js % -detail -value))}))
       ($ ty/Input {:name "website"
                    :type "url"
                    :label "Website (optional)"
                    :placeholder "https://example.com"})
       ($ :div.flex.items-center.gap-3
          ($ ty/Button {:type "submit" :flavor "primary"}
             ($ ty/Icon {:slot "start" :name "check"})
             "Create account")
          (when created
            ($ :span.ty-text-success.text-sm (str "Created " created)))))))

(defui view []
  ($ :div.space-y-8
     ($ :div.text-center
        ($ :h1.ty-text++.text-3xl.font-bold.mb-2 "Form Examples")
        ($ :p.ty-text-.text-lg.max-w-2xl.mx-auto
           "No validation code: the fields carry their rules and the browser checks them before submit."))
     ($ contact-form)
     ($ account-form)))
