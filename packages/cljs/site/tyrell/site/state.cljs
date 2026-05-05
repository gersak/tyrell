(ns tyrell.site.state)

(defonce state
  (atom {:theme "dark"
         :mobile-menu-open false

         ;; Navigation collapsible sections
         ;; Can be nil, :quickstart, or :components
         :navigation.section/open :quickstart

         ;; Resize observer - element sizes by ID
         :element-sizes {}

         ;; Command palette search state
         :search {:open false
                  :query ""
                  :results []
                  :selected-index 0}

         ;; Table of Contents state
         :toc {:headings []      ;; [{:id "api" :text "API Reference" :level 2}]
               :active-id nil}   ;; Currently visible heading

         ;; User profile state
         :user-profile {:avatar-modal-open false
                        :form-data {:first-name "John"
                                    :last-name "Doe"
                                    :email "john.doe@example.com"
                                    :phone "+1 (555) 123-4567"
                                    :job-title "Senior Software Developer"
                                    :company "TechCorp Inc."
                                    :bio "Passionate software developer with 8+ years of experience building web applications. Specializes in ClojureScript, React, and modern web technologies."
                                    :skills "ClojureScript, React, TypeScript, Node.js, PostgreSQL"
                                    :country "us"
                                    :timezone "pst"
                                    :language "en"
                                    :theme-preference "auto"}}

         ;; Event booking state with comprehensive demo data
         :event-booking {:confirmation-modal-open false
                         ;; Pre-select a date 5 days from now to show calendar highlighting
                         :selected-date {:year 2024
                                         :month 12
                                         :day 28}
                         ;; Pre-select a popular time slot
                         :selected-time "10:00 AM"
                         ;; Pre-select some popular services to showcase multiselect
                         :selected-services #{"av-equipment" "catering"}
                         :service-quantities {} ; Map of service-id -> quantity
                         ;; Set a realistic attendee count
                         :attendee-count 15
                         ;; Comprehensive booking form data
                         :booking-data {:event-type "workshop"
                                        :duration "240" ; 4 hours for a workshop
                                        :contact-name "Alex Martinez"
                                        :contact-email "alex.martinez@techconference.org"
                                        :special-requests "We'll need extra power outlets for laptops and a presentation setup with dual screens. Please ensure the room has good natural lighting for our video recording. Also, we'd appreciate having a coffee station set up for the afternoon break.\n\nThis is a technical workshop on modern web development, so reliable high-speed internet is crucial. If possible, we'd like the room arranged in a U-shape to facilitate group discussions and hands-on exercises."}}

         ;; Wizard prototype state
         :wizard-prototype {:active-step "welcome"
                            :completed-steps #{}}
         :wizard-linear false

         ;; Contact form state
         :contact-form {:form-data {:full-name "Sarah Chen"
                                    :email "sarah.chen@designstudio.com"
                                    :company "Creative Design Studio"
                                    :subject "Partnership Inquiry for Web Component Library"
                                    :message "Hi there! I'm reaching out on behalf of Creative Design Studio. We've been exploring modern web component libraries for our upcoming client projects, and Ty Components caught our attention with its elegant design system and ClojureScript foundation.\n\nWe're particularly interested in:\n• The semantic color system and automatic dark/light theme support\n• Professional form components with real-time validation\n• Integration possibilities with our existing React projects\n\nWould you be open to discussing a potential partnership? We work with several Fortune 500 companies who might benefit from Ty's component library. We'd love to schedule a call to explore collaboration opportunities.\n\nLooking forward to hearing from you!\n\nBest regards,\nSarah"
                                    :priority "high"
                                    :department #{"partnership" "sales"}
                                    :newsletter-consent true}
                        :validation-errors {}
                        :touched-fields #{}
                        :is-submitting false
                        :submission-status nil ; :success, :error, or nil
                        :submission-message ""
                        :success-modal-open false
                        :submitted-data nil}}))
