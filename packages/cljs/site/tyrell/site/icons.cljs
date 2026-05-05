(ns tyrell.site.icons
  "Icon registration for the site application using tyrell.icons helper"
  (:require [tyrell.fav6.brands :as fav6-brands]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

(def clojure
  "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"800px\" height=\"800px\" viewBox=\"0 0 32 32\"><title>file_type_clojure</title><path d=\"M16,2A14,14,0,1,0,30,16,14.016,14.016,0,0,0,16,2\" style=\"fill:#fff\"/><path d=\"M15.488,16.252c-.126.273-.265.579-.408.9A22.963,22.963,0,0,0,13.8,20.605a5.181,5.181,0,0,0-.119,1.155c0,.174.009.356.024.542a6.658,6.658,0,0,0,4.413.067,3.966,3.966,0,0,1-.44-.466c-.9-1.146-1.4-2.827-2.194-5.652\" style=\"fill:#91dc47\"/><path d=\"M12.169,10.556a6.677,6.677,0,0,0-.077,10.881c.411-1.71,1.44-3.276,2.983-6.415-.092-.252-.2-.527-.313-.817a10.207,10.207,0,0,0-1.6-2.882,4.439,4.439,0,0,0-1-.767\" style=\"fill:#91dc47\"/><path d=\"M21.84,23.7a10.877,10.877,0,0,1-2.257-.471A8.036,8.036,0,0,1,10.716,9.982a5.9,5.9,0,0,0-1.4-.171c-2.358.022-4.848,1.327-5.884,4.852a6.606,6.606,0,0,0-.074,1.361,12.649,12.649,0,0,0,23,7.274,14.737,14.737,0,0,1-3.448.459A8.881,8.881,0,0,1,21.84,23.7\" style=\"fill:#63b132\"/><path d=\"M19.463,21.244a3.53,3.53,0,0,0,.5.172A6.69,6.69,0,0,0,22.7,16.023h0a6.681,6.681,0,0,0-8.79-6.348c1.358,1.548,2.011,3.761,2.643,6.181v0s.2.673.547,1.562a15.434,15.434,0,0,0,1.363,2.788,2.924,2.924,0,0,0,1,1.036\" style=\"fill:#90b4fe\"/><path d=\"M16.013,3.372A12.632,12.632,0,0,0,5.731,8.656a6.425,6.425,0,0,1,3.48-1.009,6.8,6.8,0,0,1,3.182.772c.134.077.261.16.386.246a8.038,8.038,0,0,1,11.273,7.358h0a8.013,8.013,0,0,1-2.391,5.719,9.871,9.871,0,0,0,1.143.064,6.24,6.24,0,0,0,4.051-1.263,5.348,5.348,0,0,0,1.7-2.906A12.632,12.632,0,0,0,16.013,3.372\" style=\"fill:#5881d8\"/></svg>")

;; Brand silhouettes — currentColor so they harmonize with surrounding text.

(def typescript
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M3 3h18v18H3V3zm9.7 12.5v2.4c.4.2.8.3 1.4.4.5.1 1 .1 1.5.1.5 0 1 0 1.4-.1.5-.1.9-.3 1.2-.5.4-.2.6-.5.8-.9.2-.4.3-.8.3-1.4 0-.4-.1-.7-.2-1-.1-.3-.3-.6-.5-.8-.2-.2-.5-.4-.8-.6-.3-.2-.6-.3-1-.5-.3-.1-.5-.2-.7-.3l-.6-.3c-.2-.1-.3-.2-.4-.4-.1-.1-.1-.3-.1-.5s0-.3.1-.4c.1-.1.2-.2.4-.3.2-.1.4-.2.6-.2.2 0 .5-.1.8-.1h.7c.2 0 .5.1.7.1.2.1.5.2.7.3.2.1.4.2.6.4v-2.3c-.4-.1-.7-.2-1.1-.3-.4-.1-.9-.1-1.4-.1-.5 0-1 0-1.4.1-.5.1-.9.3-1.2.5-.3.2-.6.5-.8.9-.2.4-.3.8-.3 1.3 0 .6.2 1.1.5 1.6.4.4 1 .8 1.7 1.1.3.1.6.2.8.4.3.1.5.2.6.4.2.1.3.3.4.4.1.1.1.3.1.5s0 .3-.1.4c-.1.1-.2.3-.4.4-.2.1-.4.2-.6.2-.2.1-.5.1-.9.1-.5 0-1-.1-1.5-.3-.4-.1-.9-.4-1.3-.7zm-3.4-3.7H12v-2H4.7v2H7v6.6h2.3v-6.6z\"/></svg>")

(def svelte
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 98 118\" fill=\"currentColor\"><path d=\"M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.5 8.9.6 18 5.7 25.4 11 15.7 32.6 20.3 48.2 10.4l27.5-17.5c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.6-9-.5-18.1-5.7-25.5M40.9 103.9c-8.9 2.3-18.2-1.2-23.4-8.7-3.1-4.4-4.3-9.9-3.4-15.3.1-.9.3-1.7.6-2.6l.5-1.5 1.4 1c3.2 2.3 6.7 4.1 10.5 5.2l1 .3-.1 1c-.1 1.4.3 2.9 1.1 4.1 1.6 2.3 4.3 3.4 7 2.6.6-.2 1.1-.4 1.7-.7L64 71.8c1.3-.8 2.3-2.1 2.6-3.6.3-1.6-.1-3.3-1-4.6-1.6-2.3-4.3-3.4-7-2.6-.6.2-1.1.4-1.7.7l-10.5 6.7c-1.7 1.1-3.7 1.9-5.8 2.4-8.9 2.3-18.2-1.2-23.4-8.7-3.1-4.4-4.3-9.9-3.4-15.3.9-5.3 4.1-9.9 8.7-12.7l27.5-17.5c1.7-1.1 3.7-1.9 5.8-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.1 4.4 4.3 9.9 3.4 15.3-.1.9-.3 1.7-.6 2.6l-.5 1.5-1.4-1c-3.2-2.3-6.7-4.1-10.5-5.2l-1-.3.1-1c.1-1.4-.3-2.9-1.1-4.1-1.6-2.3-4.3-3.4-7-2.6-.6.2-1.1.4-1.7.7L34.1 46.2c-1.3.8-2.3 2.1-2.6 3.6-.3 1.6.1 3.3 1 4.6 1.6 2.3 4.3 3.4 7 2.6.6-.2 1.1-.4 1.7-.7l10.5-6.7c1.7-1.1 3.7-1.9 5.8-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.1 4.4 4.3 9.9 3.4 15.3-.9 5.3-4.1 9.9-8.7 12.7l-27.5 17.5c-1.7 1.1-3.7 1.9-5.8 2.5\"/></svg>")

(def astro
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 311\" fill=\"currentColor\"><path d=\"M81.504 235.815c-15.107-13.793-19.516-42.692-13.226-63.62 10.902 13.232 26.014 17.426 41.664 19.79 24.166 3.65 47.9 2.282 70.345-8.802 2.568-1.27 4.943-2.961 7.762-4.682.001-.084.013-.149.029-.211a.46.46 0 0 1 .07-.146c1.93 5.819 2.428 11.69 1.728 17.665-1.7 14.553-8.965 25.793-20.502 34.363-4.612 3.43-9.493 6.495-14.255 9.722-14.626 9.916-18.583 21.545-13.085 38.41.131.408.249.817.547 1.812-7.546-3.376-13.062-8.288-17.265-14.762-4.444-6.835-6.556-14.4-6.668-22.605-.054-3.992-.054-8.022-.594-11.957-1.32-9.594-5.846-13.882-14.327-14.129-8.703-.253-15.589 5.13-17.412 13.59-.139.65-.339 1.292-.539 2.055l.018.013-3.59-.418z\"/><path d=\"M0 209.354s52.927-25.78 105.998-25.78l40.006-123.806c1.498-5.987 5.872-10.046 10.808-10.046s9.31 4.06 10.806 10.046l40.006 123.806C262.2 183.574 314 209.354 314 209.354L210.07 0H103.93L0 209.354z\" transform=\"translate(0 0)\"/></svg>")

#_(def ty-logo
    "<svg width=\"48\" height=\"24\" viewBox=\"0 0 48 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
<path d=\"M41.9588 19.2415V15.8812C41.7226 16.652 41.1209 17.0374 40.1537 17.0374H38.956C38.1125 17.0374 37.4939 16.8628 37.1003 16.5135C36.7067 16.1522 36.5099 15.5138 36.5099 14.5985V5.8183H38.5511V15.014C38.5511 15.1826 38.6298 15.2669 38.7873 15.2669H41.9588L41.9419 5.8183H43.9831L44 18.573C44 19.5727 43.7695 20.2833 43.3084 20.7049C42.8585 21.1264 42.1275 21.3372 41.1153 21.3372H36.8473V19.4944H41.7395C41.8857 19.4944 41.9588 19.4101 41.9588 19.2415Z\" fill=\"currentColor\"/>
<path d=\"M35.4451 7.53462H33.0327V14.7972C33.0327 14.9538 33.1058 15.0321 33.252 15.0321H35.4451V16.8748H33.8762C32.864 16.8748 32.1274 16.6641 31.6662 16.2425C31.2164 15.821 30.9915 15.1164 30.9915 14.1288V7.53462H29.7768V5.81833H30.9915V3H33.0327V5.81833H35.4451V7.53462Z\" fill=\"currentColor\"/>
<path d=\"M27.8988 16.8749H25.4476L19.7178 3.5387C19.675 3.43896 19.743 3.32522 19.8455 3.32522H21.717C21.9366 3.32522 22.1361 3.46209 22.2278 3.67571L27.8988 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M27.8988 16.8749H25.4476L19.7178 3.5387C19.675 3.43896 19.743 3.32522 19.8455 3.32522H21.717C21.9366 3.32522 22.1361 3.46209 22.2278 3.67571L27.8988 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M4.00001 16.8749H6.45117L12.1809 3.5387C12.2238 3.43896 12.1558 3.32522 12.0532 3.32522H10.1818C9.9622 3.32522 9.76271 3.46209 9.67093 3.67571L4.00001 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M4.00001 16.8749H6.45117L12.1809 3.5387C12.2238 3.43896 12.1558 3.32522 12.0532 3.32522H10.1818C9.9622 3.32522 9.76271 3.46209 9.67093 3.67571L4.00001 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M24.2221 16.8749H7.67677L11.8131 7.65189C11.9068 7.44316 12.1038 7.3104 12.32 7.3104H19.5788C19.795 7.3104 19.9921 7.44316 20.0857 7.65189L24.2221 16.8749Z\" fill=\"currentColor\"/>
</svg>")

(def ty-logo
  "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"67\" height=\"24\" viewBox=\"0 0 67 24\" fill=\"none\">
<path d=\"M27.8988 16.8749H25.4476L19.7178 3.53871C19.675 3.43896 19.743 3.32523 19.8455 3.32523H21.717C21.9366 3.32523 22.1361 3.4621 22.2279 3.67572L27.8988 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M27.8988 16.8749H25.4476L19.7178 3.53871C19.675 3.43896 19.743 3.32523 19.8455 3.32523H21.717C21.9366 3.32523 22.1361 3.4621 22.2279 3.67572L27.8988 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M4.00003 16.8749H6.45119L12.181 3.53871C12.2238 3.43896 12.1558 3.32523 12.0533 3.32523H10.1818C9.96221 3.32523 9.76272 3.4621 9.67094 3.67572L4.00003 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M4.00003 16.8749H6.45119L12.181 3.53871C12.2238 3.43896 12.1558 3.32523 12.0533 3.32523H10.1818C9.96221 3.32523 9.76272 3.4621 9.67094 3.67572L4.00003 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M24.2221 16.8749H7.67676L11.8131 7.65189C11.9067 7.44317 12.1038 7.31041 12.32 7.31041H19.5788C19.795 7.31041 19.9921 7.44317 20.0857 7.65189L24.2221 16.8749Z\" fill=\"currentColor\"/>
<path d=\"M59.3609 16.7968V6H61V16.7968H59.3609Z\" fill=\"currentColor\"/>
<path d=\"M55.6478 16.7968V6H57.2869V16.7968H55.6478Z\" fill=\"currentColor\"/>
<path d=\"M50.3949 16.8865C49.5799 16.8865 48.9887 16.7369 48.6215 16.4377C48.2632 16.1385 48.084 15.6342 48.084 14.9246V10.706C48.084 9.99643 48.2408 9.50916 48.5543 9.24416C48.8678 8.97061 49.4052 8.83383 50.1665 8.83383H51.8191C52.5894 8.83383 53.1358 8.97061 53.4582 9.24416C53.7896 9.50916 53.9553 9.99643 53.9553 10.706V13.7706H49.7232V15.4119C49.7232 15.523 49.7814 15.5786 49.8978 15.5786H53.7403V16.8865H50.3949ZM49.8978 10.0905C49.7814 10.0905 49.7232 10.1503 49.7232 10.27V12.6422H52.3296V10.27C52.3296 10.1503 52.2714 10.0905 52.155 10.0905H49.8978Z\" fill=\"currentColor\"/>
<path d=\"M47.3379 8.83383V10.0905H45.3091C45.1837 10.0905 45.121 10.1503 45.121 10.27L45.1345 16.7968H43.5222L43.4954 8.94924H44.9464L45.0673 9.74425C45.2464 9.1373 45.7436 8.83383 46.5586 8.83383H47.3379Z\" fill=\"currentColor\"/>
<path d=\"M40.0379 18.4766V16.0915C39.8498 16.6386 39.3706 16.9122 38.6003 16.9122H37.6464C36.9747 16.9122 36.482 16.7882 36.1685 16.5403C35.855 16.2839 35.6983 15.8308 35.6983 15.1811V8.94923H37.324V15.476C37.324 15.5957 37.3867 15.6555 37.5121 15.6555H40.0379L40.0245 8.94923H41.6502L41.6636 18.0021C41.6636 18.7116 41.48 19.216 41.1128 19.5152C40.7545 19.8144 40.1723 19.964 39.3662 19.964H35.967V18.6561H39.8633C39.9797 18.6561 40.0379 18.5962 40.0379 18.4766Z\" fill=\"currentColor\"/>
<path d=\"M34.8503 10.1674H32.929V15.3222C32.929 15.4333 32.9873 15.4888 33.1037 15.4888H34.8503V16.7968H33.6008C32.7947 16.7968 32.208 16.6472 31.8408 16.348C31.4825 16.0488 31.3033 15.5487 31.3033 14.8477V10.1674H30.336V8.94923H31.3033V6.94888H32.929V8.94923H34.8503V10.1674Z\" fill=\"currentColor\"/>
</svg>")

(icons/register-async!
 {;; Core navigation icons
  :home lucide/home
  :user lucide/user
  :calendar lucide/calendar
  :calendar-check lucide/calendar-check
  :mail lucide/mail
  :palette lucide/palette
  :rocket lucide/rocket
  :clojure clojure
  :ty-logo ty-logo

     ;; UI controls
  :menu lucide/menu
  :x lucide/x
  :moon lucide/moon
  :sun lucide/sun
  :chevron-down lucide/chevron-down
  :chevron-right lucide/chevron-right

     ;; Component/UI icons (for docs)
  :square lucide/square
  :square-stack lucide/square-stack
  :list lucide/list
  :list-ordered lucide/list-ordered
  :message-square lucide/message-square
  :hand lucide/hand
  :tag lucide/tag
  :align-left lucide/align-left
  :type lucide/type
  :image lucide/image

     ;; Form and interaction icons
  :check lucide/check
  :check-square lucide/check-square
  :plus lucide/plus
  :minus lucide/minus
  :edit lucide/edit
  :edit-3 lucide/edit-3
  :save lucide/save
  :upload lucide/upload
  :download lucide/download
  :trash lucide/trash
  :trash-2 lucide/trash-2
  :filter lucide/filter
  :more-vertical lucide/more-vertical

     ;; Form field icons
  :building lucide/building
  :file-text lucide/file-text
  :help-circle lucide/help-circle

     ;; Status and feedback icons
  :check-circle lucide/check-circle
  :x-circle lucide/x-circle
  :alert-triangle lucide/alert-triangle
  :alert-circle lucide/alert-circle
  :circle lucide/circle
  :circle-dot lucide/circle-dot
  :toggle-left lucide/toggle-left
  :toggle-right lucide/toggle-right
  :minus-circle lucide/minus-circle
  :info lucide/info
  :info-circle lucide/circle-alert
  :heart lucide/heart
  :star lucide/star
  :lightbulb lucide/lightbulb

     ;; Additional utility icons
  :search lucide/search
  :settings lucide/settings
  :trending-up lucide/trending-up
  :globe lucide/globe
  :clock lucide/clock
  :arrow-left lucide/arrow-left
  :arrow-right lucide/arrow-right
  :bell lucide/bell
  :wifi-off lucide/wifi-off
  :database lucide/database
  :server lucide/server
  :layout lucide/layout
  :grid lucide/layout-grid
  :maximize lucide/maximize
  :accessibility lucide/accessibility

     ;; Loading and refresh icons
  :refresh-ccw lucide/refresh-ccw
  :refresh-cw lucide/refresh-cw
  :loader-2 lucide/loader-2
  :loader lucide/loader
  :send lucide/send

     ;; Contact and business icons
  :phone lucide/phone
  :map-pin lucide/map-pin
  :briefcase lucide/briefcase
  :life-buoy lucide/life-buoy
  :credit-card lucide/credit-card
  :handshake lucide/handshake

     ;; Development/Tech icons
  :file-code lucide/file-code
  :code lucide/code
  :terminal lucide/terminal
  :package lucide/package
  :sparkles lucide/sparkles
  :layers lucide/layers
  :navigation lucide/navigation
  :form-input lucide/form-input
  :book-open lucide/book-open
  :zap lucide/zap
  :feather lucide/feather
  :shuffle lucide/shuffle
  :lambda lucide/square-function
  :atom lucide/atom

     ;; Security and visibility icons
  :external-link lucide/external-link
  :eye lucide/eye
  :eye-off lucide/eye-off
  :lock lucide/lock
  :unlock lucide/unlock
  :shield lucide/shield
  :key lucide/key
  :log-in lucide/log-in
  :log-out lucide/log-out

     ;; Miscellaneous
  :brush lucide/brush
  :copy lucide/copy
  :clipboard lucide/clipboard
  :rotate-ccw lucide/rotate-ccw
  :share-2 lucide/share-2
  :box lucide/box
  :diamond lucide/diamond-plus

     ;; Framework icons from FontAwesome
  :react fav6-brands/react
  :vuejs fav6-brands/vuejs
  :js fav6-brands/js
  :html5 fav6-brands/html5
  :css3 fav6-brands/css3
  :python fav6-brands/python
  :node-js fav6-brands/node-js
  :github fav6-brands/github
  :php fav6-brands/php
  :laravel fav6-brands/laravel

     ;; Brand silhouettes (custom SVGs, currentColor)
  :typescript typescript
  :svelte svelte
  :astro astro

     ;; Additional icons
  :swords lucide/swords
  :inputs lucide/notebook-pen
  :scroll-text lucide/scroll-text

     ;; Additional content icons
  :target lucide/target
  :video lucide/video
  :utensils lucide/utensils
  :satellite-dish lucide/satellite-dish
  :car lucide/car
  :thumbs-up lucide/thumbs-up
  :coins lucide/coins
  :smartphone lucide/smartphone
  :link lucide/link
  :ruler lucide/ruler
  :monitor lucide/monitor
  :laptop lucide/laptop

     ;; Development and WIP icons
  :hammer lucide/hammer
  :wrench lucide/wrench
  :bug lucide/bug
  :git-branch lucide/git-branch
  :users lucide/users
  :scissors lucide/scissors

     ;; Export/data icons
  :file-json lucide/file-json-2
  :table lucide/table})
