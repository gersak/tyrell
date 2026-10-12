(ns tyrell.site.state)

(defonce state
  (atom {:theme "dark"
         :mobile-menu-open false

         ;; Resize observer - element sizes by ID
         :element-sizes {}

         ;; Theming page — interactive font/radius picker
         :typography-picker {:font "sans" :radius "8"}

         :search {:open false
                  :query ""
                  :results []
                  :selected-index 0}

         :toc {:headings []      ;; [{:id "api" :text "API Reference" :level 2}]
               :active-id nil}   ;; Currently visible heading
         ;; Landing examples seed their own state via tyrell.site.views.kit/init!
         }))
