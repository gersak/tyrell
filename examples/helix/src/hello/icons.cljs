(ns hello.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

;; Register only the icons referenced by the app — Closure :advanced removes the
;; rest. Add an icon here AND import its def to get it into the bundle.
(defn register! []
  (icons/register!
    {;; Form & status
     :mail        lucide/mail
     :send        lucide/send
     :user        lucide/user
     :phone       lucide/phone
     :check       lucide/check
     :x           lucide/x
     :sparkles    lucide/sparkles
     :rocket      lucide/rocket
     :calendar    lucide/calendar
     :briefcase   lucide/briefcase
     :info        lucide/info
     :bell        lucide/bell
     :star        lucide/star

     ;; Skill tag icons
     :code        lucide/code-2
     :palette     lucide/palette
     :database    lucide/database
     :cloud       lucide/cloud
     :git-branch  lucide/git-branch

     ;; Action icons
     :refresh     lucide/refresh-cw
     :alert       lucide/alert-circle
     :external    lucide/external-link
     :help        lucide/help-circle}))
