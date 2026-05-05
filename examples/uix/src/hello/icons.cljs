(ns hello.icons
  (:require
   [tyrell.icons :as icons]
   [tyrell.lucide :as lucide]))

;; Wrap in a function so we can call it explicitly from `init` AFTER
;; `tyrell-components` (the npm side-effect that sets `window.tyIcons`) has
;; finished loading. Calling at top-level can race with module load order.
(defn register! []
  (icons/register!
   {;; Form icons
  :user           lucide/user
  :mail           lucide/mail
  :phone          lucide/phone
  :message-circle lucide/message-circle
  :send           lucide/send
  :check          lucide/check
  :x              lucide/x
  :alert-circle   lucide/alert-circle

  ;; Navigation icons
  :home           lucide/home
  :forms          lucide/file-text
  :settings       lucide/settings

  ;; Layout and UI icons
  :menu           lucide/menu
  :sun            lucide/sun
  :moon           lucide/moon
  :edit           lucide/edit
  :square         lucide/square
  :grid           lucide/grid-3x3
  :layers         lucide/layers
  :play           lucide/play
  :code           lucide/code-2
  :zap            lucide/zap
  :palette        lucide/palette

  ;; Modal and popup icons
  :modal          lucide/square
  :popup          lucide/layers
  :eye            lucide/eye
  :eye-off        lucide/eye-off
  :save           lucide/save
  :download       lucide/download
  :upload         lucide/upload
  :trash-2        lucide/trash-2
  :info           lucide/info
  :info-circle    lucide/info
  :warning        lucide/alert-triangle
  :shield         lucide/shield
  :bell           lucide/bell
  :star           lucide/star
  :heart          lucide/heart
  :bookmark       lucide/bookmark
  :plus           lucide/plus
  :minus          lucide/minus
  :more-horizontal lucide/more-horizontal
  :external-link  lucide/external-link}))
